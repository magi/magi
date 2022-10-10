package v1

import (
    "github.com/gin-gonic/gin"
    "github/basefas/magi/cmd/magi/handlers/http"
    "github/basefas/magi/internal/envs"
)

func EnvCreate(c *gin.Context) {
    var ce envs.CreateEnv
    http.CheckJSON(c, &ce)

    err := envs.Create(ce)
    http.CheckResErr(c, err)
}

func EnvGet(c *gin.Context) {
    code := c.Param("code")

    e, err := envs.GetInfo(code)
    http.CheckResErrData(c, err, e)
}

func EnvUpdate(c *gin.Context) {
    code := c.Param("code")
    var ue envs.UpdateEnv
    http.CheckJSON(c, &ue)

    err := envs.Update(code, ue)
    http.CheckResErr(c, err)
}

func EnvDelete(c *gin.Context) {
    code := c.Param("code")

    err := envs.Delete(code)
    http.CheckResErr(c, err)
}

func EnvList(c *gin.Context) {
    label := c.Query("label")
    envType := c.Query("type")

    el, err := envs.ListByLabelAndType(label, envType)
    http.CheckResErrData(c, err, el)
}
