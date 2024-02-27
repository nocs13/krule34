package libs

import (
	"container/list"
	"encoding/xml"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"golang.org/x/net/html"
)

// Content is ...
type Content struct {
	ids    *list.List
	tags   *list.List
	images *list.List
	thumbs *list.List
	pages  *list.List
	artist *list.List
}

type R34US struct {
}

func (self R34US) convertThumb(src string, anim bool) string {
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

func (self R34US) parseImage(url string) string {
	var r string

	log.Println("Parsing url: " + url)

	if url == "" {
		log.Println("Wrong url.")

		return ""
	}

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
			log.Println("Actual image sourceis: " + ss)
		}

		if stat == html.ErrorToken {
			log.Println("Tokenizer error " + fmt.Sprintf("%v", tok.Err()))
			divPushContent = false
			break
		} else if stat == html.StartTagToken {
			if tn.Data == "img" {
				ss := GetTokenAttr(&tn, "img", "src")
				log.Println("Img is open id " + fmt.Sprintf("%v", count))

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
				log.Println("Open div class is: " + xst)

				divPushContent = true
				log.Println("Push content set.")
			}
		} else if stat == html.EndTagToken {
			if tn.Data == "img" {
				log.Println("Img is close id " + fmt.Sprintf("%v", count))
			} else if tn.Data == "video" {
				avideo = false
			}

			if IsToken(&tn, "div", "content_push") {
				divPushContent = false
				log.Println("Push content unset.")
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
		log.Println("Parse page error: " + fmt.Sprintf("%v", err))
	}

	log.Println("Parsing result is: " + r)

	return r
	/*
		if strings.Index(r, "https://video.rule34.us/") != -1 {
			return strings.Replace(r, "https://video.rule34.us/", "/video/", -1)
		}

		return strings.Replace(r, "https://img2.rule34.us", "", -1)
	*/
}

func (self R34US) GetTags(id string) string {
	var r string

	log.Println("Parsing post id: " + id)

	if id == "" {
		log.Println("Wrong post id.")

		return ""
	}
	url := "https://rule34.us/index.php?r=posts/view&id=" + id

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
			if IsTokenAttr(&tn, "li", "class", "artist-tag") {
				atag = true
				log.Println("Open artist tag")
			} else if IsTokenAttr(&tn, "li", "class", "character-tag") {
				ctag = true
				log.Println("Open character tag")
			} else if IsTokenAttr(&tn, "li", "class", "general-tag") {
				gtag = true
				log.Println("Open general tag")
			} else if tn.Data == "a" && (atag || ctag || gtag) {
				href := GetTokenAttr(&tn, "a", "href")

				if strings.Contains(href, "&q=") {
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

func (self R34US) GetArtist(url string) string {
	var r string

	log.Println("Parsing url: " + url)

	if url == "" {
		log.Println("Wrong url.")

		return ""
	}

	url = "https://rule34.us/index.php?r=posts/view&id=" + url

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

	var artists []string

	for {
		stat := tok.Next()

		tn := tok.Token()

		if stat == html.ErrorToken {
			break
		} else if stat == html.StartTagToken {
			if IsTokenAttr(&tn, "li", "class", "artist-tag") {
				atag = true
			} else if tn.Data == "a" && atag == true {
				href := GetTokenAttr(&tn, "a", "href")

				if href == "" {
					continue
				}

				re := regexp.MustCompile(`q=(.+)$`)
				mc := fmt.Sprintf("%v", re.FindString(href))
				mc = strings.Replace(mc, "q=", "", 1)

				if mc != "" {
					artists = append(artists, mc)
				}
			}
		} else if stat == html.EndTagToken {
			if tn.Data == "li" && atag {
				atag = false
			}
		} else if stat == html.SelfClosingTagToken {
		}
	}

	if err != nil {
		log.Println("Parse page error: " + fmt.Sprintf("%v", err))
	}

	/*
		r = "<artists>"

		if len(artists) > 0 {

			for _, s := range artists {
				r += "<artist>" + s + "</artist>"
			}
		}

		r += "</artists>"
	*/

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

func (self R34US) GetCharacter(url string) string {
	var r string

	log.Println("Parsing url: " + url)

	if url == "" {
		log.Println("Wrong url.")

		return ""
	}

	url = "https://rule34.us/index.php?r=posts/view&id=" + url

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
			if IsTokenAttr(&tn, "li", "class", "character-tag") {
				atag = true
			} else if tn.Data == "a" && atag == true {
				href := GetTokenAttr(&tn, "a", "href")

				if href == "" {
					continue
				}

				re := regexp.MustCompile(`q=(.+)$`)
				mc := fmt.Sprintf("%v", re.FindString(href))
				mc = strings.Replace(mc, "q=", "", 1)

				if mc != "" {
					characters = append(characters, mc)
				}
			}
		} else if stat == html.EndTagToken {
			if tn.Data == "li" && atag {
				atag = false
			}
		} else if stat == html.SelfClosingTagToken {
		}
	}

	if err != nil {
		log.Println("Parse page error: " + fmt.Sprintf("%v", err))
	}

	/*
		r = "<characters>"

		if len(characters) > 0 {
			for _, s := range characters {
				r += "<character>" + s + "</character>"
			}
		}

		r += "</characters>"
	*/

	r = "{\"characters\":\""

	if len(characters) > 0 {
		for _, s := range characters {
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

func (self R34US) GetAutocomplete(id string) string {
	url := "https://rule34.us/index.php?r=autocomplete&term=" + id + "&limit=10"

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

func (self R34US) Search(key string, pid string) string {
	var r Content

	offset := 0

	r = Content{}

	r.ids = list.New()
	r.tags = list.New()
	r.pages = list.New()
	r.images = list.New()
	r.thumbs = list.New()
	r.artist = list.New()

	//r=posts/index&q=legs&page=2

	//var bb string

	//bb = "https://rule34.us/"

	var ss string
	ss = "https://rule34.us/index.php?r=posts/index&q=" + key

	if pid != "" {
		offset, _ = strconv.Atoi(pid)
		offset = offset * 42
		//pid = strconv.Itoa(page)

		ss += "&page=" + pid
	}

	log.Println("XXX SearchUS start request is: " + ss)

	client := &http.Client{}
	req, _ := http.NewRequest("GET", ss, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	if err != nil || res == nil {
		log.Println("Search failed.")
	}

	defer res.Body.Close()

	//doc, err := goquery.NewDocumentFromReader(res.Body)
	//Log("Search document read.")

	tok := html.NewTokenizer(res.Body)

	var ttype string

	var alink bool
	var pagin bool = false
	var acount int
	var pcount int

	var thumbHref string
	var imageHref string

	ttype = ""
	alink = false
	acount = 0
	pcount = 0

	startTagList := false

	log.Println("Start search procedure...")

	ecount := 0

wloop:
	for {
		stat := tok.Next()

		switch {
		case stat == html.ErrorToken:
			tn := tok.Token()
			log.Println("Tokenizer error: ", tn.Data)

			ecount++

			if ecount > 10 {
				break wloop
			}
		case stat == html.StartTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "li", "class", "copyright-tag") ||
				IsTokenAttr(&tn, "li", "class", "general-tag") {
				log.Println("Token for tag.")
				ttype = "tag"
				acount = 0
			} else if IsTokenAttr(&tn, "li", "class", "artist-tag") {
				log.Println("Token for artist.")
				ttype = "artist"
				acount = 0
			} else if IsToken(&tn, "div", "thumbail-container") {
				log.Println("Token for thumbnails.")
				ttype = "thumb"
			} else if IsToken(&tn, "div", "pagination") {
				log.Println("Token for pagination.")
				ttype = "pagination"
				pagin = true
			} else if IsToken(&tn, "ul", "tag-list-left") {
				startTagList = true
				log.Println("Start tag list")
			}

			if tn.Data == "a" {
				log.Println("XXX A token opening.")
				log.Println("Actual type is " + ttype)
				log.Println("Actual count is " + fmt.Sprintf("%v", acount))

				href := GetTokenAttr(&tn, "a", "href")
				alt := GetTokenAttr(&tn, "a", "alt")

				log.Println("XXX A token attrs: ", href, alt)

				if (startTagList == true) && (ttype == "tag" || ttype == "artist") {
					alink = true
					acount++

					if acount == 3 {
						href := GetTokenAttr(&tn, "a", "href")

						if href != "" {
							re := regexp.MustCompile(`q=(.+)$`)
							mc := fmt.Sprintf("%v", re.FindString(href))
							mc = strings.Replace(mc, "q=", "", 1)

							log.Println("Token tag is: " + mc)

							if mc != "" && ttype == "tag" {
								r.tags.PushBack(mc)
							} else if mc != "" && ttype == "artist" {
								r.artist.PushBack(mc)
							}
						}

						acount = 0
					}
				} else if ttype == "thumb" {
					alink = true
					thumbHref = GetTokenAttr(&tn, "a", "href")
				} else if pagin && alt == "last page" {

					re := regexp.MustCompile("([0-9]+)")
					pages, err := strconv.Atoi(re.FindAllString(href, 1)[0])

					if err != nil {
						log.Println("XXX  pages get error: ", err.Error())
					} else {
						log.Println("XXX  pages : ", pages)
					}

					if pages < 1 {
						pages = 0
					}

					pcount = pages
				}
			} else if tn.Data == "img" && ttype == "thumb" {
				imageHref = GetTokenAttr(&tn, "img", "src")
				log.Println("thumblain link is " + imageHref)
			}
		case stat == html.EndTagToken:
			tn := tok.Token()

			if tn.Data == "li" || tn.Data == "span" {
				ttype = ""
			} else if tn.Data == "div" && IsToken(&tn, "div", "thumbail-container") {
				log.Println("XXX Token div thumbail-container closing.")
				ttype = ""
			} else if tn.Data == "div" && pagin {
				log.Println("XXX Token div pagination closing.")
				ttype = ""
				pagin = false
			} else if tn.Data == "a" {
				log.Println("XXX A Token closing: ", len(tn.Attr))
				alink = false
			}
		case stat == html.SelfClosingTagToken:
			tn := tok.Token()

			log.Println("XXX Self close token text is: " + tn.Data)
			if tn.Data == "img" && alink == true {
				imageHref = GetTokenAttr(&tn, "img", "src")
				src := self.parseImage(thumbHref)
				//src := ""
				if src != "" && thumbHref != "" {
					r.images.PushBack(src)

					re := regexp.MustCompile(`id=(.+)$`)
					mc := fmt.Sprintf("%v", re.FindString(thumbHref))
					mc = strings.Replace(mc, "id=", "", 1)

					r.ids.PushBack(mc)
					r.thumbs.PushBack(imageHref)
					//r.thumbs.PushBack(strings.Replace(imageHref, "https://img2.rule34.us", "", -1))
				}
			} else if tn.Data == "img" && ttype == "thumb" {
				imageHref = GetTokenAttr(&tn, "img", "src")
				log.Println("thumbnail link is " + imageHref)
			}
		case stat == html.TextToken:
			tn := tok.Token()
			log.Println("XXX Text token : " + tn.Data)

			if ttype == "tag" || ttype == "artist" {
				log.Println("Tag content is: " + tn.Data)
			}
		}
	}

	log.Println("End search procedure...")

	if err != nil {
		log.Println("Search document creator failed")

		return ""
	}

	type EL struct {
		id    string
		image string
		thumb string
	}

	var elems []EL

	for e := r.images.Front(); e != nil; e = e.Next() {
		el := EL{}
		el.image = fmt.Sprintf("%v", e.Value)
		elems = append(elems, el)
	}

	var rs string
	var count int32 = 0

	for e := r.ids.Front(); e != nil; e = e.Next() {
		//el := EL{}
		//el.image = fmt.Sprintf("%v", e.Value)
		elems[count].id = fmt.Sprintf("%v", e.Value)
		count++
	}

	count = 0

	for e := r.thumbs.Front(); e != nil; e = e.Next() {
		elems[count].thumb = fmt.Sprintf("%v", e.Value)
		count++
	}

	rs = "["

	for _, e := range elems {
		rs += "{"
		rs += `"id":`
		rs += `"` + e.id + `",`

		//t = strings.Replace(t, `\||/`, "", -1)
		//t = strings.Replace(t, "\\", "\\\\", -1)
		//t = strings.Replace(t, "\n", "", -1)
		//t = strings.Replace(t, "\"", " ", -1)

		rs += `"tags":`
		rs += `"` + "" + `",`

		rs += `"thumb":`
		rs += `"` + e.thumb + `",`

		rs += `"image":`
		rs += `"` + e.image + `"`

		rs += "},\n"
		count++
	}

	if offset > (pcount * 42) {
		pcount, _ = strconv.Atoi(pid)
	}

	rs += "{" + `"count":"` + strconv.Itoa(pcount*42) + `", "offset":"` + strconv.Itoa(offset) + `"}`
	rs += "]"

	return rs
}

func (self R34US) SearchImage(id string) string {
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

func (self R34US) SearchImageInfo(id string) string {
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

	return r
}

func (self R34US) GetImage(uri string) *http.Response {
	log.Println("GetImage: " + uri)

	response, err := http.Get(uri)

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

func (self R34US) GetVideo(uri string) *http.Response {
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
