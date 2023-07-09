package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"

	"krule34/libs"
	kmongo "krule34/libs/kmongo"
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// FnRoute is ...
type FnRoute func(http.ResponseWriter, *http.Request)

// WebRoute is ...
type WebRoute struct {
	id     string
	handle FnRoute
}

// WebHandler is ...
type WebHandler struct {
	mu sync.Mutex // guards n
	n  int

	routes []*WebRoute
}

type WebConn struct {
	net.Conn
}

func (c WebConn) Write(b []byte) (int, error) {
	os.Stdout.Write(b)
	return c.Conn.Write(b)
}

type listener struct {
	net.Listener
}

func (l listener) Accept() (net.Conn, error) {
	c, err := l.Listener.Accept()
	return WebConn{c}, err
}

var dbuser string
var dbpass string
var dbaddr string

// var dbrequest *libs.DbRequest = nil
var dbrequest *kmongo.DbRequest = nil

func (h *WebHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	//h.mu.Lock()

	log.Println("Run web handler " + r.URL.Path)

	var url = r.URL.Path

	if len(url) > 7 {
		log.Println("Run web  " + r.URL.Path[0:8])
	}

	if len(url) > len("/static/") && url[0:8] == "/static/" {
		log.Println("Handle static")
		handleStatic(w, r)
	} else if len(url) >= len("/artist/") && url[0:8] == "/artist/" {
		log.Println("Handle artist")
		handleArtist(w, r)
	} else if len(url) >= len("/character/") && url[0:11] == "/character/" {
		log.Println("Handle artist")
		handleCharacter(w, r)
	} else if len(url) >= len("/k34tag/") && url[0:8] == "/k34tag/" {
		log.Println("Handle artist")
		handleCharacter(w, r)
	} else if len(url) > len("/images/") && url[0:8] == "/images/" {
		log.Println("Handle images")
		handleGetImage(w, r)
	} else if len(url) > len("/video/") && url[0:7] == "/video/" {
		log.Println("Handle video")
		handleGetVideo(w, r)
	} else if len(url) > len("/thumbnails/") && url[0:12] == "/thumbnails/" {
		log.Println("Handle thumbnails")
		handleGetImage(w, r)
	} else {
		log.Println("routes count " + strconv.Itoa(len(h.routes)))

		for _, rt := range h.routes {
			if rt.id == url {
				rt.handle(w, r)
			}
		}
	}
	//defer h.mu.Unlock()
}

// Add is ...
func (h *WebHandler) Add(id string, handle FnRoute) {
	var p = new(WebRoute)

	p.id = id
	p.handle = handle

	h.routes = append(h.routes, p)
}

func getValue(r *http.Request, key string) string {
	keys, ok := r.URL.Query()[key]

	if !ok || len(keys[0]) < 1 {
		log.Println("Url query key " + key + " is missing.")

		return ""
	}

	log.Println("Url query key " + key + " value is " + keys[0])

	return keys[0]
}

func getFormValue(r *http.Request, key string) string {
	return r.PostFormValue(key)
}

func hostOnly(addr string) string {
	log.Println("hostOnly: ", addr)

	var host string = ""

	host, _, err := net.SplitHostPort(addr)

	if err != nil || host == "::1" {
		return "127.0.0.1"
	}

	return host
}

func gen_uid() (uid string) {

	b := make([]byte, 10)

	_, err := rand.Read(b)

	if err != nil {
		log.Println("GenUID Error: ", err)
		return
	}

	uid = fmt.Sprintf("%X", b[0:])

	return
}

func get_time() string {
	return time.Now().Format("2006-01-02 15:04:05")
}

func handleStatic(w http.ResponseWriter, r *http.Request) {
	data := libs.ReadFile(r.URL.Path[1:])

	io.WriteString(w, data)
}

func handleBingSiteAuth(w http.ResponseWriter, r *http.Request) {
	data := libs.ReadFile("BingSiteAuth.xml")

	io.WriteString(w, data)
}

func handleGoogleSiteAuth(w http.ResponseWriter, r *http.Request) {
	data := libs.ReadFile("googleb295dd6d4113b434.html")

	io.WriteString(w, data)
}

func handleSitemap(w http.ResponseWriter, r *http.Request) {
	data := libs.ReadFile("sitemap.xml")

	io.WriteString(w, data)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler hello " + r.URL.Path)

	t := libs.NewPage()

	t.Init("index.html")

	io.WriteString(w, t.Content)
}

func handleFavicon(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler favicon " + r.URL.Path)

	data := libs.ReadFile("static/img/favicon.ico")

	io.WriteString(w, data)
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler search " + r.URL.Path)

	var key = getValue(r, "key")

	log.Println("run handler search " + key)

	var content = libs.Search(key, "")

	if content == "" {
		return
	}

	str := string(content)

	//str := libs.ContentToXML(content)

	io.WriteString(w, str)
}

func handlePage(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler page " + r.URL.Path)

	var tag = getValue(r, "tag")
	var pid = getValue(r, "pid")

	log.Println("run handler search " + tag + " " + pid)

	var content = libs.Search(tag, pid)

	//str := libs.ContentToXML(content)

	io.WriteString(w, content)
}

func handleTag(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler tag " + r.URL.Path)

	var tag = getValue(r, "tag")

	log.Println("run handler tag " + tag)

	var content = libs.Search(tag, "")

	//str := libs.ContentToXML(content)

	io.WriteString(w, content)
}

func handleGetArtist(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler get artist " + r.URL.Path)

	var id = getValue(r, "id")

	if id == "" {
		id = "none"
	}

	log.Println("run handler getartist " + id)

	str := libs.GetArtist(id)

	io.WriteString(w, str)
}

func handleGetCharacter(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler get character " + r.URL.Path)

	var id = getValue(r, "id")

	if id == "" {
		id = "none"
	}

	log.Println("run handler getcharacter " + id)

	str := libs.GetCharacter(id)

	if str == "" {
		str = "<empty></empty>"
	}

	io.WriteString(w, str)
}

func handleArtist(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler artist " + r.URL.Path)

	t := libs.NewPage()

	t.Init("index.html")

	io.WriteString(w, t.Content)
}

func handleCharacter(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler character " + r.URL.Path)

	t := libs.NewPage()

	t.Init("index.html")

	io.WriteString(w, t.Content)
}

func handleGetImage(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler get image " + r.URL.Path)

	var url = getValue(r, "url")

	ri := libs.GetImage(url)

	if ri == nil {
		log.Println("while handle get image " + r.URL.Path)

		return
	}

	farr := strings.Split(url, "/")
	fname := farr[len(farr)-1]

	var contentType string = "image/jpeg"

	if strings.HasSuffix(url, ".png") {
		contentType = "image/png"
	} else if strings.HasSuffix(url, ".jpg") {
		contentType = "image/jpeg"
	}

	contentSize := strconv.FormatInt(ri.ContentLength, 10)
	s64, _ := strconv.ParseInt(contentSize, 10, 32)
	s64--
	//s32 := strconv.Itoa(int(s64))

	w.Header().Set("Content-Type", contentType)
	w.Header().Add("Accept-Ranges", "bytes")
	w.Header().Add("Content-Length", contentSize)
	w.Header().Add("Content-Disposition", "inline; filename="+fname+"")

	//requestedBytes := r.Header.Get("Range")
	//w.Header().Add("Content-Range", "bytes "+requestedBytes[6:len(requestedBytes)]+
	//	s32+"/"+contentSize)
	w.Header().Add("Content-Range", "bytes 0 "+contentSize+"/"+contentSize)

	io.Copy(w, ri.Body)
}

func handleGetVideo(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler get video.")

	var url = getValue(r, "url")

	log.Println("video url is " + url)

	ri := libs.GetVideo(url)

	if ri == nil {
		log.Println("while handle get video " + r.URL.Path)

		return
	}

	http.Redirect(w, r, url, http.StatusFound)

	return

	/*
		farr := strings.Split(url, "/")

		fname := farr[len(farr)-1]

		var contentType string = ""

		if strings.HasSuffix(url, ".mp4") {
			contentType = "video/mp4"
		} else if strings.HasSuffix(url, ".webm") {
			contentType = "video/webm"
		}

		contentSize := strconv.FormatInt(ri.ContentLength, 10)
		s64, _ := strconv.ParseInt(contentSize, 10, 32)
		s64--

		w.Header().Set("Content-Type", contentType)
		w.Header().Add("Accept-Ranges", "bytes")
		w.Header().Add("Content-Length", contentSize)
		w.Header().Add("Content-Disposition", "inline; filename="+fname+"")

		//requestedBytes := r.Header.Get("Range")
		//w.Header().Add("Content-Range", "bytes "+requestedBytes[6:len(requestedBytes)]+
		//	s32+"/"+contentSize)
		w.Header().Add("Content-Range", "bytes 0 "+contentSize+"/"+contentSize)

		io.Copy(w, ri.Body)
	*/
}

func handleGetThumbnail(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler character " + r.URL.Path)

	t := libs.NewPage()

	t.Init("index.html")

	io.WriteString(w, t.Content)
}

func handleGetAutocomplete(w http.ResponseWriter, r *http.Request) {
	log.Println("run handler get autocomplete " + r.URL.Path)

	var id = getValue(r, "id")

	log.Println("run handler get autocomplete " + id)

	str := libs.GetAutocomplete(id)

	io.WriteString(w, str)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	email := getFormValue(r, "email")
	pass := getFormValue(r, "pass")

	var k map[string]string = map[string]string{"email": email}

	fmt.Println("handle Login ", k)

	var v []string = []string{"id", "valid", "password"}

	v = dbrequest.GetValues("db_users", v, k)

	if v == nil || len(v) < 1 {
		log.Println("Login user failed. No user in db.")
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "{'Sid' : ''}\n")
		return
	}

	uid := v[0]

	log.Println("Login user data: ", v)

	if uid == "" || v[1] != "1" {
		log.Println("Login user failed. Invalid user id in db.")
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "{'Sid' : ''}\n")
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(v[2]), []byte(pass))

	if err != nil {
		log.Println("Login user failed. Invalid password.")
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "{'Sid' : ''}\n")
		return
	}

	v = dbrequest.GetValues("db_sessions", []string{"sid"}, map[string]string{"uid": uid, "closed": "0", "remote": hostOnly(r.RemoteAddr)})

	var sid string = ""

	res := false

	if v == nil || len(v) < 1 || v[0] == "" {
		tm := time.Now().Format("2006-01-02 15:04:05")
		sid = uuid.New().String()
		res = dbrequest.SetValues("db_sessions", map[string]string{"sid": sid, "uid": uid, "closed": "0", "remote": hostOnly(r.RemoteAddr),
			"start": tm, "finish": tm}, map[string]string{})
	} else {
		sid = v[0]
		res = true
		fmt.Println("Login get sid: ", v)
	}

	json := "{\"Sid\" : \""

	if res != true {
		log.Println("Login user failed.")
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		json += ""
	} else {
		log.Println("Login user success.")
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		json += sid
	}

	json += "\"}"
	io.WriteString(w, json+"\n")
	fmt.Println("Login result: ", json)
	//buf := new(bytes.Buffer)
	//rw := io.MultiWriter(buf, w)
	//io.WriteString(rw, json+"\n")
	//fmt.Printf("dump: %q\n", buf)
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	sid := getValue(r, "sid")

	res := dbrequest.HasValues("db_sessions", []string{"closed"}, map[string]string{"sid": sid, "closed": "1", "remote": hostOnly(r.RemoteAddr)})

	if res == true {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "{\"Result\" : \"True\"}\n")
		return
	}

	res = dbrequest.SetValues("db_sessions", map[string]string{"closed": "1", "final": time.Now().Format("2006-01-02 15:04:05")},
		map[string]string{"sid": sid, "remote": hostOnly(r.RemoteAddr)})

	if res == false {
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "{\"Result\" : \"False\"}\n")
		return
	}

	json := "{\"Result\" : \""

	if res != true {
		log.Println("Logout user failed.")
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		json += "False"
	} else {
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		json += "True"
	}

	json += "\"}"
	io.WriteString(w, json+"\n")
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	email := getFormValue(r, "email")
	uname := getFormValue(r, "uname")
	pass := getFormValue(r, "pass")

	log.Println("handleRegister ", email, uname, pass)

	hash, err := bcrypt.GenerateFromPassword([]byte(pass), 16)

	if err != nil {
		log.Println("Register user failed " + err.Error())
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "{\"Result\":\"False\"}\n")
		return
	}

	vid := dbrequest.GetValues("db_users", []string{"id"}, map[string]string{"email": email})

	if vid == nil && dbrequest.Failed == true {
		log.Println("Register user failed, DB error.")
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "{\"Result\":\"False\"}\n")
		return
	}

	if len(vid) > 0 && vid[0] != "" {
		log.Println("Register user failed, user already registered.")
		w.WriteHeader(http.StatusBadRequest)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "{\"Result\":\"False\"}\n")
		return
	}

	var k map[string]string = map[string]string{"id": gen_uid(), "email": email, "username": uname, "valid": "1", "password": string(hash),
		"firstname": "", "lastname": "", "isadmin": "0", "regdate": get_time(), "host": hostOnly(r.RemoteAddr)}

	log.Println("pass hash " + string(hash))

	res := dbrequest.SetValues("db_users", k, nil)

	log.Println("register result " + strconv.FormatBool(res))

	json := "{\"Result\" : \""

	if res != true {
		log.Println("Register user failed.")
		w.WriteHeader(http.StatusBadRequest)
		json += "False"
	} else {
		w.WriteHeader(http.StatusOK)
		json += "True"
	}

	w.Header().Set("Content-Type", "application/json")
	json += "\"}"
	io.WriteString(w, json+"\n")
}

func handleCommand(w http.ResponseWriter, r *http.Request) {
	cmd := getFormValue(r, "cmd")
	sid := getFormValue(r, "sid")

	log.Println("handleCommand " + cmd + " " + sid)

	var result string
	var content string
	var res bool

	result = "Error"
	content = "Unknown."

	switch cmd {
	case "sidvalid":
		res = cmdSidValid(sid, hostOnly(r.RemoteAddr))
		if res {
			result = "Result"
			content = "true"
		} else {
			result = "Error"
			content = "Not valid session."
		}
	case "userinfo":
		m, ok := cmdUserInfo(sid)
		if ok == true {
			result = "UserInfo"
			j, _ := json.Marshal(m)
			content = string(j)
			res = true
		} else {
			result = "Error"
			content = "Unable get user info."
			res = false
		}
	case "userfavors":
		m, ok := cmdUserFavors(sid)
		if ok {
			result = "Favors"
			content = "\"" + m + "\""
			res = true
		}
	case "userfavoradd":
		ok := cmdUserFavorAdd(sid, getFormValue(r, "favor"))
		if ok {
			result = "Result"
			content = "true"
			res = true
		}
	case "userfavorrem":
		ok := cmdUserFavorRem(sid, getFormValue(r, "favor"))
		if ok {
			result = "Result"
			content = "true"
			res = true
		}
	case "userimages":
		m, ok := cmdUserImages(sid)
		if ok {
			result = "Images"
			content = "\"" + m + "\""
			res = true
		}
	case "userimageadd":
		ok := cmdUserImageAdd(sid, getFormValue(r, "image"))
		if ok {
			result = "Result"
			content = "true"
			res = true
		}
	case "userimagerem":
		ok := cmdUserImageRem(sid, getFormValue(r, "image"))
		if ok {
			result = "Result"
			content = "true"
			res = true
		}
	case "userimagedata":
		m, ok := cmdUserImageData(sid, getFormValue(r, "images"))
		if ok {
			result = "Images"
			content = "[" + m + "]"
			res = true
		}
	default:
		result = "Error"
		content = "Not valid command."
	}

	json := "{\"" + result + "\" : " + content + "}"

	if res != true {
		log.Println("Command failed " + content)
		w.WriteHeader(http.StatusBadRequest)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, json+"\n")
}

func cmdSidValid(sid string, host string) bool {
	return dbrequest.HasValues("db_sessions", nil, map[string]string{"sid": sid, "closed": "0", "remote": host})
}

func cmdUserInfo(sid string) (map[string]string, bool) {
	vals := dbrequest.GetValues("db_sessions", []string{"uid"}, map[string]string{"sid": sid, "closed": "0"})

	if vals == nil {
		return nil, false
	}

	vals = dbrequest.GetValues("db_users", []string{"email", "username", "firstname", "lastname"}, map[string]string{"id": vals[0]})

	if vals == nil {
		return nil, false
	}

	return map[string]string{"email": vals[0], "username": vals[1], "firstname": vals[2], "lastname": vals[3]}, true
}

func cmdUserFavors(sid string) (string, bool) {
	vs := dbrequest.GetValues("db_sessions", []string{"uid"}, map[string]string{"sid": sid, "closed": "0"})

	if vs == nil || vs[0] == "" {
		return "", false
	}

	vs = dbrequest.GetValues("db_datas", []string{"value"}, map[string]string{"uid": vs[0], "key": "favors"})

	if vs == nil || len(vs) < 1 || vs[0] == "" {
		return "", false
	}

	var vr string

	for _, v := range vs {
		vr += (v + ",")
	}

	if strings.HasSuffix(vr, ",") {
		vr = vr[:len(vr)-1]
	}

	return vr, true
}

func cmdUserFavorAdd(sid string, favor string) bool {
	log.Println("Add user favor: ", favor, sid)

	vs := dbrequest.GetValues("db_sessions", []string{"uid"}, map[string]string{"sid": sid, "closed": "0"})

	if vs == nil || vs[0] == "" {
		log.Println("Add user favor: Invalid session.")
		return false
	}

	uid := vs[0]

	has := dbrequest.HasValues("db_datas", []string{"value"}, map[string]string{"uid": vs[0], "key": "favors", "value": favor})

	if !has {
		log.Println("Add user favor: No favor as key for user.")

		rs := dbrequest.SetValues("db_datas", map[string]string{"key": "favors", "value": favor, "uid": uid}, nil)

		if !rs {
			log.Println("Add user favor: Unable add user favors.")
			return false
		}
	}

	return true
}

func cmdUserFavorRem(sid string, favor string) bool {
	log.Println("Remove user favor: ", sid, favor)

	vs := dbrequest.GetValues("db_sessions", []string{"uid"}, map[string]string{"sid": sid, "closed": "0"})

	if vs == nil || vs[0] == "" {
		log.Println("Remove user favor: Invalid session.")
		return false
	}

	uid := vs[0]

	has := dbrequest.HasValues("db_datas", []string{"value"}, map[string]string{"uid": vs[0], "key": "favors", "value": favor})

	if !has {
		log.Println("Remove user favor: No favor for remove.")
		return false
	}

	rs := dbrequest.DelValues("db_datas", []string{}, map[string]string{"key": "favors", "value": favor, "uid": uid})

	if !rs {
		log.Println("Remove user favor: Unable remove favor for user.")
		return false
	}

	return true
}

func cmdUserImages(sid string) (string, bool) {
	vs := dbrequest.GetValues("db_sessions", []string{"uid"}, map[string]string{"sid": sid, "closed": "0"})

	if vs == nil || vs[0] == "" {
		return "", false
	}

	vs = dbrequest.GetValues("db_datas", []string{"value"}, map[string]string{"uid": vs[0], "key": "images"})

	if vs == nil || vs[0] == "" {
		return "", false
	}

	var vr string

	for _, v := range vs {
		vr += (v + ",")
	}

	if strings.HasSuffix(vr, ",") {
		vr = vr[:len(vr)-1]
	}

	return vr, true
}

func cmdUserImageAdd(sid string, image string) bool {
	log.Println("Add user image: ", image, sid)

	vs := dbrequest.GetValues("db_sessions", []string{"uid"}, map[string]string{"sid": sid, "closed": "0"})

	if vs == nil || vs[0] == "" {
		log.Println("Add user image: Invalid session.")
		return false
	}

	uid := vs[0]

	has := dbrequest.HasValues("db_datas", []string{"value"}, map[string]string{"uid": vs[0], "key": "images", "value": image})

	if !has {
		log.Println("Add user image: No image as key for user.")

		rs := dbrequest.SetValues("db_datas", map[string]string{"key": "images", "value": image, "uid": uid}, nil)

		if !rs {
			log.Println("Add user image: Unable add user images.")
			return false
		}
	}

	return true
}

func cmdUserImageRem(sid string, image string) bool {
	log.Println("Remove user image: ", sid, image)

	vs := dbrequest.GetValues("db_sessions", []string{"uid"}, map[string]string{"sid": sid, "closed": "0"})

	if vs == nil || vs[0] == "" {
		log.Println("Remove user image: Invalid session.")
		return false
	}

	uid := vs[0]

	has := dbrequest.HasValues("db_datas", []string{"value"}, map[string]string{"uid": vs[0], "key": "images", "value": image})

	if !has {
		log.Println("Remove user image: No image for remove.")
		return false
	}

	rs := dbrequest.DelValues("db_datas", []string{}, map[string]string{"key": "images", "value": image, "uid": uid})

	if !rs {
		log.Println("Remove user image: Unable remove image for user.")
		return false
	}

	return true
}

func cmdUserImageData(sid string, image string) (string, bool) {
	log.Println("Get user image data: ", sid, image)

	if image == "" {
		return "", false
	}

	vs := strings.Split(image, ",")

	if vs == nil || len(vs) < 1 {
		v := libs.SearchImage(image)

		return v, true
	}

	var res string

	for i, v := range vs {
		res += libs.SearchImage(v)

		if i != len(vs)-1 {
			res += ", "
		}
	}

	return res, true
}

var dbMonitor bool = true

func dbmonitor() {
	log.Println("Start db session monitoring", dbMonitor)

	for dbMonitor == true {
		if dbrequest != nil && dbrequest.ValidSession() != true {
			dbrequest.UpdateSession()
		}

		log.Println("Ping database...")
		time.Sleep(5 * time.Minute)
		//time.Sleep(10 * time.Second)
	}
}

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "5000"
	}

	dbuser := os.Getenv("dbuser")
	dbpass := os.Getenv("dbpass")
	dbhost := os.Getenv("dbhost")
	//dbport, _ := strconv.Atoi(os.Getenv("dbport"))

	log.Println("Using port: " + port)

	//dbrequest = &libs.DbRequest{}
	dbrequest = &kmongo.DbRequest{}

	//r := dbrequest.OpenSession(dbhost, int32(dbport), dbuser, dbpass)
	r := dbrequest.OpenSession(dbhost, dbuser, dbpass)

	if r != true {
		log.Println("Unable open database session.")
	} else {
		go dbmonitor()
	}

	var h = new(WebHandler)

	h.Add("/", handleIndex)
	h.Add("/tag", handleTag)
	h.Add("/page", handlePage)
	h.Add("/search", handleSearch)
	h.Add("/getimage", handleGetImage)
	h.Add("/getvideo", handleGetVideo)
	h.Add("/getartist", handleGetArtist)
	h.Add("/getcharacter", handleGetCharacter)
	h.Add("/getautocomplete", handleGetAutocomplete)

	//h.Add("/valid", handleValid)
	h.Add("/login", handleLogin)
	h.Add("/logout", handleLogout)
	h.Add("/register", handleRegister)
	h.Add("/command", handleCommand)

	h.Add("/sitemap.xml", handleSitemap)
	h.Add("/BingSiteAuth.xml", handleBingSiteAuth)
	h.Add("/googleb295dd6d4113b434.html", handleGoogleSiteAuth)

	h.Add("/favicon.ico", handleFavicon)

	http.Handle("/", h)
	http.ListenAndServe(":"+port, nil)
	/*
		l, err := net.Listen("tcp", ":5000")
		if err != nil {
			fmt.Println("Listen: ", err)
		}
		err = http.Serve(listener{l}, http.DefaultServeMux)
		if err != nil {
			fmt.Println("Serve: ", err)
		}
	*/
}
