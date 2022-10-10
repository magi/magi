package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/global"
	"github/basefas/magi/internal/users"
	"github/basefas/magi/internal/utils/db"
)

func LogIn(c *gin.Context) {
	var u users.Login
	http.CheckJSON(c, &u)
	token, err := users.Token(u)
	if err != nil {
		db.SaveAuthLog(u.Username, c.ClientIP(), global.LogInFailed)
		http.Re(c, -1, err.Error(), nil)
	} else {
		db.SaveAuthLog(u.Username, c.ClientIP(), global.LogInSuccess)
		http.Re(c, 0, "success", token)
	}
}
