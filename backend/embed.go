//go:build prod
// +build prod

package main

import "embed"

//go:embed frontend/dist
var FS embed.FS
