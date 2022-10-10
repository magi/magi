package mid

import (
    "fmt"
    "github.com/gin-gonic/gin"
    "github.com/spf13/viper"
    "github/basefas/magi/internal/utils/logger"
    "go.uber.org/zap"
    "net"
    "net/http"
    "net/http/httputil"
    "os"
    "runtime/debug"
    "strings"
    "time"
)

func GinLogger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        query := c.Request.URL.RawQuery
        c.Next()
        cost := time.Since(start)

        api := strings.HasPrefix(path, "/api/")
        if api {
            logger.InfoF("API",
                zap.Int("status", c.Writer.Status()),
                zap.String("method", c.Request.Method),
                zap.String("path", path),
                zap.String("query", query),
                zap.String("cost", fmt.Sprintf("%s", cost)),
            )
        } else {
            if viper.GetBool("app.uiLog") {
                logger.InfoF("UI",
                    zap.Int("status", c.Writer.Status()),
                    zap.String("method", c.Request.Method),
                    zap.String("path", path),
                    zap.String("query", query),
                    zap.String("cost", fmt.Sprintf("%s", cost)),
                )
            }
        }
    }
}

func GinRecovery(stack bool) gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                var brokenPipe bool
                if ne, ok := err.(*net.OpError); ok {
                    if se, ok := ne.Err.(*os.SyscallError); ok {
                        if strings.Contains(strings.ToLower(se.Error()), "broken pipe") ||
                            strings.Contains(strings.ToLower(se.Error()), "connection reset by peer") {
                            brokenPipe = true
                        }
                    }
                }

                httpRequest, _ := httputil.DumpRequest(c.Request, false)
                if brokenPipe {
                    logger.ErrorF(c.Request.URL.Path,
                        zap.Any("error", err),
                        zap.String("request", string(httpRequest)),
                    )
                    c.Error(err.(error))
                    c.Abort()
                    return
                }

                if stack {
                    logger.ErrorF("[Recovery from panic]",
                        zap.Any("error", err),
                        zap.String("request", string(httpRequest)),
                        zap.String("stack", string(debug.Stack())),
                    )
                } else {
                    logger.ErrorF("[Recovery from panic]",
                        zap.Any("error", err),
                        zap.String("request", string(httpRequest)),
                    )
                }
                c.AbortWithStatus(http.StatusInternalServerError)
            }
        }()
        c.Next()
    }
}
