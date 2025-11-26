//go:build !prod
// +build !prod

package main

import (
	"io/fs"
	"os"
)

var FS fs.FS = os.DirFS("frontend/dist")
