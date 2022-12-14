package groups

import (
    "errors"
    "fmt"
    "github/basefas/magi/internal/auth"
    "github/basefas/magi/internal/users"
    "github/basefas/magi/internal/utils/db"
    "gorm.io/gorm"
)

var (
    ErrGroupNotFound = errors.New("group not found ")
    ErrGroupExists   = errors.New("group already exists")
    ErrGroupBound    = errors.New("group had been bound")
)

func Create(cg CreateGroup) error {
    g := Group{}

    if err := db.Mysql.
        Where("name = ?", cg.Name).
        Find(&g).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }

    if g.ID != 0 {
        return ErrGroupExists
    }

    ng := Group{Name: cg.Name}

    err := db.Mysql.Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(&ng).Error; err != nil {
            return err
        }

        gr := GroupRole{GroupID: ng.ID, RoleID: cg.RoleID}
        if err := tx.Create(&gr).Error; err != nil {
            return err
        }

        return nil
    })

    if err != nil {
        return err
    }

    if _, casbinErr := auth.Casbin.AddGroupingPolicy(fmt.Sprintf("group::%d", ng.ID), fmt.Sprintf("role::%d", cg.RoleID)); casbinErr != nil {
        return casbinErr
    }

    return nil
}

func Get(groupID uint64) (group Group, err error) {
    if err = db.Mysql.Take(&group, groupID).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return group, ErrGroupNotFound
        } else {
            return group, err
        }
    }
    return group, nil
}

func GetInfo(groupID uint64) (groupInfo GroupInfo, err error) {
    if err = db.Mysql.
        Model(&Group{}).
        Where("id", groupID).
        Take(&groupInfo).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return groupInfo, ErrGroupNotFound
        } else {
            return groupInfo, err
        }
    }
    return groupInfo, nil
}

func Update(groupID uint64, ug UpdateGroup) error {
    og := GroupRole{}
    if err := db.Mysql.
        Where("group_id = ?", groupID).
        Take(&og).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return ErrGroupNotFound
        } else {
            return err
        }
    }

    updateGroup := make(map[string]interface{})

    if ug.Name != "" {
        updateGroup["name"] = ug.Name
    }

    err := db.Mysql.Transaction(func(tx *gorm.DB) error {
        if err := tx.
            Model(&Group{}).
            Where("id = ?", groupID).
            Updates(updateGroup).Error; err != nil {
            return err
        }

        if ug.RoleID != 0 {
            gr := GroupRole{RoleID: ug.RoleID}
            if err := tx.
                Model(&GroupRole{}).
                Where("group_id = ?", groupID).
                Updates(&gr).Error; err != nil {
                return err
            }
        }

        return nil
    })

    if err != nil {
        return err
    }

    if ug.RoleID != 0 {
        if _, casbinErr := auth.Casbin.RemoveGroupingPolicy(fmt.Sprintf("group::%d", groupID), fmt.Sprintf("role::%d", og.RoleID)); casbinErr != nil {
            return casbinErr
        }

        if _, casbinErr := auth.Casbin.AddGroupingPolicy(fmt.Sprintf("group::%d", groupID), fmt.Sprintf("role::%d", ug.RoleID)); casbinErr != nil {
            return casbinErr
        }
    }

    return nil
}

func Delete(groupID uint64) error {
    if _, err := Get(groupID); err != nil {
        return err
    }

    ug := make([]users.UserGroup, 0)

    if err := db.Mysql.
        Model(&users.UserGroup{}).
        Where("group_id = ?", groupID).
        Find(&ug).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }

    if len(ug) > 0 {
        return ErrGroupBound
    }

    if err := db.Mysql.Delete(&Group{}, groupID).Error; err != nil {
        return err
    }

    if _, err := auth.Casbin.RemoveFilteredGroupingPolicy(0, fmt.Sprintf("group::%d", groupID)); err != nil {
        return err
    }

    return nil
}

func List() (groups []GroupInfo, err error) {
    groups = make([]GroupInfo, 0)

    q := db.Mysql.
        Table("magi_group AS g").
        Select("g.id, g.name, g.created_at, g.updated_at, r.id AS role_id, r.name AS role_name").
        Joins("LEFT JOIN magi_group_role AS gr ON gr.group_id = g.id").
        Joins("LEFT JOIN magi_role AS r ON r.id = gr.role_id").
        Where("g.deleted_at IS NULL").
        Where("gr.deleted_at IS NULL").
        Where("r.deleted_at IS NULL").
        Order("g.id")

    err = q.Find(&groups).Error
    return groups, err
}
