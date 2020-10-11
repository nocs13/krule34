package libs

import (
	"os"
)

var loglevel uint = 5

//SetLogLevel ...
func SetLogLevel(lvl uint) {
	loglevel = lvl
}

func log(lvl uint, txt string) {
	if lvl > loglevel {
		return
	}

	tex_level := ""

	switch lvl {
	case 0:
		tex_level = "ERROR"
		break
	case 1:
		tex_level = "WARNING"
		break
	case 2:
		tex_level = "INFO"
		break
	case 3:
		tex_level = "DEBUG"
		break
	default:
		tex_level = "GENERAL"
	}

	os.Stderr.WriteString(tex_level + ": " + txt + "\n")
}

//LogError ...
func LogError(txt string) {
	log(0, txt)
}

//LogWarning ...
func LogWarning(txt string) {
	log(1, txt)
}

//LogInfo ...
func LogInfo(txt string) {
	log(2, txt)
}

//LogDebug ...
func LogDebug(txt string) {
	log(3, txt)
}

//LogGeneral ...
func LogGeneral(txt string) {
	log(4, txt)
}