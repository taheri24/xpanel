// +build !prod

package main

import (
	"io/fs"
	"os"
)

var FS fs.FS

func init() {
	if _, err := os.Stat("frontend/dist"); err == nil {
		FS = os.DirFS("frontend/dist")
	} else {
		// Fallback to current directory if frontend/dist doesn't exist
		FS = os.DirFS(".")
	}
}
