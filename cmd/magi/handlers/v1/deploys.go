package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/deploys"
)

func DeployCreate(c *gin.Context) {
	var cd deploys.CreateDeploy
	http.CheckJSON(c, &cd)
	uid := http.GetUID(c)

	err := deploys.Create(cd, uid)
	http.CheckResErr(c, err)
}

func DeployDo(c *gin.Context) {
	version := c.Param("version")
	uid := http.GetUID(c)

	err := deploys.DeployDo(version, uid)
	http.CheckResErr(c, err)
}

//func DeployUpdate(c *gin.Context) {
//    code := c.Param("code")
//    var ud deploys.UpdateDeploy
//    http.CheckJSON(c, &ud)
//
//    err := deploys.Update(code, ud)
//    http.CheckResErr(c, err)
//}
//
//func DeployDelete(c *gin.Context) {
//    code := c.Param("code")
//
//    err := deploys.Delete(code)
//    http.CheckResErr(c, err)
//}

func DeployList(c *gin.Context) {
	code := c.Param("code")

	dl, err := deploys.List(code)
	http.CheckResErrData(c, err, dl)
}
