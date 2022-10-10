package envs

import (
    "errors"
    "github/basefas/magi/internal/utils/db"
    "gorm.io/gorm"
)

var (
    ErrEnvNotFound = errors.New("env not found ")
    ErrEnvExists   = errors.New("env already exists")
)

func Create(ce CreateEnv) error {
    e := Env{}

    if err := db.Mysql.
        Where("code = ?", ce.Code).
        Find(&e).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }

    if e.ID != 0 {
        return ErrEnvExists
    }
    ne := Env{
        Name:        ce.Name,
        Code:        ce.Code,
        Type:        ce.Type,
        ClusterCode: ce.ClusterCode,
        LabelCode:   ce.LabelCode,
    }
    if ce.Type == "namespace" {
        ne.Namespace = ce.Namespace
    }

    if err := db.Mysql.Create(&ne).Error; err != nil {
        return err
    }

    return nil
}

func Get(code string) (e Env, err error) {
    err = db.Mysql.
        Model(&Env{}).
        Where("code", code).
        Take(&e).Error
    return e, err
}

func GetInfo(code string) (e EnvInfo, err error) {
    q := db.Mysql.
        Table("magi_env AS e").
        Select("e.id, e.name, e.code, e.type, e.cluster_code, e.namespace, e.created_at, e.updated_at, c.name AS cluster, l.name AS label").
        Joins("LEFT JOIN magi_cluster AS c ON e.cluster_code = c.code").
        Joins("LEFT JOIN magi_label AS l ON e.label_code = l.code").
        Where("e.deleted_at IS NULL").
        Where("c.deleted_at IS NULL").
        Where("l.deleted_at IS NULL").
        Where("e.code = ?", code).
        Order("e.id")

    err = q.Scan(&e).Error

    if errors.Is(err, gorm.ErrRecordNotFound) {
        return e, ErrEnvNotFound
    } else {
        return e, err
    }
}

func Update(code string, ue UpdateEnv) error {
    updateEnv := make(map[string]interface{})

    if ue.Name != "" {
        updateEnv["name"] = ue.Name
    }

    if err := db.Mysql.
        Model(&Env{}).
        Where("code = ?", code).
        Updates(updateEnv).Error; err != nil {
        return err
    }

    return nil
}

func Delete(code string) error {
    err := db.Mysql.
        Where("code = ?", code).
        Delete(&Env{}).Error

    return err
}

func ListByLabelAndType(label string, envType string) (envs []EnvInfo, err error) {
    envs = make([]EnvInfo, 0)

    q := db.Mysql.
        Table("magi_env AS e").
        Select("e.id, e.name, e.code, e.type, e.namespace, e.cluster_code, e.created_at, e.updated_at, c.name AS cluster, l.name AS label").
        Joins("LEFT JOIN magi_cluster AS c ON e.cluster_code = c.code").
        Joins("LEFT JOIN magi_label AS l ON e.label_code = l.code").
        Where("e.deleted_at IS NULL").
        Where("c.deleted_at IS NULL").
        Where("l.deleted_at IS NULL").
        Order("e.id")

    if label != "" {
        q.Where("l.code = ?", label)
    }
    if envType != "" {
        q.Where("magi_env.type = ?", envType)
    }

    err = q.Find(&envs).Error

    return envs, nil
}
