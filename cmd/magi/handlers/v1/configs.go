package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/configs"
)

func ConfigCreate(c *gin.Context) {
	var cc configs.CreateConfig
	http.CheckJSON(c, &cc)

	err := configs.Create(cc)
	http.CheckResErr(c, err)
}

func ConfigGet(c *gin.Context) {
	code := c.Param("code")

	config, err := configs.GetInfo(code)
	http.CheckResErrData(c, err, config)
}

func ConfigUpdate(c *gin.Context) {
	code := c.Param("code")
	var uc configs.UpdateConfig
	http.CheckJSON(c, &uc)

	err := configs.Update(code, uc)
	http.CheckResErr(c, err)
}

func ConfigDelete(c *gin.Context) {
	code := c.Param("code")

	err := configs.Delete(code)
	http.CheckResErr(c, err)
}

func ConfigList(c *gin.Context) {
	label := c.Query("label")
	linked := c.Query("linked")

	cl, err := configs.List(label, linked)
	http.CheckResErrData(c, err, cl)
}

func ConfigHistoryList(c *gin.Context) {
	code := c.Param("code")

	hl, err := configs.HistoryList(code)
	http.CheckResErrData(c, err, hl)
}

func ConfigFileList(c *gin.Context) {
	version := c.Param("version")

	fl, err := configs.FileList(version)
	http.CheckResErrData(c, err, fl)
}

func ConfigEditFile(c *gin.Context) {
	code := c.Param("code")
	var cf configs.EditConfigFile
	http.CheckJSON(c, &cf)
	uid := http.GetUID(c)

	err := configs.EditFiles(code, uid, cf)
	http.CheckResErr(c, err)
}
