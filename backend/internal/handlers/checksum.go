package handlers

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/taheri24/xpanel/backend/pkg/config"
	"go.uber.org/fx"
)

type ChecksumHandler struct {
	cfg *config.Config
}

func NewChecksumHandler(cfg *config.Config) *ChecksumHandler {
	return &ChecksumHandler{cfg: cfg}
}

// @Summary Get xfeature checksums
// @Description Calculate the MD5 checksum for all xfeature XML files
// @Tags xfeatures
// @Accept  json
// @Produce  json
// @Success 200 {object} map[string]string "Map of file path to checksum"
// @Failure 500 {object} map[string]interface{} "Failed to calculate checksums"
// @Router /api/v1/checksums [get]
func (h *ChecksumHandler) GetChecksums(c *gin.Context) {
	basePath := h.cfg.Feature.XFeatureFileLocation

	checksums := make(map[string]string)
	if err := filepath.WalkDir(basePath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() {
			return nil
		}

		if strings.EqualFold(filepath.Ext(d.Name()), ".xml") {
			checksum, err := calculateMD5(path)
			if err != nil {
				return err
			}

			relPath, err := filepath.Rel(basePath, path)
			if err != nil {
				relPath = path
			}

			checksums[relPath] = checksum
		}

		return nil
	}); err != nil {
		slog.Error("Failed to calculate checksums", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate checksums"})
		return
	}

	c.JSON(http.StatusOK, checksums)
}

func calculateMD5(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hasher := md5.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hasher.Sum(nil)), nil
}

// ChecksumModule exports the checksum handler module for fx
var ChecksumModule = fx.Options(
	fx.Provide(NewChecksumHandler),
)
