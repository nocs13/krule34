package libs

import (
	"os"
)

func Log(txt string) {
	os.Stderr.WriteString(txt + "\n")
}
