package conf

import (
	"fmt"
	"github.com/spf13/viper"
)

func Init() {
	viper.SetConfigName("magi-config")
	viper.AddConfigPath("./config")

	// default config
	viper.SetDefault("app.name", "Magi")
	viper.SetDefault("app.runMode", "release")
	viper.SetDefault("app.host", "0.0.0.0")
	viper.SetDefault("app.port", 8086)
	viper.SetDefault("app.logLevel", "info")
	viper.SetDefault("app.dbLogLevel", "warn")
	viper.SetDefault("app.uiLog", false)
	viper.SetDefault("app.jwtSecret", "Magi")
	viper.SetDefault("app.jwtTimeout", 86400)
	viper.SetDefault("db.mysql.name", "magi")
	viper.SetDefault("db.mysql.port", 3306)
	viper.SetDefault("db.mysql.migrate", true)
	viper.SetDefault("git.branch", "main")

	err := viper.ReadInConfig()
	if err != nil {
		fmt.Println("[magi] " + err.Error())
		panic("config init failed.")
	} else {
		fmt.Println("[magi] Config Load Completed.")
	}
}
