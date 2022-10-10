package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/labels"
)

func LabelCreate(c *gin.Context) {
	var cl labels.CreateLabel
	http.CheckJSON(c, &cl)

	err := labels.Create(cl)
	http.CheckResErr(c, err)
}

func LabelGet(c *gin.Context) {
	code := c.Param("code")

	l, err := labels.GetInfo(code)
	http.CheckResErrData(c, err, l)
}

func LabelUpdate(c *gin.Context) {
	code := c.Param("code")
	var ul labels.UpdateLabel
	http.CheckJSON(c, &ul)

	err := labels.Update(code, ul)
	http.CheckResErr(c, err)
}

func LabelDelete(c *gin.Context) {
	code := c.Param("code")

	err := labels.Delete(code)
	http.CheckResErr(c, err)
}

func LabelList(c *gin.Context) {
	ll, err := labels.List()
	http.CheckResErrData(c, err, ll)
}
