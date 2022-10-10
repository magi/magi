package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/envsets"
)

func EnvSetCreate(c *gin.Context) {
	var ce envsets.CreateEnvSet
	http.CheckJSON(c, &ce)

	err := envsets.Create(ce)
	http.CheckResErr(c, err)
}

func EnvSetGet(c *gin.Context) {
	code := c.Param("code")

	e, err := envsets.GetInfo(code)
	http.CheckResErrData(c, err, e)
}

func EnvSetUpdate(c *gin.Context) {
	code := c.Param("code")
	var ue envsets.UpdateEnvSet
	http.CheckJSON(c, &ue)

	err := envsets.Update(code, ue)
	http.CheckResErr(c, err)
}

func EnvSetDelete(c *gin.Context) {
	code := c.Param("code")

	err := envsets.Delete(code)
	http.CheckResErr(c, err)
}

func EnvSetList(c *gin.Context) {
	label := c.Query("label")

	el, err := envsets.ListByLabel(label)
	http.CheckResErrData(c, err, el)
}
