package http

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github/basefas/magi/internal/auth"
	"net/http"
	"strconv"
)

var (
	AuthError = errors.New("auth error")
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func Re(c *gin.Context, code int, msg string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: msg,
		Data:    data,
	})
}

func CheckResErr(c *gin.Context, err error) {
	if err != nil {
		Re(c, -1, err.Error(), nil)
	} else {
		Re(c, 0, "success", nil)
	}
}

func CheckResErrData(c *gin.Context, err error, data interface{}) {
	if err != nil {
		Re(c, -1, err.Error(), nil)
	} else {
		Re(c, 0, "success", data)
	}
}

func CheckUint64(c *gin.Context, key string) uint64 {
	id, err := strconv.ParseUint(c.Param(key), 10, 64)
	if err != nil {
		Re(c, -1, err.Error(), nil)
		return 0
	}
	return id
}

func CheckJSON(c *gin.Context, obj interface{}) {
	if err := c.ShouldBindJSON(obj); err != nil {
		Re(c, -1, err.Error(), nil)
		return
	}
}

func GetUID(c *gin.Context) uint64 {
	token := c.GetHeader("token")
	uid, _ := auth.GetUID(token)
	return uid
}

func IsMe(c *gin.Context, id uint64) {
	if !(id == GetUID(c)) {
		Re(c, -1, AuthError.Error(), nil)
		return
	}
}
