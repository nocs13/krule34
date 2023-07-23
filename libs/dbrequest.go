package libs

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"strconv"
	"time"
)

type DbRequest struct {
	Addr string
	Port int32
	Sid  string
	Src  string
	Cck  http.Cookie

	user string
	pass string
	port string
}

type kgetvalues struct {
	Container string
	Values    []string
	Keys      map[string]string
}

type ksetvalues struct {
	Container string
	Values    map[string]string
	Keys      map[string]string
}

var proto = "https://"

func (self *DbRequest) sendRequest(url string, data []byte) []byte {

	bodyReader := bytes.NewReader(data)

	req, err := http.NewRequest(http.MethodPost, url, bodyReader)

	if err != nil {
		log.Println("Send request error: ", err.Error())
		return nil
	}

	req.AddCookie(&self.Cck)

	req.Header.Set("Content-Type", "application/json")

	client := http.Client{Timeout: 30 * time.Second}

	resp, err := client.Do(req)

	if err != nil {
		log.Println("Get responce error: ", err.Error())
		return nil
	}

	if resp.StatusCode != 200 {
		log.Println("Get responce error: Invalid response estatus.")
		return nil
	}

	b, err := io.ReadAll(resp.Body)

	if err != nil {
		log.Println("Get response read body error: ", err.Error())
		return nil
	}

	return b
}

func (self *DbRequest) OpenSession(addr string, port int32, uname string, pass string) bool {
	var tport string = ""

	if port > 0 {
		tport = ":" + strconv.Itoa(int(port))
	}

	url := proto + addr + tport + "/dbopen"

	log.Print("Open database session: ", url)

	self.Addr = addr
	self.Port = port
	self.user = uname
	self.pass = pass
	self.port = tport

	creds := map[string]string{"Name": uname, "Pass": pass}

	jsonBody, err := json.Marshal(creds)

	if err != nil {
		log.Println("DB open error: ", err.Error())
		return false
	}

	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	bodyResponce := self.sendRequest(url, jsonBody)

	if bodyResponce == nil {
		log.Println("DB open error: invalid response.")
		return false
	}

	var data map[string]string

	err = json.Unmarshal(bodyResponce, &data)

	if err != nil {
		log.Println("DB open error: ", err.Error())
		return false
	}

	sid, ok := data["Sid"]

	if ok != true {
		log.Println("DB open error: No sid in responce.")
		return false
	}

	self.Sid = sid
	self.Cck = http.Cookie{Name: "dbsid", Value: sid, MaxAge: 100000}

	return true
}

func (self *DbRequest) CloseSession() bool {
	url := proto + self.Addr + self.port + "/dbclose"
	Sid := map[string]string{"sid": self.Sid}

	jsonBody, err := json.Marshal(Sid)

	if err != nil {
		log.Println("Session close error: ", err.Error())
		return false
	}

	var data map[string]string

	err = json.Unmarshal(self.sendRequest(url, jsonBody), &data)

	if err != nil {
		log.Println("Session close error: ", err.Error())
		return false
	}

	r, ok := data["Closed"]

	if ok != true {
		log.Println("Session close error: No sid in responce.")
		return false
	}

	if r != "True" {
		log.Println("DB open error: No sid closed.")
		return false
	}

	self.Sid = ""
	self.user = ""
	self.pass = ""

	return true
}

func (self *DbRequest) UpdateSession() bool {
	url := proto + self.Addr + self.port + "/dbopen"
	creds := map[string]string{"Name": self.user, "Pass": self.pass}

	log.Println("DB update session: ", creds)

	jsonBody, err := json.Marshal(creds)

	if err != nil {
		log.Println("DB update error: ", err.Error())
		return false
	}

	var data map[string]string

	err = json.Unmarshal(self.sendRequest(url, jsonBody), &data)

	if err != nil {
		log.Println("DB update error: ", err.Error())
		return false
	}

	sid, ok := data["sid"]

	if ok != true {
		log.Println("DB update error: No sid in responce.")
		return false
	}

	self.Sid = sid
	self.Cck = http.Cookie{Name: "dbsid", Value: sid, MaxAge: 100000}

	return true
}

func (self *DbRequest) ValidSession() bool {
	url := proto + self.Addr + self.port + "/dbvalid"
	Sid := map[string]string{"sid": self.Sid}

	log.Println("Session valid sid: ", Sid)

	jsonBody, err := json.Marshal(Sid)

	if err != nil {
		log.Println("Session valid error: ", err.Error())
		return false
	}

	var data map[string]string

	err = json.Unmarshal(self.sendRequest(url, jsonBody), &data)

	if err != nil {
		log.Println("Session valid error: ", err.Error())
		return false
	}

	r, ok := data["Valid"]

	if ok != true {
		log.Println("Session valid error: No valid in responce.")
		return false
	}

	if r != "True" {
		log.Println("Session valid error: Session closed.")
		return false
	}

	return true
}

func (self *DbRequest) GetValues(doc string, vals []string, keys map[string]string) []string {
	url := proto + self.Addr + self.port + "/valuesget"

	log.Println("Get values ", vals, keys)

	jdata := kgetvalues{doc, vals, keys}

	jsonBody, err := json.Marshal(jdata)

	if err != nil {
		log.Println("Get values marshal error: ", err.Error())
		return nil
	}

	var result []string

	err = json.Unmarshal(self.sendRequest(url, jsonBody), &result)

	if err != nil {
		log.Println("Get values decode error: ", err.Error())
		return nil
	}

	log.Println("Get values data: ", result)

	return result
}

func (self *DbRequest) SetValues(doc string, vals map[string]string, keys map[string]string) bool {
	url := proto + self.Addr + self.port + "/valuesset"

	jdata := ksetvalues{doc, vals, keys}

	jsonBody, err := json.Marshal(jdata)

	if err != nil {
		log.Println("Set values error: ", err.Error())
		return false
	}

	var data map[string]string

	err = json.Unmarshal(self.sendRequest(url, jsonBody), &data)

	if err != nil {
		log.Println("Set values decode error: ", err.Error())
		return false

	}

	log.Println("Set values responce: ", data)

	if data != nil && len(data) > 0 {
		err, ok := data["error"]

		if ok == true {
			log.Println("Set values responce failed: ", err)
			return false
		}
	}

	return true
}

func (self *DbRequest) DelValues(doc string, vals []string, keys map[string]string) bool {
	url := proto + self.Addr + self.port + "/valuesdel"

	jdata := kgetvalues{doc, vals, keys}

	jsonBody, err := json.Marshal(jdata)

	if err != nil {
		log.Println("Del values error: ", err.Error())
		return false
	}

	bodyReader := bytes.NewReader(jsonBody)

	req, err := http.NewRequest(http.MethodPost, url, bodyReader)

	if err != nil {
		log.Println("Del values error: ", err.Error())
		return false
	}

	req.AddCookie(&self.Cck)
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)

	if err != nil {
		log.Println("Del values error: ", err.Error())
		return false
	}

	if resp.StatusCode != 200 {
		log.Println("Del values responce error: Invalid status.")
		return false
	}

	var data map[string]string

	json.NewDecoder(resp.Body).Decode(&data)

	if err != nil {
		log.Println("Del values error: ", err.Error())
		return false
	}

	if len(data) != 0 {
		return false
	}

	return true
}

func (self *DbRequest) HasValues(doc string, vals []string, keys map[string]string) bool {
	url := proto + self.Addr + self.port + "/valueshas"

	jdata := kgetvalues{doc, vals, keys}

	jsonBody, err := json.Marshal(jdata)

	if err != nil {
		log.Println("Has values error: ", err.Error())
		return false
	}

	bodyReader := bytes.NewReader(jsonBody)

	req, err := http.NewRequest(http.MethodPost, url, bodyReader)

	if err != nil {
		log.Println("Has values error: ", err.Error())
		return false
	}

	req.AddCookie(&self.Cck)
	req.Header.Set("Content-Type", "application/json")

	client := http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Do(req)

	if err != nil {
		log.Println("Has values error: ", err.Error())
		return false
	}

	if resp.StatusCode != 200 {
		log.Println("Has values responce error: Invalid status.")
		return false
	}

	var data map[string]string

	json.NewDecoder(resp.Body).Decode(&data)

	if err != nil {
		log.Println("Has values error: ", err.Error())
		return false
	}

	if len(data) != 0 {
		return false
	}

	return true
}
