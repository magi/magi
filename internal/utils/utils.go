package utils

import (
    "bytes"
    "fmt"
    "github.com/gin-gonic/gin"
    "github/basefas/magi/internal/utils/logger"
    "io/ioutil"
    "time"
)

func LogRequestBody(c *gin.Context) {
    reqBody := GetRequestBody(c)
    logger.Debug("body: " + reqBody)
}

func LogRequestHeader(c *gin.Context) {
    logger.Debug("header: " + fmt.Sprint(c.Request.Header))
}

func LogRequest(c *gin.Context) {
    LogRequestHeader(c)
    LogRequestBody(c)
}

func GetRequestBody(c *gin.Context) string {
    buf, _ := c.GetRawData()
    reqBody := string(buf)
    c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(buf))
    return reqBody
}

func Intersect[T any](a, b []T) []T {
    m := make(map[any]bool)
    n := make([]T, 0, 0)
    for _, v := range a {
        m[v] = true
    }

    for _, v := range b {
        if m[v] {
            n = append(n, v)
        }
    }
    return n
}

func Difference[T any](a, b []T) []T {
    m := make(map[any]bool)
    n := make([]T, 0, 0)
    inter := Intersect(a, b)
    for _, v := range inter {
        m[v] = true
    }

    for _, v := range a {
        if !m[v] {
            n = append(n, v)
        }
    }
    return n
}

func GetNowString() string {
    return time.Now().Format("20060102150405")
}

func Contains[T comparable](s []T, e T) bool {
    for _, v := range s {
        if v == e {
            return true
        }
    }
    return false
}
