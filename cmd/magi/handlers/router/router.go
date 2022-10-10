package router

import (
	"context"
	"fmt"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"github/basefas/magi/cmd/magi/handlers/base"
	v1 "github/basefas/magi/cmd/magi/handlers/v1"
	"github/basefas/magi/internal/auth"
	"github/basefas/magi/internal/mid"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

func Init() {
	router := setupRouter()
	addr := fmt.Sprintf("%s:%d", viper.GetString("app.host"), viper.GetInt64("app.port"))
	srv := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("[magi] listen: %s\n", err)
		}
	}()

	fmt.Printf("[magi] Magi Start On %s.\n", addr)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	fmt.Println("[magi] shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		fmt.Println("[magi] server forced to shutdown: ", err)
	}

	fmt.Println("[magi] server exiting, bye~")
}

func setupRouter() *gin.Engine {
	runMode := viper.GetString("app.runMode")
	if runMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}
	r := gin.New()
	if runMode == "release" {
		r.Use(mid.GinLogger())
		r.Use(mid.GinRecovery(true))
	} else {
		r.Use(gin.Logger())
		r.Use(gin.Recovery())
	}
	r.Use(mid.Cors())
	r.Use(mid.Syslog())

	api := r.Group("/api")
	api.GET("/healthz", base.Health)
	apiv1 := r.Group("/api/v1")
	apiv1.POST("/login", v1.LogIn)

	system := apiv1.Group("/system")
	system.Use(mid.JWT())
	{
		system.GET("/menus", v1.SystemMenu)
	}

	user := apiv1.Group("/user")
	user.Use(mid.JWT())
	{
		user.GET("/:id", v1.UserGet)
		user.PUT("/:id", v1.UserUpdate)
	}

	users := apiv1.Group("/users")
	users.Use(mid.JWT())
	users.Use(mid.Casbin(auth.Casbin))
	{
		users.POST("", v1.UsersCreate)
		users.GET("/:id", v1.UsersGet)
		users.PUT("/:id", v1.UsersUpdate)
		users.DELETE("/:id", v1.UsersDelete)
		users.GET("", v1.UsersList)
		users.PUT("/:id/password", v1.ResetPassword)
	}

	groups := apiv1.Group("/groups")
	groups.Use(mid.JWT())
	groups.Use(mid.Casbin(auth.Casbin))
	{
		groups.POST("", v1.GroupCreate)
		groups.GET("/:id", v1.GroupGet)
		groups.PUT("/:id", v1.GroupUpdate)
		groups.DELETE("/:id", v1.GroupDelete)
		groups.GET("", v1.GroupList)
	}

	roles := apiv1.Group("/roles")
	roles.Use(mid.JWT())
	roles.Use(mid.Casbin(auth.Casbin))
	{
		roles.POST("", v1.RoleCreate)
		roles.GET("/:id", v1.RoleGet)
		roles.PUT("/:id", v1.RoleUpdate)
		roles.DELETE("/:id", v1.RoleDelete)
		roles.GET("", v1.RoleList)
		roles.GET("/:id/menus", v1.RoleMenusList)
		roles.PUT("/:id/menus", v1.RoleMenusUpdate)
	}

	menus := apiv1.Group("/menus")
	menus.Use(mid.JWT())
	//menus.Use(mid.Casbin(auth.Casbin))
	{
		//menus.POST("", v1.MenuCreate)
		//menus.GET("/:id", v1.MenuGet)
		//menus.PUT("/:id", v1.MenuUpdate)
		//menus.DELETE("/:id", v1.MenuDelete)
		menus.GET("", v1.MenuList)
	}

	clusters := apiv1.Group("/clusters")
	clusters.Use(mid.JWT())
	//clusters.Use(mid.Casbin(auth.Casbin))
	{
		clusters.POST("", v1.ClusterAdd)
		clusters.GET("/:code", v1.ClusterGet)
		clusters.PUT("/:code", v1.ClusterUpdate)
		clusters.DELETE("/:code", v1.ClusterDelete)
		clusters.GET("", v1.ClusterList)
	}

	envs := apiv1.Group("/envs")
	envs.Use(mid.JWT())
	//envs.Use(mid.Casbin(auth.Casbin))
	{
		envs.POST("", v1.EnvCreate)
		envs.GET("/:code", v1.EnvGet)
		envs.PUT("/:code", v1.EnvUpdate)
		envs.DELETE("/:code", v1.EnvDelete)
		envs.GET("", v1.EnvList)
	}

	envSets := apiv1.Group("/env_sets")
	envSets.Use(mid.JWT())
	//envSets.Use(mid.Casbin(auth.Casbin))
	{
		envSets.POST("", v1.EnvSetCreate)
		envSets.GET("/:code", v1.EnvSetGet)
		envSets.PUT("/:code", v1.EnvSetUpdate)
		envSets.GET("", v1.EnvSetList)
	}

	projects := apiv1.Group("/projects")
	projects.Use(mid.JWT())
	//projects.Use(mid.Casbin(auth.Casbin))
	{
		projects.POST("", v1.ProjectCreate)
		projects.GET("/:code", v1.ProjectGet)
		projects.PUT("/:code", v1.ProjectUpdate)
		projects.DELETE("/:code", v1.ProjectDelete)
		projects.GET("", v1.ProjectList)
		projects.GET("/:code/configs", v1.ProjectConfigList)
	}

	templates := apiv1.Group("/templates")
	templates.Use(mid.JWT())
	//templates.Use(mid.Casbin(auth.Casbin))
	{
		templates.POST("", v1.TemplateCreate)
		templates.GET("/:id", v1.TemplateGet)
		templates.DELETE("/:id", v1.TemplateDelete)
		templates.GET("", v1.TemplateList)
		templates.GET("/:id/files", v1.TemplateFileList)
		templates.PUT("/:id/files", v1.TemplateFileEdit)
	}

	labels := apiv1.Group("/labels")
	labels.Use(mid.JWT())
	//labels.Use(mid.Casbin(auth.Casbin))
	{
		labels.POST("", v1.LabelCreate)
		labels.GET("/:code", v1.LabelGet)
		labels.PUT("/:code", v1.LabelUpdate)
		labels.DELETE("/:code", v1.LabelDelete)
		labels.GET("", v1.LabelList)
	}

	varSets := apiv1.Group("/var_sets")
	varSets.Use(mid.JWT())
	//varSets.Use(mid.Casbin(auth.Casbin))
	{
		varSets.POST("", v1.VarSetCreate)
		varSets.GET("/:code", v1.VarSetGet)
		varSets.PUT("/:code", v1.VarSetUpdate)
		varSets.DELETE("/:code", v1.VarSetDelete)
		varSets.GET("", v1.VarSetList)
	}

	apps := apiv1.Group("/apps")
	apps.Use(mid.JWT())
	//apps.Use(mid.Casbin(auth.Casbin))
	{
		apps.POST("", v1.AppCreate)
		apps.GET("/:code", v1.AppGet)
		apps.PUT("/:code", v1.AppUpdate)
		apps.DELETE("/:code", v1.AppDelete)
		apps.GET("", v1.AppList)
		apps.GET("/:code/deploys", v1.DeployList)
	}

	deploys := apiv1.Group("/deploys")
	deploys.Use(mid.JWT())
	//deploys.Use(mid.Casbin(auth.Casbin))
	{
		deploys.POST("", v1.DeployCreate)
		//deploys.GET("/:code", v1.DeployGet)
		deploys.PUT("/:version", v1.DeployDo)
		//deploys.DELETE("/:code", v1.DeployDelete)
		deploys.GET("", v1.DeployList)
	}

	configs := apiv1.Group("/configs")
	configs.Use(mid.JWT())
	//configs.Use(mid.Casbin(auth.Casbin))
	{
		configs.POST("", v1.ConfigCreate)
		configs.GET("/:code", v1.ConfigGet)
		configs.PUT("/:code", v1.ConfigUpdate)
		configs.DELETE("/:code", v1.ConfigDelete)
		configs.GET("", v1.ConfigList)
		configs.GET("/:code/histories", v1.ConfigHistoryList)
		configs.GET("/:code/histories/:version/files", v1.ConfigFileList)
		configs.POST("/:code/histories", v1.ConfigEditFile)
	}
	r.Use(static.Serve("/", static.LocalFile("./ui", true)))
	r.NoRoute(func(c *gin.Context) {
		if !strings.HasPrefix(c.Request.RequestURI, "/api") {
			c.File("./ui/index.html")
		}
	})
	return r
}
