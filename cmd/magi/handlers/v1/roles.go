package v1

import (
    "github.com/gin-gonic/gin"
    "github/basefas/magi/cmd/magi/handlers/http"
    "github/basefas/magi/internal/roles"
)

func RoleCreate(c *gin.Context) {
    var cr roles.CreateRole
    http.CheckJSON(c, &cr)

    err := roles.Create(cr)
    http.CheckResErr(c, err)
}

func RoleGet(c *gin.Context) {
    id := http.CheckUint64(c, "id")

    r, err := roles.GetInfo(id)
    http.CheckResErrData(c, err, r)
}

func RoleUpdate(c *gin.Context) {
    id := http.CheckUint64(c, "id")
    var ur roles.UpdateRole
    http.CheckJSON(c, &ur)

    err := roles.Update(id, ur)
    http.CheckResErr(c, err)
}

func RoleDelete(c *gin.Context) {
    id := http.CheckUint64(c, "id")

    err := roles.Delete(id)
    http.CheckResErr(c, err)
}

func RoleList(c *gin.Context) {
    rl, err := roles.List()
    http.CheckResErrData(c, err, rl)
}

func RoleMenusList(c *gin.Context) {
    id := http.CheckUint64(c, "id")

    rm, err := roles.GetRoleMenus(id)
    l := make([]uint64, 0)
    for _, menu := range rm {
        l = append(l, menu.MenuID)
    }
    http.CheckResErrData(c, err, l)
}

func RoleMenusUpdate(c *gin.Context) {
    id := http.CheckUint64(c, "id")
    ml := make([]uint64, 0)
    http.CheckJSON(c, &ml)

    err := roles.UpdateRoleMenu(id, ml)
    http.CheckResErr(c, err)
}
