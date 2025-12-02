//go:build !prod
// +build !prod

package main

import (
	"io/fs"
	"os"
)

var FS fs.FS

func isDirectory(pathName string) bool {
	s, err := os.Stat("www")
	return err == nil && s.IsDir()
}

func init() {
	if isDirectory("frontend/dist") {
		FS = os.DirFS("frontend/dist")
	} else if isDirectory("www") {
		FS = os.DirFS("www")
	} else {
		// Fallback to current directory if frontend/dist doesn't exist
		FS = os.DirFS(".")
	}
}
