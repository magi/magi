package base

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
)

func Health(c *gin.Context) {
	http.Re(c, 0, "success", nil)
}
