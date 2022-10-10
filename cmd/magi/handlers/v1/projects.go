package v1

import (
    "github.com/gin-gonic/gin"
    "github/basefas/magi/cmd/magi/handlers/http"
    "github/basefas/magi/internal/projects"
)

func ProjectCreate(c *gin.Context) {
    var cp projects.CreateProject
    http.CheckJSON(c, &cp)

    err := projects.Create(cp)
    http.CheckResErr(c, err)
}

func ProjectGet(c *gin.Context) {
    code := c.Param("code")

    p, err := projects.GetInfo(code)
    http.CheckResErrData(c, err, p)
}

func ProjectUpdate(c *gin.Context) {
    code := c.Param("code")
    var up projects.UpdateProject
    http.CheckJSON(c, &up)

    err := projects.Update(code, up)
    http.CheckResErr(c, err)
}

func ProjectDelete(c *gin.Context) {
    code := c.Param("code")

    err := projects.Delete(code)
    http.CheckResErr(c, err)
}

func ProjectList(c *gin.Context) {
    pl, err := projects.List()
    http.CheckResErrData(c, err, pl)
}

func ProjectConfigList(c *gin.Context) {
    label := c.Query("label")
    linked := c.Query("linked")
    code := c.Param("code")

    cl, err := projects.ConfigListByLabel(code, label, linked)
    http.CheckResErrData(c, err, cl)
}
