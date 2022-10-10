package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/varsets"
)

func VarSetCreate(c *gin.Context) {
	var cv varsets.CreateVarSet
	http.CheckJSON(c, &cv)

	err := varsets.Create(cv)
	http.CheckResErr(c, err)
}

func VarSetGet(c *gin.Context) {
	code := c.Param("code")

	v, err := varsets.GetInfo(code)
	http.CheckResErrData(c, err, v)
}

func VarSetUpdate(c *gin.Context) {
	code := c.Param("code")
	var uv varsets.UpdateVarSet
	http.CheckJSON(c, &uv)
	uid := http.GetUID(c)

	err := varsets.Update(code, uv, uid)
	http.CheckResErr(c, err)
}

func VarSetDelete(c *gin.Context) {
	code := c.Param("code")

	err := varsets.Delete(code)
	http.CheckResErr(c, err)
}

func VarSetList(c *gin.Context) {
	label := c.Query("label")

	vl, err := varsets.List(label)
	http.CheckResErrData(c, err, vl)
}
