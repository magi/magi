package v1

import (
    "github.com/gin-gonic/gin"
    "github/basefas/magi/cmd/magi/handlers/http"
    "github/basefas/magi/internal/menus"
)

func SystemMenu(c *gin.Context) {
    ml := make([]menus.MenuInfo, 0)
    var err error
    uid := http.GetUID(c)

    ml, err = menus.System(uid)
    http.CheckResErrData(c, err, ml)
}
