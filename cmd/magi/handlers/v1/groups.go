package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/groups"
)

func GroupCreate(c *gin.Context) {
	var cg groups.CreateGroup
	http.CheckJSON(c, &cg)

	err := groups.Create(cg)
	http.CheckResErr(c, err)
}

func GroupGet(c *gin.Context) {
	id := http.CheckUint64(c, "id")

	g, err := groups.GetInfo(id)
	http.CheckResErrData(c, err, g)
}

func GroupUpdate(c *gin.Context) {
	id := http.CheckUint64(c, "id")
	var ug groups.UpdateGroup
	http.CheckJSON(c, &ug)

	err := groups.Update(id, ug)
	http.CheckResErr(c, err)
}

func GroupDelete(c *gin.Context) {
	id := http.CheckUint64(c, "id")

	err := groups.Delete(id)
	http.CheckResErr(c, err)
}

func GroupList(c *gin.Context) {
	gl, err := groups.List()
	http.CheckResErrData(c, err, gl)
}
