package libs

import "fmt"

//ContentToXML ...
func ContentToXML(c *Content) string {
	var res string

	res = "<content>"

	for e := c.tags.Front(); e != nil; e = e.Next() {
		res += "<tag>" + fmt.Sprintf("%v", e.Value) + "</tag>"
	}

	for e := c.pages.Front(); e != nil; e = e.Next() {
		res += "<page>" + fmt.Sprintf("%v", e.Value) + "</page>"
	}

	for e := c.images.Front(); e != nil; e = e.Next() {
		res += "<image>" + fmt.Sprintf("%v", e.Value) + "</image>"
	}

	for e := c.thumbs.Front(); e != nil; e = e.Next() {
		res += "<thumb>" + fmt.Sprintf("%v", e.Value) + "</thumb>"
	}

	for e := c.artist.Front(); e != nil; e = e.Next() {
		res += "<artist>" + fmt.Sprintf("%v", e.Value) + "</artist>"
	}

	res += "</content>"

	return res
}
