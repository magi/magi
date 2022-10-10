package varsets

import (
    "errors"
    "github/basefas/magi/internal/utils/db"
    "github/basefas/magi/internal/utils/git"
    "github/basefas/magi/internal/utils/magiyaml"
    "gorm.io/gorm"
)

var (
    ErrVarSetNotFound = errors.New("var set not found ")
    ErrVarSetExists   = errors.New("var set already exists")
)

func Create(cv CreateVarSet) error {
    v := VarSet{}

    if err := db.Mysql.
        Where("code = ?", cv.Code).
        Find(&v).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }

    if v.ID != 0 {
        return ErrVarSetExists
    }
    nv := VarSet{
        Name:        cv.Name,
        Code:        cv.Code,
        LabelCode:   cv.LabelCode,
        Description: cv.Description,
    }

    if err := db.Mysql.Create(&nv).Error; err != nil {
        return err
    }

    return nil
}

func GetInfo(code string) (vi VarSetInfo, err error) {
    var vs VarSetItem

    q := db.Mysql.
        Table("magi_var_set AS vs").
        Select("vs.id, vs.name, vs.code, vs.description, vs.created_at, vs.updated_at, l.name AS label").
        Joins("LEFT JOIN magi_label AS l ON l.code = vs.label_code").
        Where("vs.deleted_at IS NULL").
        Where("l.deleted_at IS NULL").
        Where("vs.code = ?", code).
        Order("vs.id")

    err = q.Find(&vs).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return vi, ErrVarSetNotFound
        } else {
            return vi, err
        }
    }

    vars := make([]VarInfo, 0)
    q2 := db.Mysql.
        Table("magi_var AS v").
        Select("v.id, v.v_key, v.v_value, v.commit, v.updated_at, u.full_name AS editor").
        Joins("LEFT JOIN magi_user AS u ON u.id = v.editor_id").
        Where("v.deleted_at IS NULL").
        Where("u.deleted_at IS NULL").
        Where("v.var_set_code = ?", code).
        Order("v.id")

    err = q2.Find(&vars).Error
    if err != nil {
        return vi, err
    }
    vi = VarSetInfo{
        ID:          vs.ID,
        Name:        vs.Name,
        Code:        vs.Code,
        Label:       vs.Label,
        Description: vs.Description,
        Vars:        vars,
        CreatedAt:   vs.CreatedAt,
        UpdatedAt:   vs.UpdatedAt,
    }
    return vi, err
}

func Update(code string, uvs UpdateVarSet, uid uint64) error {
    shortSha := ""
    if len(uvs.Add) != 0 || len(uvs.Update) != 0 || len(uvs.Delete) != 0 {
        vs, err := GetInfo(code)
        if err != nil {
            return err
        }
        filePath := magiyaml.MakeVarFilePath(code)
        data := make([]string, 0)
        for _, v := range vs.Vars {
            data = append(data, v.VKey+": "+"\""+v.VValue+"\"")
        }

        vcm, err := magiyaml.MakeVarConfigMap(code, data)
        if err != nil {
            return err
        }
        var cfs []git.CommitFile
        cfs = append(cfs, git.CommitFile{Path: &filePath, Content: &vcm})

        shortSha, err = git.CommitWithShortSHA(cfs)
        if err != nil {
            return err
        }
    }

    updateVarSet := make(map[string]interface{})

    if uvs.Name != "" {
        updateVarSet["name"] = uvs.Name
    }

    if uvs.Description != "" {
        updateVarSet["description"] = uvs.Description
    }
    updateVarSet["commit"] = shortSha
    updateVarSet["editor_id"] = uid

    err := db.Mysql.Transaction(func(tx *gorm.DB) error {
        if err := tx.Model(&VarSet{}).
            Where("code = ?", code).
            Updates(updateVarSet).Error; err != nil {
            return err
        }

        if len(uvs.Add) > 0 {
            var av []Var
            for _, v := range uvs.Add {
                av = append(av, Var{
                    VarSetCode: code,
                    VKey:       v.VKey,
                    VValue:     v.VValue,
                    Commit:     shortSha,
                    EditorID:   uid,
                })
            }

            if err := tx.Create(&av).Error; err != nil {
                return err
            }
        }
        if len(uvs.Delete) > 0 {
            for _, v := range uvs.Delete {
                if err := tx.
                    Where("var_set_code = ?", code).
                    Where("v_key = ?", v.VKey).
                    Delete(&Var{}).Error; err != nil {
                    return err
                }
            }
        }
        if len(uvs.Update) > 0 {
            for _, v := range uvs.Update {
                if err := tx.
                    Model(&Var{}).
                    Where("var_set_code = ?", code).
                    Where("v_key = ?", v.VKey).
                    Updates(
                        map[string]interface{}{
                            "v_value":   v.VValue,
                            "commit":    shortSha,
                            "editor_id": uid,
                        }).Error; err != nil {
                    return err
                }
            }
        }
        return nil
    })
    if err != nil {
        return err
    }

    return err
}

func Delete(code string) error {
    err := db.Mysql.
        Where("code = ?", code).
        Delete(&VarSet{}).Error

    return err
}

func List(label string) (vars []VarSetItem, err error) {
    vars = make([]VarSetItem, 0)
    q := db.Mysql.
        Table("magi_var_set AS v").
        Select("v.id, v.name, v.code, v.description, v.commit, v.created_at, v.updated_at, l.name AS label, u.full_name AS editor").
        Joins("LEFT JOIN magi_label AS l ON l.code = v.label_code").
        Joins("LEFT JOIN magi_user AS u ON u.id = v.editor_id").
        Where("v.deleted_at IS NULL").
        Where("l.deleted_at IS NULL").
        Where("u.deleted_at IS NULL").
        Order("v.id")

    if label != "" {
        q = q.Where("v.label_code = ?", label)
    }

    err = q.Find(&vars).Error
    return vars, err
}
