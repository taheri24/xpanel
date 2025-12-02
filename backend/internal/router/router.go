package router

import (
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
	router.StaticFile("/", "./www/index.html")
	router.Static("/assets", "./www/assets")

	return router
}

var Module = fx.Options(
	fx.Provide(NewRouter),
)
