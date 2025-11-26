//go:build !prod
// +build !prod

package main

import (
	"net/http"
)

var FS http.FileSystem = http.Dir("frontend/dist")
