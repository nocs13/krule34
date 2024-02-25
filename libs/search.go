package libs

import (
	"encoding/xml"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"golang.org/x/net/html"
)

type R34XXX struct {
}

//search by id
//https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&id=8170857

func IsPrintable(s string) bool {
	for i := 0; i < len(s); i++ {
		if !unicode.IsPrint(rune(s[i])) {
			return false
		}
	}

	return true
}

// IsToken ...
func IsToken(tok *html.Token, tag string, class string) bool {
	if tok == nil {
		return false
	}

	//log.Println("Is Token: tk is " + tok.Data)

	if tok.Data != tag {
		return false
	}

	//log.Println("Is Token: tag passed")

	for _, a := range tok.Attr {
		//log.Println("Is Token: Attr is " + a.Key + "/" + a.Val)

		if a.Key == "class" && a.Val == class {
			return true
		}
	}

	return false
}

// IsTokenAttr ...
func IsTokenAttr(tok *html.Token, tag string, key string, val string) bool {
	if tok == nil {
		return false
	}

	if tok.Data != tag {
		return false
	}

	for _, a := range tok.Attr {
		if a.Key == key && a.Val == val {
			return true
		}
	}

	return false
}

// GetTokenAttr ...
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

// IsImage ...
func IsImage(uri string) bool {
	log.Println("Checking uri is image " + uri)

	res, err := http.Head(uri)

	if err != nil {
		log.Println("Failed HEAD request.")

		return false
	}

	log.Println("Checking uri content type.")

	contentType := res.Header.Get("Content-type")

	log.Println("Uri content type is " + contentType)

	if contentType == "" || strings.Contains(contentType, "image/") == false {
		log.Println("URI [" + uri + "] is not image type it is [" + contentType + "] content type.")

		return false
	}

	log.Println("Checking uri content length")

	if res.ContentLength < 1 {
		log.Println("URI [" + uri + "] content length is too small.")
		log.Println("Content-length: " + fmt.Sprintf("%v", res.ContentLength))

		return false
	}

	return true
}

// IsVideo ...
func IsVideo(uri string) bool {
	log.Println("Checking uri is video " + uri)

	res, err := http.Head(uri)

	if err != nil {
		return false
	}

	log.Println("Checking uri content length")

	if res.ContentLength < 1 {
		log.Println("Content-length: " + fmt.Sprintf("%v", res.ContentLength))

		return false
	}

	log.Println("Checking uri content type")

	contentType := res.Header.Get("Content-type")

	log.Println("Checking uri content type is " + contentType)

	if contentType == "" || strings.Contains(contentType, "video") == false {
		return false
	}

	return true
}

func (self R34XXX) convertThumb(src string, anim bool) string {
	var r string

	r = ""

	log.Println("Parsing thumb: " + src)

	if src != "" {
		log.Println("Token image preview source: " + src)

		if strings.Contains(src, "?") {
			//src = strings.Split(src, "?")[0]
		}

		src = strings.Replace(src, "ny.rule34.xxx", "rule34.xxx", 1)

		tmp := src

		src = strings.Replace(src, "thumbnail_", "sample_", 1)
		src = strings.Replace(src, "thumbnails", "samples", 1)
		log.Println("Token image preview source: " + src)

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
			log.Println("thumb [" + tmp + "] not parsed correct.")
		}
	}

	log.Println("convertThumb result is " + r)

	return r
}

func (self R34XXX) parseImage(url string) string {
	var r string

	log.Println("Parsing rul: " + url)

	if url == "" {
		log.Println("Wrong url.")

		return ""
	}

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")
	req.AddCookie(&http.Cookie{Name: "resize-original", Value: "1"})
	req.AddCookie(&http.Cookie{Name: "resize-notification", Value: "1"})

	res, err := client.Do(req)

	if err != nil || res == nil {
		log.Println("Failed GET request.")

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
			log.Println("Tokenizer error.")
			break wloop
		case stat == html.StartTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "video", "id", "gelcomVideoPlayer") {
				avideo = true
				log.Println("Video tag opened")
			}
		case stat == html.EndTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "video", "id", "gelcomVideoPlayer") {
				log.Println("Video tag closed")
				avideo = false
			}
		case stat == html.SelfClosingTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "img", "id", "image") == true {
				r = GetTokenAttr(&tn, "img", "src")
			} else if avideo && (IsTokenAttr(&tn, "source", "type", "video/webm") ||
				IsTokenAttr(&tn, "source", "type", "video/mp4")) {
				s := GetTokenAttr(&tn, "source", "src")

				r = s
			}
		}
	}

	if err != nil {
		log.Println("Parse page error: " + fmt.Sprintf("%v", err))
	}

	log.Println("Parsing result is: " + r)

	return r
}

func (self R34XXX) GetTags(id string) string {
	var r string

	log.Println("Parsing post id: " + id)

	if id == "" {
		log.Println("Wrong post id.")

		return ""
	}
	url := "https://rule34.xxx/index.php?page=post&s=view&id=" + id

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	if err != nil || res == nil {
		log.Println("Failed GET request.")

		return ""
	}

	defer res.Body.Close()

	tok := html.NewTokenizer(res.Body)

	var atag = false
	var ctag = false
	var gtag = false

	var hreftag = false

	var tags []string
	var artists []string
	var characters []string

	for {
		stat := tok.Next()

		tn := tok.Token()

		if stat == html.ErrorToken {
			break
		} else if stat == html.StartTagToken {
			if IsTokenAttr(&tn, "li", "class", "tag-type-artist tag") {
				atag = true
				log.Println("Open artist tag")
			} else if IsTokenAttr(&tn, "li", "class", "tag-type-character tag") {
				ctag = true
				log.Println("Open character tag")
			} else if IsTokenAttr(&tn, "li", "class", "tag-type-general tag") {
				gtag = true
				log.Println("Open general tag")
			} else if tn.Data == "a" && (atag || ctag || gtag) {
				href := GetTokenAttr(&tn, "a", "href")

				if strings.Contains(href, "&tags=") {
					hreftag = true
				} else {
					hreftag = false
				}
			}
		} else if stat == html.EndTagToken {
			if tn.Data == "li" && atag {
				atag = false
				log.Println("Close artist tag")
			} else if tn.Data == "li" && ctag {
				ctag = false
				log.Println("Close character tag")
			} else if tn.Data == "li" && gtag {
				gtag = false
				log.Println("Close general tag")
			} else if tn.Data == "a" {
				hreftag = false
			}
		} else if stat == html.SelfClosingTagToken {
		} else if stat == html.TextToken {
			log.Println("Text tag is: ", tn.Data)
			if !hreftag || tn.Data == "?" || tn.Data == "\n" {
				continue
			}

			if atag {
				artists = append(artists, tn.Data)
			} else if ctag {
				characters = append(characters, tn.Data)
			} else if gtag {
				tags = append(tags, tn.Data)
			}
		}
	}

	if err != nil {
		log.Println("Parse page error: " + fmt.Sprintf("%v", err))
	}

	r = "{\"artists\":["

	if len(artists) > 0 {
		for _, s := range artists {
			r += "\"" + s + "\","
		}

		r = r[:len(r)-1]
	}

	r += "],"
	r += "\"characters\":["

	if len(characters) > 0 {
		for _, s := range characters {
			r += "\"" + s + "\","
		}

		r = r[:len(r)-1]
	}

	r += "],"
	r += "\"tags\":["

	if len(tags) > 0 {
		for _, s := range tags {
			r += "\"" + s + "\","
		}

		r = r[:len(r)-1]
	}

	r += "]"
	r += "}"

	log.Println("Parsing result is: " + r)

	return r
}

func (self R34XXX) GetArtist(id string) string {
	var r string

	log.Println("Parsing post id: " + id)

	if id == "" {
		log.Println("Wrong post id.")

		return ""
	}

	url := "https://rule34.xxx/index.php?page=post&s=view&id=" + id

	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	if err != nil || res == nil {
		log.Println("Failed GET request.")

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
				log.Println("Open artist tag")
			} else if tn.Data == "a" && atag {
				href := GetTokenAttr(&tn, "a", "href")

				if !strings.Contains(href, "&tags=") {
					continue
				}

				click := GetTokenAttr(&tn, "a", "onclick")

				if click != "" {
					continue
				}

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
				log.Println("Close artist tag")
			}
		} else if stat == html.SelfClosingTagToken {
		}
	}

	if err != nil {
		log.Println("Parse page error: " + fmt.Sprintf("%v", err))
	}

	r = "{\"artists\":\""

	if len(artists) > 0 {
		for _, s := range artists {
			if s == "?" {
				continue
			}

			r += s + ","
		}

		r = r[:len(r)-1]
	}

	r += "\"}"

	log.Println("Parsing result is: " + r)

	return r
}

func (self R34XXX) GetCharacter(id string) string {
	var r string

	log.Println("Parsing post id: " + id)

	if id == "" {
		log.Println("Wrong post id.")

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
		log.Println("Failed GET request.")

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
			} else if tn.Data == "a" && atag {
				href := GetTokenAttr(&tn, "a", "href")

				if strings.Contains(href, "page=wiki") {
					continue
				}

				click := GetTokenAttr(&tn, "a", "onclick")

				if click != "" {
					continue
				}

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
		log.Println("Parse page error: " + fmt.Sprintf("%v", err))
	}

	r = "{\"characters\":\""

	if len(characters) > 0 {
		for _, s := range characters {
			r += s + ","
		}

		r = r[:len(r)-1]
	}

	r += "\"}"

	log.Println("Parsing result is: " + r)

	return r
}

func (self R34XXX) GetAutocomplete(id string) string {
	url := "https://rule34.xxx/autocomplete.php?q=" + id

	log.Println("GetAutocomplete: Formed url is ", url)

	client := &http.Client{}
	req, _ := http.NewRequest("POST", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	//res, err := http.Get(url)

	if err != nil || res == nil {
		log.Println("GetAutocomplete: Failed GET request.")

		return ""
	}

	defer res.Body.Close()

	//responseData, err := ioutil.ReadAll(res.Body)
	responseData, err := io.ReadAll(res.Body)

	if err != nil {
		log.Println("GetAutocomplete: Read body data error:" + err.Error())

		return ""
	}

	final := string(responseData)

	log.Println("Autocomplete: " + final)

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

func (self R34XXX) Search(key string, pid string) string {
	var r string

	icount := 0
	ioffset := 0

	//var nodes []JsNode
	//var posts XPosts

	//ss := "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=42&json=0&tags=" + key
	ss := "https://rule34.xxx/index.php?page=post&s=list&tags=" + key

	if pid != "" {
		ioffset, _ = strconv.Atoi(pid)
		ioffset *= 42
		pid = strconv.Itoa(ioffset)
		ss += "&pid=" + pid
	}

	log.Println("Search url: " + ss)

	client := &http.Client{}
	req, _ := http.NewRequest("GET", ss, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	if err != nil || res == nil {
		log.Println("Search failed. Tag: " + key)
	}

	defer res.Body.Close()

	/*
		responseData, err := io.ReadAll(res.Body)

		if err != nil {
			log.Println("Read body data error:" + err.Error())
		}

		log.Println("Read body result: " + string(responseData))

		final := string(responseData)

		//log.Println(final)

		err = xml.Unmarshal([]byte(final), &posts)

		//err = json.Unmarshal([]byte(final), &nodes)

		if err != nil {
			log.Println("Parse error " + err.Error())
		}

		fmt.Printf("Count : %+v \n", posts.Count)
		fmt.Printf("Offset : %+v \n", posts.Offset)

		//log.Println("Elements count is " + string(len(nodes)))

		r = "["
		//xxx_row := 1
		for _, n := range posts.Posts {
			t := n.Tags

			if string(t[0:1]) == "\\" {
				continue
			}

			//log.Println("Tags " + strconv.Itoa(xxx_row) + " " + t)
			//fmt.Printf("%x.\n", t)
			//xxx_row++

			if IsPrintable(t) == false {
				fmt.Printf("Non printable should correct.\n")
				t = strings.Map(func(r rune) rune {
					if unicode.IsPrint(r) {
						return r
					}
					return -1
				}, t)
			}

			//log.Println("Element " + n.Hash)
			r += "{"
			r += `"id":`
			r += `"` + strconv.Itoa(n.Id) + `",`

			//t = strings.Replace(t, `\||/`, "", -1)
			t = strings.Replace(t, "\\", "\\\\", -1)
			t = strings.Replace(t, "\n", "", -1)
			t = strings.Replace(t, "\"", " ", -1)

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

		//log.Println("JSON: " + r)
	*/

	type EL struct {
		id    string
		tags  string
		image string
		thumb string
	}

	var elems []EL

	tok := html.NewTokenizer(res.Body)

	var ttype string

	var alink bool

	ttype = ""
	alink = false

	log.Println("Start search procedure...")

wloop:
	for {
		stat := tok.Next()

		switch {
		case stat == html.ErrorToken:
			log.Println("Tokenizer error.")
			break wloop
		case stat == html.StartTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "li", "class", "tag-type-metadata") || IsTokenAttr(&tn, "li", "class", "tag-type-general") {
				log.Println("Token for tag.")
				ttype = "tag"
			} else if IsTokenAttr(&tn, "li", "class", "tag-type-artist") {
				log.Println("Token for thumb.")
				ttype = "artist"
			} else if IsToken(&tn, "span", "thumb") {
				log.Println("Token for thumb.")
				ttype = "thumb"
				el := EL{}
				el.id = fmt.Sprintf("%v", GetTokenAttr(&tn, "span", "id")[1:])
				elems = append(elems, el)

			} else if IsToken(&tn, "div", "image-list") {
				log.Println("Token for images list.")
				ttype = "images"
			} else if IsToken(&tn, "div", "pagination") {
				log.Println("Token for pagination.")
				ttype = "pagination"
			}

			if tn.Data == "a" {
				log.Println("Token for A.")

				if ttype == "thumb" {
					alink = true
					imgHref := "https://rule34.xxx" + GetTokenAttr(&tn, "a", "href")
					//thumbs = append(thumbs, thumbHref)
					elems[len(elems)-1].image = fmt.Sprintf("%v", imgHref)
				} else if ttype == "pagination" {
					alink = true

					alt := GetTokenAttr(&tn, "a", "alt")

					if alt != "last page" {
						continue
					}

					href := GetTokenAttr(&tn, "a", "href")

					if href != "" {
						re := regexp.MustCompile(`pid=(.+)$`)
						mc := fmt.Sprintf("%v", re.FindString(href))
						mc = strings.Replace(mc, "pid=", "", 1)

						icount, err = strconv.Atoi(mc)

						if err != nil {
							icount = 0
						}
					}
				}
			}
		case stat == html.EndTagToken:
			tn := tok.Token()

			if tn.Data == "li" || tn.Data == "span" || tn.Data == "div" {
				ttype = ""
			}

			if tn.Data == "a" {
				log.Println("Token a closing.")
				alink = false
			}
		case stat == html.SelfClosingTagToken:
			tn := tok.Token()

			log.Println("Token tag is: " + tn.Data)
			if IsToken(&tn, "img", "preview") && alink == true {
				log.Println("Token for image preview.")

				elems[len(elems)-1].tags = GetTokenAttr(&tn, "img", "title")
				elems[len(elems)-1].thumb = GetTokenAttr(&tn, "img", "src")

				elems[len(elems)-1].image = self.parseImage("https://rule34.xxx/index.php?page=post&s=view&id=" + elems[len(elems)-1].id)
			}
		}
	}

	log.Println("End search procedure...")

	r = "["

	for _, e := range elems {
		r += "{"
		r += `"id":`
		r += `"` + e.id + `",`

		r += `"tags":`
		r += `"` + e.tags + `",`

		r += `"thumb":`
		r += `"` + e.thumb + `",`

		r += `"image":`
		r += `"` + e.image + `"`

		r += "},\n"
	}

	if icount < ioffset {
		icount = ioffset
	}
	r += "{" + `"count":"` + strconv.Itoa(icount) + `", "offset":"` + strconv.Itoa(ioffset) + `"}`
	r += "]"

	return r
}

func (self R34XXX) SearchImage(id string) string {
	var r string

	var posts XPosts

	ss := "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=42&json=0&id=" + id

	log.Println("Search image. Id: " + id)

	client := &http.Client{}
	req, _ := http.NewRequest("GET", ss, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	if err != nil || res == nil {
		log.Println("Search image failed. Id: " + id)
	}

	defer res.Body.Close()

	responseData, err := ioutil.ReadAll(res.Body)

	if err != nil {
		log.Println("Read body data error:" + err.Error())
	}

	final := string(responseData)

	err = xml.Unmarshal([]byte(final), &posts)

	if err != nil {
		log.Println("Parse error " + err.Error())
	} else {
		log.Println("Parse post ", posts.Posts[0])
	}

	fmt.Printf("Count : %+v \n", posts.Count)
	fmt.Printf("Offset : %+v \n", posts.Offset)

	r = "{"

	if posts.Count > 0 {
		post := posts.Posts[0]

		r += "\"url\" : \"" + post.File_url + "\""
		r += ", \"thumb\" : \"" + post.Preview_url + "\""
		r += ", \"sample\" : \"" + post.Sample_url + "\""
	}

	r += "}"

	return r
}

func (self R34XXX) SearchImageInfo(id string) string {
	var r string

	ss := "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=42&json=0&id=" + id

	log.Println("Search image. Id: " + id)

	client := &http.Client{}
	req, _ := http.NewRequest("GET", ss, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	if err != nil || res == nil {
		log.Println("Search image failed. Id: " + id)
	}

	defer res.Body.Close()

	/*

		responseData, err := io.ReadAll(res.Body)

		if err != nil {
			log.Println("Read body data error:" + err.Error())
		}

		final := string(responseData)

		err = xml.Unmarshal([]byte(final), &posts)

		if err != nil {
			log.Println("Parse error " + err.Error())
		} else {
			log.Println("Parse post ", posts.Posts[0])
		}

		fmt.Printf("Count : %+v \n", posts.Count)
		fmt.Printf("Offset : %+v \n", posts.Offset)

		r = "{"

		if posts.Count > 0 {
			post := posts.Posts[0]

			r += "\"url\" : \"" + post.File_url + "\""
			r += ", \"thumb\" : \"" + post.Preview_url + "\""
			r += ", \"sample\" : \"" + post.Sample_url + "\""
			r += ", \"tags\" : \"" + post.Tags + "\""
		}

		r += "}"

	*/

	return r
}

func (self R34XXX) GetImage(uri string) *http.Response {
	response, err := http.Get(uri)

	log.Println("GetImage: " + uri)

	if err != nil {
		log.Println("Cannot get image from url: " + uri)

		return nil
	}

	if response.StatusCode != 200 {
		log.Println("Received non 200 response code")

		return nil
	}

	return response
}

func (self R34XXX) GetVideo(uri string) *http.Response {
	response, err := http.Get(uri)

	log.Println("GetVideo: " + uri)

	if err != nil {
		log.Println("Cannot get video as: " + err.Error())

		return nil
	}

	if response.StatusCode != 200 {
		log.Println("Received non 200 response code")

		return nil
	}

	return response
}
