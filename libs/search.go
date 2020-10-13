package libs

import (
	"container/list"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"golang.org/x/net/html"
)

//Content is ...
type Content struct {
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
			}

			if IsToken(&tn, "div", "content_push") {
				divPushContent = false
				LogInfo("Push content unset.")
			}
		} else if stat == html.SelfClosingTagToken {
		}
	}

	if err != nil {
		LogError("Parse page error: " + fmt.Sprintf("%v", err))
	}

	LogInfo("Parsing result is: " + r)

	return r
}

//Search is ...
func Search(key string, pid string) *Content {
	var r Content

	r = Content{}

	r.tags = list.New()
	r.pages = list.New()
	r.images = list.New()
	r.thumbs = list.New()
	r.artist = list.New()

	var bb string

	bb = "https://rule34.xxx/"

	var ss string
	ss = "https://rule34.xxx/index.php?page=post&s=list&tags=" + key

	if pid != "" {
		ss += "&pid=" + pid
	}

	client := &http.Client{}
	req, _ := http.NewRequest("GET", ss, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	//res, err := client.Get("https://www.google.com/search?q=" + s)

	if err != nil || res == nil {
		//Log("Search failed.")
	}

	defer res.Body.Close()

	//doc, err := goquery.NewDocumentFromReader(res.Body)
	//Log("Search document read.")

	tok := html.NewTokenizer(res.Body)

	var ttype string

	var alink bool
	var acount int

	var thumbHref string

	ttype = ""
	alink = false
	acount = 0

	LogInfo("Start search procedure...")

wloop:
	for {
		stat := tok.Next()

		switch {
		case stat == html.ErrorToken:
			LogDebug("Tokenizer error.")
			break wloop
		case stat == html.StartTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "li", "class", "tag-type-metadata") || IsTokenAttr(&tn, "li", "class", "tag-type-general") {
				LogDebug("Token for tag.")
				ttype = "tag"
				acount = 0
			} else if IsTokenAttr(&tn, "li", "class", "tag-type-artist") {
				LogDebug("Token for thumb.")
				ttype = "artist"
			} else if IsToken(&tn, "span", "thumb") {
				LogDebug("Token for thumb.")
				ttype = "thumb"
			} else if IsToken(&tn, "div", "pagination") {
				LogDebug("Token for pagination.")
				ttype = "pagination"
			}

			if tn.Data == "a" {
				LogDebug("Token for A.")

				if ttype == "tag" || ttype == "artist" {
					alink = true
					acount++

					if acount == 3 {
						href := GetTokenAttr(&tn, "a", "href")

						if href != "" {
							re := regexp.MustCompile(`tags=(.+)$`)
							mc := fmt.Sprintf("%v", re.FindString(href))
							mc = strings.Replace(mc, "tags=", "", 1)

							LogDebug("Token tag is: " + mc)

							if mc != "" && ttype == "tag" {
								r.tags.PushBack(mc)
							} else if mc != "" && ttype == "artist" {
								r.artist.PushBack(mc)
							}
						}
					}
				} else if ttype == "thumb" {
					alink = true
					thumbHref = GetTokenAttr(&tn, "a", "href")
				} else if ttype == "pagination" {
					alink = true

					href := GetTokenAttr(&tn, "a", "href")

					if href != "" {
						re := regexp.MustCompile(`pid=(.+)$`)
						mc := fmt.Sprintf("%v", re.FindString(href))
						mc = strings.Replace(mc, "pid=", "", 1)

						LogDebug("Token page is: " + mc)

						if mc != "" {
							r.pages.PushBack(mc)
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
				LogDebug("Token a closing.")
				alink = false
			}
		case stat == html.SelfClosingTagToken:
			tn := tok.Token()

			LogDebug("Token text is: " + tn.Data)
			if IsToken(&tn, "img", "preview") && alink == true {
				//var anim bool

				//anim = false

				LogDebug("Token for image preview.")
				tit := GetTokenAttr(&tn, "img", "title")

				if tit != "" && strings.Contains(tit, " animated ") {
					//anim = true

					LogDebug("Token image preview is aniated.")
				}

				//src := GetTokenAttr(&tn, "img", "src")

				//thumbs.PushBack(src)
				src := parseImage(bb + thumbHref)

				if src != "" {
					if strings.Contains(src, "us.rule34.xxx") {
						src = strings.Replace(src, "us.rule34.xxx", "rule34.xxx", 1)
					}
					
					r.images.PushBack(src)
				}
			}
		}
	}

	LogInfo("End search procedure...")

	if err != nil {
		LogError("Search document creator failed")
	}

	/*for e := thumbs.Front(); e != nil; e = e.Next() {
		s := convertThumb(fmt.Sprintf("%v", e.Value), false)

		if s != "" {
			r.images.PushBack(s)
		}
	}*/

	return &r
}

//SearchUS is ...
func SearchUS(key string, pid string) *Content {
	var r Content

	r = Content{}

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
		ss += "&page=" + pid
	}

	LogDebug("SearchUS start request is: " + ss)

	client := &http.Client{}
	req, _ := http.NewRequest("GET", ss, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36")

	res, err := client.Do(req)

	//res, err := client.Get("https://www.google.com/search?q=" + s)

	if err != nil || res == nil {
		//Log("Search failed.")
	}

	defer res.Body.Close()

	//doc, err := goquery.NewDocumentFromReader(res.Body)
	//Log("Search document read.")

	tok := html.NewTokenizer(res.Body)

	var ttype string

	var alink bool
	var acount int

	var thumbHref string

	ttype = ""
	alink = false
	acount = 0

	LogInfo("Start search procedure...")

wloop:
	for {
		stat := tok.Next()

		switch {
		case stat == html.ErrorToken:
			LogDebug("Tokenizer error.")
			break wloop
		case stat == html.StartTagToken:
			tn := tok.Token()

			if IsTokenAttr(&tn, "li", "class", "copyright-tag") || IsTokenAttr(&tn, "li", "class", "general-tag") {
				LogDebug("Token for tag.")
				ttype = "tag"
				acount = 0
			} else if IsTokenAttr(&tn, "li", "class", "artist-tag") {
				LogDebug("Token for artist.")
				ttype = "artist"
			} else if IsToken(&tn, "div", "thumbnail-preview") {
				LogDebug("Token for thumb.")
				ttype = "thumb"
			} else if IsToken(&tn, "div", "pagination") {
				LogDebug("Token for pagination.")
				ttype = "pagination"
			}

			if tn.Data == "a" {
				LogDebug("Token for A.")

				if ttype == "tag" || ttype == "artist" {
					alink = true
					acount++

					if acount == 3 {
						href := GetTokenAttr(&tn, "a", "href")

						if href != "" {
							re := regexp.MustCompile(`tags=(.+)$`)
							mc := fmt.Sprintf("%v", re.FindString(href))
							mc = strings.Replace(mc, "tags=", "", 1)

							LogDebug("Token tag is: " + mc)

							if mc != "" && ttype == "tag" {
								r.tags.PushBack(mc)
							} else if mc != "" && ttype == "artist" {
								r.artist.PushBack(mc)
							}
						}
					}
				} else if ttype == "thumb" {
					alink = true
					thumbHref = GetTokenAttr(&tn, "a", "href")
				} else if ttype == "pagination" {
					alink = true

					href := GetTokenAttr(&tn, "a", "href")

					if href != "" {
						re := regexp.MustCompile(`pid=(.+)$`)
						mc := fmt.Sprintf("%v", re.FindString(href))
						mc = strings.Replace(mc, "pid=", "", 1)

						LogDebug("Token page is: " + mc)

						if mc != "" {
							r.pages.PushBack(mc)
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
				LogDebug("Token a closing.")
				alink = false
			}
		case stat == html.SelfClosingTagToken:
			tn := tok.Token()

			LogDebug("Token text is: " + tn.Data)
			if tn.Data == "img" && alink == true {
				//var anim bool

				//anim = false

				src := parseImageUS(thumbHref)

				if src != "" {
					r.images.PushBack(src)
				}
			}
		}
	}

	LogInfo("End search procedure...")

	if err != nil {
		LogError("Search document creator failed")
	}

	/*for e := thumbs.Front(); e != nil; e = e.Next() {
		s := convertThumb(fmt.Sprintf("%v", e.Value), false)

		if s != "" {
			r.images.PushBack(s)
		}
	}*/

	return &r
}
