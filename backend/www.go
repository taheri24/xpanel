//go:build !prod
// +build !prod

package main

import (
	"io/fs"
	"os"
)

// FS provides filesystem access to static assets during non-production builds.
// It attempts to load from frontend/dist first, then www, then current directory.
var FS fs.FS

func isDirectory(pathName string) bool {
	s, err := os.Stat(pathName)
	return err == nil && s.IsDir()
}

func init() {
	if isDirectory("frontend/dist") {
		FS = os.DirFS("frontend/dist")
	} else if isDirectory("www") {
		FS = os.DirFS("www")
	} else {
		// Fallback to current directory if frontend/dist and www don't exist
		FS = os.DirFS(".")
	}
}
