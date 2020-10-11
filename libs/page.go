package libs

import (
	"fmt"
	"io/ioutil"
)

type Page struct {
	Content string
}

func NewPage() Page {
	page := Page{Content: "null"}

	return page
}

func (t *Page) Init(id string) {
	fmt.Println("init page " + id)

	content, err := ioutil.ReadFile("static/html/" + id)

	if err != nil {
		Log("Cannot read file " + id)
	}

	txt := string(content)

	t.Content = string(txt)
}

func ReadFile(path string) string {
	content, err := ioutil.ReadFile(path)

	if err != nil {
		Log("Cannot read file " + path)

		return ""
	}

	return string(content)
}
