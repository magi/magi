package mysql

import (
    "embed"
    "fmt"
    "github.com/golang-migrate/migrate/v4"
    _ "github.com/golang-migrate/migrate/v4/database/mysql"
    "github.com/golang-migrate/migrate/v4/source/iofs"
    "github.com/spf13/viper"
)

//go:embed migrations/*.sql
var fs embed.FS

type Migration struct {
    client *migrate.Migrate
}

func migration() error {
    m, err := newMigration()
    if err != nil {
        return err
    }
    needMigrate := viper.GetBool("db.mysql.migrate")
    if needMigrate {
        err = m.Up()
    }
    return err
}

func newMigration() (migration *Migration, err error) {
    user := viper.GetString("db.mysql.user")
    password := viper.GetString("db.mysql.password")
    host := viper.GetString("db.mysql.host")
    port := viper.GetUint64("db.mysql.port")
    name := viper.GetString("db.mysql.name")
    dsn := fmt.Sprintf("mysql://%s:%s@tcp(%s:%d)/%s", user, password, host, port, name)
    d, err := iofs.New(fs, "migrations")
    if err != nil {
        return nil, err
    }
    mig := Migration{}
    mig.client, err = migrate.NewWithSourceInstance("iofs", d, dsn)
    if err != nil {
        return nil, err
    }
    return &mig, err
}

func (m *Migration) Up() error {
    currentVersion, _, _ := m.client.Version()

    err := m.client.Up()
    if err != nil {
        if err == migrate.ErrNoChange {
            return nil
        } else {
            return err
        }
    }

    newVersion, _, _ := m.client.Version()
    if err != nil {
        return err
    }
    fmt.Printf("[magi] Migration up form version: %d to version: %d success.\n", currentVersion, newVersion)
    return nil
}
