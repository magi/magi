package v1

import (
    "github.com/gin-gonic/gin"
    "github/basefas/magi/cmd/magi/handlers/http"
    "github/basefas/magi/internal/users"
)

func UserGet(c *gin.Context) {
    id := http.CheckUint64(c, "id")
    http.IsMe(c, id)

    u, err := users.Get(id)
    http.CheckResErrData(c, err, u)
}

func UserUpdate(c *gin.Context) {
    id := http.CheckUint64(c, "id")
    http.IsMe(c, id)
    var uu users.UpdateUser
    http.CheckJSON(c, &uu)

    err := users.Update(id, uu)
    http.CheckResErr(c, err)
}
