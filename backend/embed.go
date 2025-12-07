//go:build prod
// +build prod

package main

import "embed"

//go:embed www
var FS embed.FS
