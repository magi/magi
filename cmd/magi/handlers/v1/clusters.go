package v1

import (
    "github.com/gin-gonic/gin"
    "github/basefas/magi/cmd/magi/handlers/http"
    "github/basefas/magi/internal/k8s/clusters"
)

func ClusterAdd(c *gin.Context) {
    var cc clusters.AddCluster
    http.CheckJSON(c, &cc)

    err := clusters.Create(cc)
    http.CheckResErr(c, err)
}

func ClusterGet(c *gin.Context) {
    code := c.Param("code")

    kc, err := clusters.GetInfo(code)
    http.CheckResErrData(c, err, kc)
}

func ClusterUpdate(c *gin.Context) {
    code := c.Param("code")
    var uc clusters.UpdateCluster
    http.CheckJSON(c, &uc)

    err := clusters.Update(code, uc)
    http.CheckResErr(c, err)
}

func ClusterDelete(c *gin.Context) {
    code := c.Param("code")

    err := clusters.Delete(code)
    http.CheckResErr(c, err)
}

func ClusterList(c *gin.Context) {
    cl, err := clusters.List()
    http.CheckResErrData(c, err, cl)
}
