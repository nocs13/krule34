package libs

import (
	"container/list"
	"encoding/xml"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"golang.org/x/net/html"
)

//Content is ...
type Content struct {
	ids    *list.List
	tags   *list.List
	images *list.List
	thumbs *list.List
	pages  *list.List
	artist *list.List
}

//IsToken ...
func IsToken(tok *html.Token, tag string, class string) bool {
	if tok == nil {
		return false
	}

	//LogDebug("Is Token: tk is " + tok.Data)

	if tok.Data != tag {
		return false
	}

	//LogDebug("Is Token: tag passed")

	for _, a := range tok.Attr {
		//LogDebug("Is Token: Attr is " + a.Key + "/" + a.Val)

		if a.Key == "class" && a.Val == class {
			return true
		}
	}

	return false
}

//IsTokenAttr ...
func IsTokenAttr(tok *html.Token, tag string, key string, val string) bool {
	if tok == nil {
		return false
	}

	//LogDebug("IsTokenAttr: tk is " + tok.Data)

	if tok.Data != tag {
		return false
	}

	for _, a := range tok.Attr {
		//LogDebug("IsTokenArrt: Current attribute is " + a.Key + "/" + a.Val)

		if a.Key == key && a.Val == val {
			//LogDebug("IsTokenArrt: Found XXXXXX")
			return true
		}
	}

	return false
}

//GetTokenAttr ...
func GetTokenAttr(tok *html.Token, tag string, key string) string {
	if tok == nil {
		return ""
	}

	if tok.Data != tag {
		return ""
	}

	for _, a := range tok.Attr {
		if a.Key == key {
			return a.Val
		}
	}

	return ""
}

//IsImage ...
func IsImage(uri string) bool {
	LogInfo("Checking uri is image " + uri)

	res, err := http.Head(uri)

	if err != nil {
		LogDebug("Failed HEAD request.")

		return false
	}

	LogDebug("Checking uri content type.")

	contentType := res.Header.Get("Content-type")

	LogInfo("Uri content type is " + contentType)

	if contentType == "" || strings.Contains(contentType, "image/") == false {
		LogDebug("URI [" + uri + "] is not image type it is [" + contentType + "] content type.")

		return false
	}

	LogDebug("Checking uri content length")

	if res.ContentLength < 1 {
		LogInfo("URI [" + uri + "] content length is too small.")
		LogDebug("Content-length: " + fmt.Sprintf("%v", res.ContentLength))

		return false
	}

	return true
}

//IsVideo ...
func IsVideo(uri string) bool {
	LogDebug("Checking uri is video " + uri)

	res, err := http.Head(uri)

	if err != nil {
		return false
	}

	LogDebug("Checking uri content length")

	if res.ContentLength < 1 {
		LogInfo("Content-length: " + fmt.Sprintf("%v", res.ContentLength))

		return false
	}

	LogDebug("Checking uri content type")

	contentType := res.Header.Get("Content-type")

	LogDebug("Checking uri content type is " + contentType)

	if contentType == "" || strings.Contains(contentType, "video") == false {
		return false
	}

	return true
}

func convertThumb(src string, anim bool) string {
	var r string

	r = ""

	LogInfo("Parsing thumb: " + src)

	if src != "" {
		LogDebug("Token image preview source: " + src)

		if strings.Contains(src, "?") {
			//src = strings.Split(src, "?")[0]
		}

		src = strings.Replace(src, "ny.rule34.xxx", "rule34.xxx", 1)

		tmp := src

		src = strings.Replace(src, "thumbnail_", "sample_", 1)
		src = strings.Replace(src, "thumbnails", "samples", 1)
		LogDebug("Token image preview source: " + src)

		if IsImage(src) == false {
			src = tmp

			src = strings.Replace(src, "thumbnail_", "sample_", 1)
			src = strings.Replace(src, "thumbnails", "/samples", 1)

			if IsImage(src) == false {
				src = tmp

				src = strings.Replace(src, "thumbnail_", "", 1)
				src = strings.Replace(src, "thumbnails", "images", 1)

				if IsImage(src) == false {
					src = tmp
					src = strings.Replace(src, "thumbnail_", "", 1)
					src = strings.Replace(src, "thumbnails", "/images", 1)

					if IsImage(src) == false {
						src = tmp
						src = strings.Replace(src, "thumbnail_", "", 1)
						src = strings.Replace(src, "thumbnails", "/images", 1)
						src = strings.Replace(src, "rule34.xxx", "himg.rule34.xxx", 1)

						if IsImage(src) == false {
							src = strings.Replace(src, ".jpg", ".jpeg", 1)

							if IsImage(src) == false {
								src = strings.Replace(src, ".jpeg", ".png", 1)

								if IsImage(src) == false {
									src = ""
								}
							}
						}
					}
				}
			}
		}

		if src == "" && anim == true {
			src = tmp

			src = strings.Replace(src, "thumbnail_", "", 1)
			src = strings.Replace(src, "thumbnails", "/images", 1)
			src = strings.Replace(src, ".jpg", ".webm", 1)
			src = strings.Replace(src, "rule34.xxx", "wwebm.rule34.xxx", 1)

			if IsVideo(src) == false {
				src = ""
			}
		}

		if src != "" {
			r = src
		} else {
			LogInfo("thumb [" + tmp + "] not parsed correct.")
		}
	}

	LogInfo("convertThumb result is " + r)

	return r
}

func parseImage(url string) string {
	var r string

	LogInfo("Parsing rul: " + url)

	if url == "" {
		LogError("Wrong url.")

		return ""
	}

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
	req.AddCookie(&http.Cookie{Name: "resize-original", Value: "1"})
	req.AddCookie(&http.Cookie{Name: "resize-notification", Value: "1"})

	res, err := client.Do(req)

	if err != nil || res == nil {
		LogError("Failed GET request.")

		return ""
	}

	defer res.Body.Close()

	tok := html.NewTokenizer(res.Body)

	avideo := false

wloop:
	for {
		stat := tok.Next()

		switch {
		case stat == html.ErrorToken:
			LogDebug("Tokenizer error.")
			break wloop
		case stat == html.StartTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "video", "id", "gelcomVideoPlayer") {
				avideo = true
				LogInfo("Video tag opened")
			}
		case stat == html.EndTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "video", "id", "gelcomVideoPlayer") {
				LogInfo("Video tag closed")
				avideo = false
			}
		case stat == html.SelfClosingTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "img", "id", "image") == true {
				r = GetTokenAttr(&tn, "img", "src")
			} else if avideo && IsTokenAttr(&tn, "source", "type", "video/webm") {
				s := GetTokenAttr(&tn, "source", "src")

				r = s
			}
		}
	}

	if err != nil {
		LogError("Parse page error: " + fmt.Sprintf("%v", err))
	}

	LogInfo("Parsing result is: " + r)

	return r
}

func parseImageUS(url string) string {
	var r string

	LogInfo("Parsing url: " + url)

	if url == "" {
		LogError("Wrong url.")

		return ""
	}

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
	//req.AddCookie(&http.Cookie{Name: "resize-original", Value: "1"})
	//req.AddCookie(&http.Cookie{Name: "resize-notification", Value: "1"})

	res, err := client.Do(req)

	if err != nil || res == nil {
		LogError("Failed GET request.")

		return ""
	}

	defer res.Body.Close()

	tok := html.NewTokenizer(res.Body)

	var divPushContent bool

	divPushContent = false

	//var xst string

	//xst = ""

	//wloop:
	count := 0
	avideo := false

	for {
		stat := tok.Next()

		tn := tok.Token()

		count++

		if tn.Data == "img" {
			ss := GetTokenAttr(&tn, "img", "src")
			LogDebug("Actual image sourceis: " + ss)
		}

		if stat == html.ErrorToken {
			LogDebug("Tokenizer error " + fmt.Sprintf("%v", tok.Err()))
			divPushContent = false
			break
		} else if stat == html.StartTagToken {
			if tn.Data == "img" {
				ss := GetTokenAttr(&tn, "img", "src")
				LogInfo("Img is open id " + fmt.Sprintf("%v", count))

				if divPushContent == true && r == "" {
					r = ss

					break
				}
			} else if tn.Data == "video" {
				avideo = true
			} else if tn.Data == "source" && avideo == true && divPushContent == true {
				ss := GetTokenAttr(&tn, "source", "src")

				if strings.Contains(ss, ".webm") {
					r = ss
				}
			}

			if IsToken(&tn, "div", "content_push") {
				xst := GetTokenAttr(&tn, "div", "class")
				LogInfo("Open div class is: " + xst)

				divPushContent = true
				LogInfo("Push content set.")
			}
		} else if stat == html.EndTagToken {
			if tn.Data == "img" {
				LogInfo("Img is close id " + fmt.Sprintf("%v", count))
			} else if tn.Data == "video" {
				avideo = false
			}

			if IsToken(&tn, "div", "content_push") {
				divPushContent = false
				LogInfo("Push content unset.")
			}
		} else if stat == html.SelfClosingTagToken {
			if tn.Data == "source" && avideo == true && divPushContent == true {
				ss := GetTokenAttr(&tn, "source", "src")

				if strings.Contains(ss, ".webm") {
					r = ss
				}
			}
		}
	}

	if err != nil {
		LogError("Parse page error: " + fmt.Sprintf("%v", err))
	}

	LogInfo("Parsing result is: " + r)

	//return r
	if strings.Index(r, "https://video.rule34.us/") != -1 {
		return strings.Replace(r, "https://video.rule34.us/", "/video/", -1)
	}

	return strings.Replace(r, "https://img2.rule34.us", "", -1)
}

//GetArtistUS ...
func GetArtist(id string) string {
	var r string

	LogInfo("Parsing post id: " + id)

	if id == "" {
		LogError("Wrong post id.")

		return ""
	}
	/*
		var posts XPosts

		url := "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=42&json=0&id=" + id

		client := &http.Client{}
		req, _ := http.NewRequest("GET", url, nil)
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

		res, err := client.Do(req)

		//res, err := client.Get("https://www.google.com/search?q=" + s)

		if err != nil || res == nil {
			LogError("Search failed. Id: " + id)
		}

		defer res.Body.Close()

		responseData, err := ioutil.ReadAll(res.Body)

		if err != nil {
			LogError("Read body data error:" + err.Error())

			return ""
		}

		final := string(responseData)

		LogInfo(final)

		err = xml.Unmarshal([]byte(final), &posts)

		if err != nil {
			LogError("Parse error " + err.Error())

			return ""
		}

		fmt.Printf("Count : %+v \n", posts.Count)
		fmt.Printf("Offset : %+v \n", posts.Offset)

		defer res.Body.Close()

		if posts.Count < 1 {
			return ""
		}
	*/
	url := "https://rule34.xxx/index.php?page=post&s=view&id=" + id

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	if err != nil || res == nil {
		LogError("Failed GET request.")

		return ""
	}

	defer res.Body.Close()

	tok := html.NewTokenizer(res.Body)

	var atag = false

	var artists []string

	for {
		stat := tok.Next()

		tn := tok.Token()

		if stat == html.ErrorToken {
			break
		} else if stat == html.StartTagToken {
			if IsTokenAttr(&tn, "li", "class", "tag-type-artist tag") {
				atag = true
				LogInfo("Open artist tag")
			} else if tn.Data == "a" && atag == true {
				href := GetTokenAttr(&tn, "a", "href")

				atag = false

				if href == "" {
					continue
				}

				re := regexp.MustCompile(`tags=(.+)$`)
				mc := fmt.Sprintf("%v", re.FindString(href))
				mc = strings.Replace(mc, "tags=", "", 1)

				if mc != "" {
					artists = append(artists, mc)
				}
			}
		} else if stat == html.EndTagToken {
			if IsTokenAttr(&tn, "li", "class", "tag-type-artist tag") {
				atag = false
				LogInfo("Close artist tag")
			}
		} else if stat == html.SelfClosingTagToken {
		}
	}

	if err != nil {
		LogError("Parse page error: " + fmt.Sprintf("%v", err))
	}

	r = "{\"artists\":\""

	if len(artists) > 0 {
		for _, s := range artists {
			r += s + ","
		}

		r = r[:len(r)-1]
	}

	r += "\"}"

	LogInfo("Parsing result is: " + r)

	return r
}

//GetCharacter ...
func GetCharacter(id string) string {
	var r string

	LogInfo("Parsing post id: " + id)

	if id == "" {
		LogError("Wrong post id.")

		return ""
	}

	url := "https://rule34.xxx/index.php?page=post&s=view&id=" + id

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
	//req.AddCookie(&http.Cookie{Name: "resize-original", Value: "1"})
	//req.AddCookie(&http.Cookie{Name: "resize-notification", Value: "1"})

	res, err := client.Do(req)

	if err != nil || res == nil {
		LogError("Failed GET request.")

		return ""
	}

	defer res.Body.Close()

	tok := html.NewTokenizer(res.Body)

	var atag = false

	var characters []string

	for {
		stat := tok.Next()

		tn := tok.Token()

		if stat == html.ErrorToken {
			break
		} else if stat == html.StartTagToken {
			if IsTokenAttr(&tn, "li", "class", "tag-type-character tag") {
				atag = true
			} else if tn.Data == "a" && atag == true {
				href := GetTokenAttr(&tn, "a", "href")
				atag = false

				if href == "" {
					continue
				}

				re := regexp.MustCompile(`tags=(.+)$`)
				mc := fmt.Sprintf("%v", re.FindString(href))
				mc = strings.Replace(mc, "tags=", "", 1)

				if mc != "" {
					characters = append(characters, mc)
				}
			}
		} else if stat == html.EndTagToken {
			if IsTokenAttr(&tn, "li", "class", "tag-type-character tag") {
				atag = false
			}
		} else if stat == html.SelfClosingTagToken {
		}
	}

	if err != nil {
		LogError("Parse page error: " + fmt.Sprintf("%v", err))
	}

	r = "{\"characters\":\""

	if len(characters) > 0 {
		for _, s := range characters {
			r += s + ","
		}

		r = r[:len(r)-1]
	}

	r += "\"}"

	LogInfo("Parsing result is: " + r)

	return r
}

func GetAutocomplete(id string) string {
	url := "https://rule34.xxx/autocomplete.php?q=" + id

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	if err != nil || res == nil {
		LogError("Failed GET request.")

		return ""
	}

	defer res.Body.Close()

	responseData, err := ioutil.ReadAll(res.Body)

	if err != nil {
		LogError("Read body data error:" + err.Error())

		return ""
	}

	final := string(responseData)

	LogDebug("Autocomplete: " + final)

	return final
}

type JsNode struct {
	Preview_url   string
	Sample_url    string
	File_url      string
	Directory     int
	Hash          string
	Height        int
	Id            int
	Image         string
	Change        int
	Owner         string
	Parent_id     int
	Rating        string
	Sample        int
	Sample_height int
	Sample_width  int
	Score         int
	Tags          string
	Width         int
}

type XPost struct {
	XMLName       xml.Name `xml:"post"`
	Name          string   `xml:"name,attr"`
	Preview_url   string   `xml:"preview_url,attr"`
	Sample_url    string   `xml:"sample_url,attr"`
	File_url      string   `xml:"file_url,attr"`
	Directory     int      `xml:"directory,attr"`
	Hash          string   `xml:"hash,attr"`
	Height        int      `xml:"height,attr"`
	Id            int      `xml:"id,attr"`
	Image         string   `xml:"image,attr"`
	Change        int      `xml:"change,attr"`
	Owner         string   `xml:"owner,attr"`
	Parent_id     int      `xml:"parent_id,attr"`
	Rating        string   `xml:"rating,attr"`
	Sample        int      `xml:"sample,attr"`
	Sample_height int      `xml:"sample_height,attr"`
	Sample_width  int      `xml:"sample_width,attr"`
	Score         int      `xml:"score,attr"`
	Tags          string   `xml:"tags,attr"`
	Width         int      `xml:"width,attr"`
}

type XPosts struct {
	XMLName xml.Name `xml:"posts"`
	Count   int      `xml:"count,attr"`
	Offset  int      `xml:"offset,attr"`
	Posts   []XPost  `xml:"post"`
}

//Search is ...
func Search(key string, pid string) string {
	var r string

	//var nodes []JsNode
	var posts XPosts

	ss := "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=42&json=0&tags=" + key

	if pid != "" {
		ss += "&pid=" + pid
	}

	client := &http.Client{}
	req, _ := http.NewRequest("GET", ss, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	//res, err := client.Get("https://www.google.com/search?q=" + s)

	if err != nil || res == nil {
		LogError("Search failed. Tag: " + key)
	}

	defer res.Body.Close()

	responseData, err := ioutil.ReadAll(res.Body)

	if err != nil {
		LogError("Read body data error:" + err.Error())
	}

	final := string(responseData)

	//LogInfo(final)

	err = xml.Unmarshal([]byte(final), &posts)

	//err = json.Unmarshal([]byte(final), &nodes)

	if err != nil {
		LogError("Parse error " + err.Error())
	}

	fmt.Printf("Count : %+v \n", posts.Count)
	fmt.Printf("Offset : %+v \n", posts.Offset)

	//LogInfo("Elements count is " + string(len(nodes)))

	r = "["

	for _, n := range posts.Posts {
		t := n.Tags

		if string(t[0:1]) == "\\" {
			continue
		}

		//LogInfo("Element " + n.Hash)
		r += "{"
		r += `"id":`
		r += `"` + strconv.Itoa(n.Id) + `",`

		//t = strings.Replace(t, `\||/`, "", -1)
		t = strings.Replace(t, "\\", "\\\\", -1)
		t = strings.Replace(t, "\n", "", -1)

		r += `"tags":`
		r += `"` + t + `",`

		r += `"thumb":`
		r += `"` + n.Preview_url + `",`

		r += `"image":`
		r += `"` + n.Sample_url + `"`

		r += "},\n"
	}

	//if len(r) > 1 {
	//	r = r[:len(r)-1]
	//}

	r += "{" + `"count":"` + strconv.Itoa(posts.Count) + `", "offset":"` + strconv.Itoa(posts.Offset) + `"}`

	r += "]"

	LogInfo("JSON: " + r)

	return r
}

//GetImage is ...
//func GetImage(uri string) io.Reader {
func GetImage(uri string) *http.Response {
	response, err := http.Get(uri)

	LogDebug("GetImage: " + uri)

	if err != nil {
		LogError("Cannot get image from url: " + uri)

		return nil
	}

	if response.StatusCode != 200 {
		LogError("Received non 200 response code")

		return nil
	}

	return response
}

//GetVideoUS is ...
func GetVideoUS(uri string) io.Reader {
	if strings.Index(uri, "/video/") == -1 {
		LogError("Invalid video url: " + uri)

		return nil
	}

	//url := "https://img2.rule34.us" + uri
	url := strings.Replace(uri, "/video/", "https://video.rule34.us/", -1)

	response, err := http.Get(url)

	if err != nil {
		LogError("Cannot get video from url: " + url)

		return nil
	}

	if response.StatusCode != 200 {
		LogError("Received non 200 response code")

		return nil
	}

	return response.Body
}
