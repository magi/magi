package v1

import (
    "github.com/gin-gonic/gin"
    "github/basefas/magi/cmd/magi/handlers/http"
    "github/basefas/magi/internal/apps"
)

func AppCreate(c *gin.Context) {
    var ca apps.CreateApp
    http.CheckJSON(c, &ca)

    err := apps.Create(ca)
    http.CheckResErr(c, err)
}

func AppGet(c *gin.Context) {
    code := c.Param("code")

    a, err := apps.GetInfo(code)
    http.CheckResErrData(c, err, a)
}

func AppUpdate(c *gin.Context) {
    code := c.Param("code")
    var ua apps.UpdateApp
    http.CheckJSON(c, &ua)

    err := apps.Update(code, ua)
    http.CheckResErr(c, err)
}

func AppDelete(c *gin.Context) {
    code := c.Param("code")

    err := apps.Delete(code)
    http.CheckResErr(c, err)
}

func AppList(c *gin.Context) {
    label := c.Query("label")

    al, err := apps.ListByLabel(label)
    http.CheckResErrData(c, err, al)
}
