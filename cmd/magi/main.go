package main

import (
	"github/basefas/magi/cmd/magi/handlers/router"
	"github/basefas/magi/internal/auth"
	"github/basefas/magi/internal/utils/conf"
	"github/basefas/magi/internal/utils/db/mysql"
	"github/basefas/magi/internal/utils/logger"
)

func main() {
	conf.Init()
	logger.Init()
	mysql.Init()
	auth.Init()
	router.Init()
}
