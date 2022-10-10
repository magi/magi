package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/menus"
)

func MenuCreate(c *gin.Context) {
	var cm menus.CreateMenu
	http.CheckJSON(c, &cm)

	err := menus.Create(cm)
	http.CheckResErr(c, err)
}

func MenuGet(c *gin.Context) {
	id := http.CheckUint64(c, "id")
	menuType := c.Query("type")
	var mi menus.MenuInfo
	var err error

	if menuType == "tree" {
		mi, err = menus.GetTree(id)
	} else {
		mi, err = menus.GetInfo(id)
	}
	http.CheckResErrData(c, err, mi)
}

func MenuUpdate(c *gin.Context) {
	id := http.CheckUint64(c, "id")
	var um menus.UpdateMenu
	http.CheckJSON(c, &um)

	err := menus.Update(id, um)
	http.CheckResErr(c, err)
}

func MenuDelete(c *gin.Context) {
	id := http.CheckUint64(c, "id")

	err := menus.Delete(id)
	http.CheckResErr(c, err)
}

func MenuList(c *gin.Context) {
	menuType := c.Query("type")
	ml := make([]menus.MenuInfo, 0)
	var err error

	switch menuType {
	case "tree":
		ml, err = menus.Tree()
	default:
		ml, err = menus.List()
	}
	http.CheckResErrData(c, err, ml)
}
