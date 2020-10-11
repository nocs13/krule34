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
	LogDebug("Checking uri is image " + uri)

	res, err := http.Head(uri)

	if err != nil {
		return false
	}

	LogDebug("Checking uri content length")

	if res.ContentLength < 1 {
		LogInfo("URI [" + uri + "] content length i too small.")

		return false
	}

	LogDebug("Checking uri content type")

	contentType := res.Header.Get("Content-type")

	LogDebug("Checking uri content type is " + contentType)

	if contentType == "" || strings.Contains(contentType, "image") == false {
		LogInfo("URI [" + uri + "] is not image type it is [" + contentType + "] content type.")

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

//Search is ...
func Search(key string, pid string) *Content {
	var r Content

	r = Content{}

	r.tags = list.New()
	r.pages = list.New()
	r.images = list.New()
	r.thumbs = list.New()
	r.artist = list.New()

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

	ttype = ""
	alink = false
	acount = 0

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
				var anim bool

				anim = false

				LogDebug("Token for image preview.")
				tit := GetTokenAttr(&tn, "img", "title")

				if tit != "" && strings.Contains(tit, " animated ") {
					anim = true

					LogDebug("Token image preview is aniated.")
				}

				src := GetTokenAttr(&tn, "img", "src")

				if src != "" {
					LogDebug("Token image preview source: " + src)

					if strings.Contains(src, "?") {
						src = strings.Split(src, "?")[0]
					}

					tmp := src

					//r.thumbs.PushBack(src)
					src = strings.Replace(src, "thumbnail_", "sample_", 1)
					src = strings.Replace(src, "thumbnails", "samples", 1)
					LogDebug("Token image preview source: " + src)

					//_, err := url.ParseRequestURI(src)

					if IsImage(src) == false {
						src = tmp

						src = strings.Replace(src, "thumbnail_", "sample_", 1)
						src = strings.Replace(src, "thumbnails", "/samples", 1)

						//_, err := url.ParseRequestURI(src)

						if IsImage(src) == false {
							src = ""
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
						r.images.PushBack(src)
						r.thumbs.PushBack(tmp)
					} else {
						LogInfo("thumb [" + tmp + "] not parsed correct.")
					}
				}
			}
		}
	}

	if err != nil {
		LogError("Search document creator failed")
	}

	return &r
}
