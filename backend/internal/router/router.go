package router

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/taheri24/xpanel/backend/internal/handlers"
	"github.com/taheri24/xpanel/backend/internal/middleware"
	"github.com/taheri24/xpanel/backend/pkg/config"
	"go.uber.org/fx"
)

// moduleSystems defines the dependencies for the router
type moduleSystems struct {
	fx.In

	Config          *config.Config
	HealthHandler   *handlers.HealthHandler
	ChecksumHandler *handlers.ChecksumHandler
	UserHandler     *handlers.UserHandler
	XFeatureHandler *handlers.XFeatureHandler
}

// NewRouter creates a new Gin router with all routes configured
func NewRouter(r moduleSystems) *gin.Engine {
	// Set gin mode based on environment
	if r.Config.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Health check routes
	router.GET("/health", r.HealthHandler.Health)
	router.GET("/ready", r.HealthHandler.Ready)

	// Swagger documentation routes
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		v1.GET("/checksums", r.ChecksumHandler.GetChecksums)

		users := v1.Group("/users")
		{
			users.GET("", r.UserHandler.GetAll)
			users.GET("/:id", r.UserHandler.GetByID)
			users.POST("", r.UserHandler.Create)
			users.PUT("/:id", r.UserHandler.Update)
			users.DELETE("/:id", r.UserHandler.Delete)
		}

		// XFeature routes
		xs := v1.Group("/x")
		{
			xs.GET("", r.XFeatureHandler.ListFeatures)
			xs.GET("/:name", r.XFeatureHandler.GetFeature)
			xs.GET("/:name/checksum", r.XFeatureHandler.GetFeatureChecksum)
			xs.GET("/:name/backend", r.XFeatureHandler.GetBackendInfo)
			xs.GET("/:name/frontend", r.XFeatureHandler.GetFrontendElements)
			xs.GET("/:name/mappings", r.XFeatureHandler.ResolveMappings)
			xs.POST("/:name/queries/:queryId", r.XFeatureHandler.ExecuteQuery)
			xs.POST("/:name/query/:queryId", r.XFeatureHandler.ExecuteQuery)
			xs.GET("/:name/query/:queryId", r.XFeatureHandler.ExecuteQuery)
			xs.POST("/:name/actions/:actionId", r.XFeatureHandler.ExecuteAction)
		}
	}

	// Serve embedded frontend static files
	//setupStaticFiles(router)
	//router.StaticFile("/", "./www/index.html")
	//router.Static("/assets", "./www/assets")
	//router.StaticFS("/", http.Dir())
	httpFS := http.FS(FS)
	router.GET("/assets/*filepath", func(c *gin.Context) {
		c.FileFromFS("www/"+c.Request.URL.Path, httpFS)
	})
	router.GET("/", func(c *gin.Context) {
		//		c.FileFromFS("/www/index.html", http.FS(FS))
		//	c.JSON(200, gin.H{"ok": 1})
		//c.FileFromFS(c.Request.URL.Path, httpFS)
		f, err := FS.Open("www/index.html")
		if err != nil {
			c.JSON(500, err)
			return
		}

		_, err = io.Copy(c.Writer, f)
		if err != nil {
			fmt.Println(err)
			return
		}
	})

	return router
}

var Module = fx.Options(
	fx.Provide(NewRouter),
)
