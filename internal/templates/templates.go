package templates

import (
    "errors"
    "github/basefas/magi/internal/utils/db"
    "gorm.io/gorm"
)

var (
    ErrTemplateNotFound = errors.New("template not found")
    ErrTemplateExists   = errors.New("template already exists")
)

func Create(ct CreateTemplate, uid uint64) error {
    t := Template{}

    if err := db.Mysql.
        Where("name = ?", ct.Name).
        Find(&t).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }

    if t.ID != 0 {
        return ErrTemplateExists
    }
    nt := Template{
        Name:      ct.Name,
        CreatorID: uid,
    }

    if err := db.Mysql.Create(&nt).Error; err != nil {
        return err
    }

    return nil
}

func GetInfo(id uint64) (ei TemplateInfo, err error) {
    if err = db.Mysql.
        Model(&Template{}).
        Where("id", id).
        Find(&ei).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return ei, ErrTemplateNotFound
        } else {
            return ei, err
        }
    }
    return ei, err
}

func Delete(id uint64) error {
    err := db.Mysql.
        Where("id = ?", id).
        Delete(&Template{}).Error

    return err
}

func List() (templates []TemplateInfo, err error) {
    templates = make([]TemplateInfo, 0)

    q := db.Mysql.
        Table("magi_template AS t").
        Select("t.id, t.name, t.created_at, t.updated_at, u.full_name AS creator").
        Joins("LEFT JOIN magi_user AS u ON t.creator_id = u.id").
        Where("t.deleted_at IS NULL").
        Where("u.deleted_at IS NULL").
        Order("t.id")

    err = q.Find(&templates).Error
    return templates, err
}

func EditFiles(id uint64, uid uint64, efs EditTemplateFile) error {
    err := db.Mysql.Transaction(func(tx *gorm.DB) error {
        if len(efs.Add) > 0 {
            var afs []TemplateManifest
            for _, file := range efs.Add {
                afs = append(afs, TemplateManifest{
                    TemplateID: id,
                    Filename:   file.Filename,
                    Content:    file.Content,
                })
            }

            if err := tx.Create(&afs).Error; err != nil {
                return err
            }
        }
        if len(efs.Delete) > 0 {
            for _, file := range efs.Delete {
                if err := tx.
                    Where("template_id = ?", id).
                    Where("filename = ?", file.Filename).
                    Delete(&TemplateManifest{}).Error; err != nil {
                    return err
                }
            }
        }
        if len(efs.Update) > 0 {
            for _, file := range efs.Update {
                if err := tx.
                    Model(&TemplateManifest{}).
                    Where("template_id = ?", id).
                    Where("filename = ?", file.Filename).
                    Update("content", file.Content).Error; err != nil {
                    return err
                }
            }
        }
        if err := tx.
            Model(&Template{}).
            Where("id = ?", id).
            Update("updater_id", uid).Error; err != nil {
            return err
        }
        return nil
    })

    return err
}

func FileList(templateID uint64) (files []TemplateFile, err error) {
    files = make([]TemplateFile, 0)
    err = db.Mysql.
        Model(&TemplateManifest{}).
        Where("template_id = ?", templateID).
        Find(&files).Error
    return files, err
}
