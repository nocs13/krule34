package main

import (
	"io"
	"krule34/libs"
	"net/http"
	"os"
	"strconv"
	"sync"
)

//FnRoute is ...
type FnRoute func(http.ResponseWriter, *http.Request)

//WebRoute is ...
type WebRoute struct {
	id     string
	handle FnRoute
}

//WebHandler is ...
type WebHandler struct {
	mu sync.Mutex // guards n
	n  int

	routes []*WebRoute
}

func (h *WebHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	h.mu.Lock()

	libs.LogDebug("Run web handler " + r.URL.Path)

	var url = r.URL.Path

	if len(url) > 7 {
		libs.LogDebug("Run web  " + r.URL.Path[0:8])
	}

	if len(url) > len("/static/") && url[0:8] == "/static/" {
		libs.LogDebug("Handle static")
		handleStatic(w, r)
	} else if len(url) > len("/artist/") && url[0:8] == "/artist/" {
		libs.LogDebug("Handle artist")
		handleArtist(w, r)
	} else if len(url) > len("/character/") && url[0:11] == "/character/" {
		libs.LogDebug("Handle artist")
		handleCharacter(w, r)
	} else if len(url) > len("/images/") && url[0:8] == "/images/" {
		libs.LogDebug("Handle images")
		handleGetImage(w, r)
	} else if len(url) > len("/thumbnails/") && url[0:12] == "/thumbnails/" {
		libs.LogDebug("Handle thumbnails")
		handleGetImage(w, r)
	} else {
		libs.LogDebug("routes count " + strconv.Itoa(len(h.routes)))

		for _, rt := range h.routes {
			if rt.id == url {
				rt.handle(w, r)
			}
		}
	}

	defer h.mu.Unlock()
}

//Add is ...
func (h *WebHandler) Add(id string, handle FnRoute) {
	var p = new(WebRoute)

	p.id = id
	p.handle = handle

	h.routes = append(h.routes, p)
}

func getValue(r *http.Request, key string) string {
	keys, ok := r.URL.Query()[key]

	if !ok || len(keys[0]) < 1 {
		libs.LogDebug("Url query key " + key + " is missing.")

		return ""
	}

	return keys[0]
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
	libs.LogDebug("run handler hello " + r.URL.Path)

	t := libs.NewPage()

	t.Init("index.html")

	io.WriteString(w, t.Content)
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler search " + r.URL.Path)

	var key = getValue(r, "key")

	libs.LogDebug("run handler search " + key)

	var content = libs.SearchUS(key, "")

	str := libs.ContentToXML(content)

	io.WriteString(w, str)
}

func handlePage(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler page " + r.URL.Path)

	var tag = getValue(r, "tag")
	var pid = getValue(r, "pid")

	libs.LogDebug("run handler search " + tag + " " + pid)

	var content = libs.SearchUS(tag, pid)

	str := libs.ContentToXML(content)

	io.WriteString(w, str)
}

func handleTag(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler tag " + r.URL.Path)

	var tag = getValue(r, "tag")

	libs.LogDebug("run handler tag " + tag)

	var content = libs.SearchUS(tag, "")

	str := libs.ContentToXML(content)

	io.WriteString(w, str)
}

func handleGetArtist(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler get artist " + r.URL.Path)

	var id = getValue(r, "id")

	libs.LogDebug("run handler getartist " + id)

	url := "https://rule34.us/index.php?r=posts/view&id=" + id

	str := libs.GetArtistUS(url)

	if str == "" {
		str = "<empty></empty>"
	}

	io.WriteString(w, str)
}

func handleGetCharacter(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler get character " + r.URL.Path)

	var id = getValue(r, "id")

	libs.LogDebug("run handler getcharacter " + id)

	url := "https://rule34.us/index.php?r=posts/view&id=" + id

	str := libs.GetCharacterUS(url)

	if str == "" {
		str = "<empty></empty>"
	}

	io.WriteString(w, str)
}

func handleArtist(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler artist " + r.URL.Path)

	t := libs.NewPage()

	t.Init("index.html")

	io.WriteString(w, t.Content)
}

func handleCharacter(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler character " + r.URL.Path)

	t := libs.NewPage()

	t.Init("index.html")

	io.WriteString(w, t.Content)
}

func handleGetImage(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler get image " + r.URL.Path)

	ri := libs.GetImageUS(r.URL.Path)

	if ri == nil {
		libs.LogError("while handle get image " + r.URL.Path)
	}

	w.Header().Set("Content-Type", "image/jpeg")
	io.Copy(w, ri)
}

func handleGetThumbnail(w http.ResponseWriter, r *http.Request) {
	libs.LogDebug("run handler character " + r.URL.Path)

	t := libs.NewPage()

	t.Init("index.html")

	io.WriteString(w, t.Content)
}

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "5000"
	}

	libs.SetLogLevel(5)

	libs.LogInfo("Using port: " + port)

	var h = new(WebHandler)

	h.Add("/", handleIndex)
	h.Add("/tag", handleTag)
	h.Add("/page", handlePage)
	h.Add("/search", handleSearch)
	h.Add("/getartist", handleGetArtist)
	h.Add("/getcharacter", handleGetCharacter)

	h.Add("/thumbnails", handleGetThumbnail)
	h.Add("/images", handleGetImage)

	h.Add("/sitemap.xml", handleSitemap)
	h.Add("/BingSiteAuth.xml", handleBingSiteAuth)
	h.Add("/googleb295dd6d4113b434.html", handleGoogleSiteAuth)

	http.Handle("/", h)
	http.ListenAndServe(":"+port, nil)
}
