package mid

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/internal/auth"
	"github/basefas/magi/internal/global"
	"github/basefas/magi/internal/utils"
	"github/basefas/magi/internal/utils/db"
	"strings"
)

func Syslog() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("token")
		if token == "" {
			c.Next()
			return
		}
		uid, _ := auth.GetUID(token)
		path := c.Request.URL.Path
		method := c.Request.Method
		body := utils.GetRequestBody(c)
		clientIP := c.ClientIP()
		m := method == "POST" || method == "PUT" || method == "DELETE"
		p := !strings.Contains(path, "login")
		if m && p {
			log := global.OptLog{UserID: uid, Url: path, Method: method, Body: body, ClientIP: clientIP}
			db.Mysql.Create(&log)
		}
		c.Next()
	}
}
