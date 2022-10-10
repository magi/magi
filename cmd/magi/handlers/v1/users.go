package v1

import (
	"github.com/gin-gonic/gin"
	"github/basefas/magi/cmd/magi/handlers/http"
	"github/basefas/magi/internal/users"
)

func UsersCreate(c *gin.Context) {
	var cu users.CreateUser
	http.CheckJSON(c, &cu)

	err := users.Create(cu)
	http.CheckResErr(c, err)
}

func UsersGet(c *gin.Context) {
	uid := http.CheckUint64(c, "id")

	u, err := users.GetInfo(uid)
	http.CheckResErrData(c, err, u)
}

func UsersUpdate(c *gin.Context) {
	uid := http.CheckUint64(c, "id")
	var uu users.UpdateUser
	http.CheckJSON(c, &uu)

	err := users.Update(uid, uu)
	http.CheckResErr(c, err)
}

func UsersDelete(c *gin.Context) {
	uid := http.CheckUint64(c, "id")

	err := users.Delete(uid)
	http.CheckResErr(c, err)
}

func UsersList(c *gin.Context) {
	ul, err := users.List()
	http.CheckResErrData(c, err, ul)
}

func ResetPassword(c *gin.Context) {
	uid := http.CheckUint64(c, "id")
	var rp users.UserResetPassword
	http.CheckJSON(c, &rp)

	err := users.ResetPassword(uid, rp.Password)
	http.CheckResErr(c, err)
}
