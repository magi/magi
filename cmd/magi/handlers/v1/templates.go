package v1

import (
    "github.com/gin-gonic/gin"
    "github/basefas/magi/cmd/magi/handlers/http"
    "github/basefas/magi/internal/templates"
)

func TemplateCreate(c *gin.Context) {
    var ct templates.CreateTemplate
    http.CheckJSON(c, &ct)
    uid := http.GetUID(c)

    err := templates.Create(ct, uid)
    http.CheckResErr(c, err)
}

func TemplateGet(c *gin.Context) {
    id := http.CheckUint64(c, "id")

    t, err := templates.GetInfo(id)
    http.CheckResErrData(c, err, t)
}

func TemplateDelete(c *gin.Context) {
    id := http.CheckUint64(c, "id")

    err := templates.Delete(id)
    http.CheckResErr(c, err)
}

func TemplateList(c *gin.Context) {
    tl, err := templates.List()
    http.CheckResErrData(c, err, tl)
}

func TemplateFileList(c *gin.Context) {
    id := http.CheckUint64(c, "id")

    fl, err := templates.FileList(id)
    http.CheckResErrData(c, err, fl)
}

func TemplateFileEdit(c *gin.Context) {
    id := http.CheckUint64(c, "id")
    uid := http.GetUID(c)
    var utf templates.EditTemplateFile
    http.CheckJSON(c, &utf)

    err := templates.EditFiles(id, uid, utf)
    http.CheckResErr(c, err)
}
