package mysql

import (
    "fmt"
    "github.com/spf13/viper"
    "github/basefas/magi/internal/utils/db"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    gormLogger "gorm.io/gorm/logger"
    "log"
    "os"
    "strings"
    "time"
)

type DBMySQLError struct {
    Number  uint16
    Message string
}

func Init() {
    var err error
    user := viper.GetString("db.mysql.user")
    password := viper.GetString("db.mysql.password")
    host := viper.GetString("db.mysql.host")
    port := viper.GetUint64("db.mysql.port")
    name := viper.GetString("db.mysql.name")

    dsn := fmt.Sprintf("%s:%s@(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, password, host, port, name)

    newLogger := db.NewDBLogger(
        log.New(os.Stdout, "\r\n", log.LstdFlags),
        db.LogConfig{
            SlowThreshold:             viper.GetDuration("db.mysql.slowThreshold") * time.Millisecond,
            LogLevel:                  getDbLogLevel(),
            IgnoreRecordNotFoundError: true,
        })

    db.Mysql, err = gorm.Open(mysql.New(mysql.Config{
        DSN:                      dsn,
        DefaultStringSize:        255,
        DisableDatetimePrecision: true,
    }), &gorm.Config{
        Logger: newLogger,
    })
    if err != nil {
        if strings.Contains(err.Error(), "Error 1049") {
            CreateDatabase(user, password, host, port, name)
        } else {
            fmt.Println("[magi] " + err.Error())
            panic("db init failed.")
        }
    } else {
        fmt.Printf("[magi] Mysql %s:%d Connection Successful.\n", host, port)
    }

    Migrate()
}

func CreateDatabase(user, password, host string, port uint64, name string) {
    dsn := fmt.Sprintf("%s:%s@(%s:%d)/?charset=utf8mb4&parseTime=True&loc=Local", user, password, host, port)

    t, err := gorm.Open(mysql.Open(dsn), nil)
    if err != nil {
        fmt.Println("[magi] ", err.Error())
    }

    createSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4;", name)

    err = t.Exec(createSQL).Error
    if err != nil {
        panic("[magi] " + err.Error())
    } else {
        fmt.Printf("[magi] Create Database %s.\n", name)
    }
}

func Migrate() {
    err := migration()
    if err != nil {
        fmt.Println("[magi] " + err.Error())
        panic("db migrate failed.")
    }
}

func getDbLogLevel() gormLogger.LogLevel {
    level := viper.GetString("app.dbLogLevel")
    switch level {
    case "silent":
        return gormLogger.Info
    case "error":
        return gormLogger.Info
    case "warn":
        return gormLogger.Warn
    case "info":
        return gormLogger.Info
    default:
        return gormLogger.Warn
    }
}
