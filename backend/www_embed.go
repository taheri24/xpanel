//go:build prod
// +build prod

package main

import "embed"

// wwwFS embeds the www directory for production builds.
// This allows static assets to be bundled directly into the binary.
//
//go:embed www
var wwwFS embed.FS
