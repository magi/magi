package db

import (
	"github/basefas/magi/internal/global"
	"gorm.io/gorm"
)

var (
	Mysql *gorm.DB
)

func SaveAuthLog(user string, ip string, status uint64) {
	log := global.AuthLog{Username: user, ClientIP: ip, AuthStatus: status}
	Mysql.Create(&log)
}
