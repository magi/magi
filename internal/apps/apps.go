package apps

import (
    "errors"
    "github/basefas/magi/internal/configs"
    "github/basefas/magi/internal/envs"
    "github/basefas/magi/internal/envsets"
    "github/basefas/magi/internal/utils/db"
    "github/basefas/magi/internal/utils/git"
    "github/basefas/magi/internal/utils/magiyaml"
    "gorm.io/gorm"
)

var (
    ErrAppExists             = errors.New("app already exists")
    ErrUnsupportedTargetType = errors.New("unsupported target type")
    ErrConfigLinked          = errors.New("config already linked")
)

func Create(ca CreateApp) error {
    app := App{}
    appName := ca.ProjectCode
    appCode := ca.LabelCode + "-" + appName

    if err := db.Mysql.
        Where("code = ?", appCode).
        Find(&app).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }
    if app.ID != 0 {
        return ErrAppExists
    }

    config, err := configs.GetInfo(ca.ConfigCode)
    if err != nil {
        return err
    }
    if config.Linked == 1 {
        return ErrConfigLinked
    }

    cfs := make([]git.CommitFile, 0)
    envType := ""
    switch ca.TargetType {
    case "env":
        env, err := envs.GetInfo(ca.EnvCode)
        if err != nil {
            return err
        }
        envType = env.Type
        envFiles, err := makeAppFiles(env, ca)
        if err != nil {
            return err
        }
        cfs = append(cfs, envFiles...)
    case "env_set":
        es, err := envsets.GetInfo(ca.EnvSetCode)
        if err != nil {
            return err
        }
        envType = es.Type
        for _, env := range es.Envs {
            envFiles, err := makeAppFiles(env, ca)
            if err != nil {
                return err
            }
            cfs = append(cfs, envFiles...)
        }
    default:
        return ErrUnsupportedTargetType
    }

    shortSha, err := git.CommitWithShortSHA(cfs)
    if err != nil {
        return err
    }

    err = db.Mysql.Transaction(func(tx *gorm.DB) error {
        na := App{
            Name:          appName,
            Code:          appCode,
            ProjectCode:   ca.ProjectCode,
            LabelCode:     ca.LabelCode,
            TargetType:    ca.TargetType,
            EnvType:       envType,
            EnvCode:       ca.EnvCode,
            EnvSetCode:    ca.EnvSetCode,
            VarSetCode:    ca.VarSetCode,
            Description:   ca.Description,
            LinkConfig:    ca.LinkConfig,
            ConfigCode:    ca.ConfigCode,
            UsePatch:      ca.UsePatch,
            PatchContent:  ca.PatchContent,
            ImageRegistry: ca.ImageRegistry,
            ImageName:     ca.ImageName,
            Status:        1,
            Commit:        shortSha,
        }

        if err = tx.Create(&na).Error; err != nil {
            return err
        }

        uc := configs.Config{Linked: 1, LinkedAppCode: appCode}
        if err = tx.
            Model(&configs.Config{}).
            Where("code = ?", ca.ConfigCode).
            Updates(&uc).Error; err != nil {
            return err
        }

        return nil
    })

    return err
}

func Get(code string) (app App, err error) {
    err = db.Mysql.
        Where("code = ?", code).
        Find(&app).Error
    return app, err
}

func GetInfo(code string) (ai AppInfo, err error) {
    q := db.Mysql.
        Table("magi_app AS a").
        Select("a.id, a.name, a.code, a.target_type, a.env_type, a.description, a.status, a.commit,"+
            " a.image_registry, a.image_name, a.image_tag, a.created_at, a.updated_at,"+
            " a.link_config, a.config_code, a.use_patch, a.patch_content, a.deploy_version, a.config_version,"+
            " p.name AS project, l.name AS label, e.name AS env, es.name AS env_set, vs.name AS var_set").
        Joins("LEFT JOIN magi_project AS p ON p.code = a.project_code").
        Joins("LEFT JOIN magi_label AS l ON l.code = a.label_code").
        Joins("LEFT JOIN magi_env AS e ON e.code = a.env_code").
        Joins("LEFT JOIN magi_env_set AS es ON es.code = a.env_set_code").
        Joins("LEFT JOIN magi_var_set AS vs ON vs.code = a.var_set_code").
        Where("a.deleted_at IS NULL").
        Where("p.deleted_at IS NULL").
        Where("l.deleted_at IS NULL").
        Where("e.deleted_at IS NULL").
        Where("es.deleted_at IS NULL").
        Where("vs.deleted_at IS NULL").
        Where("a.code = ?", code).
        Order("a.id")

    err = q.Find(&ai).Error
    return ai, nil
}

func Update(code string, ua UpdateApp) error {
    updateApp := make(map[string]interface{})

    if ua.Name != "" {
        updateApp["name"] = ua.Name
    }

    if ua.Description != "" {
        updateApp["description"] = ua.Description
    }

    if err := db.Mysql.
        Model(&App{}).
        Where("code = ?", code).
        Updates(updateApp).Error; err != nil {
        return err
    }
    return nil
}

func Delete(code string) error {
    err := db.Mysql.
        Where("code = ?", code).
        Delete(&App{}).Error

    return err
}

func ListByLabel(label string) (apps []AppInfo, err error) {
    apps = make([]AppInfo, 0)
    q := db.Mysql.
        Table("magi_app AS a").
        Select("a.id, a.name, a.code, a.target_type, a.env_type, a.description, a.status, a.commit," +
            " a.image_registry, a.image_name, a.image_tag, a.created_at, a.updated_at," +
            " a.link_config, a.config_code, a.use_patch, a.patch_content, a.deploy_version, a.config_version," +
            " p.name AS project, l.name AS label, e.name AS env, es.name AS env_set, vs.name AS var_set").
        Joins("LEFT JOIN magi_project AS p ON p.code = a.project_code").
        Joins("LEFT JOIN magi_label AS l ON l.code = a.label_code").
        Joins("LEFT JOIN magi_env AS e ON e.code = a.env_code").
        Joins("LEFT JOIN magi_env_set AS es ON es.code = a.env_set_code").
        Joins("LEFT JOIN magi_var_set AS vs ON vs.code = a.var_set_code").
        Where("a.deleted_at IS NULL").
        Where("p.deleted_at IS NULL").
        Where("l.deleted_at IS NULL").
        Where("e.deleted_at IS NULL").
        Where("es.deleted_at IS NULL").
        Where("vs.deleted_at IS NULL").
        Order("a.id")

    if !(label == "" || label == "all") {
        q = q.Where("a.label_code = ?", label)
    }

    err = q.Find(&apps).Error
    return apps, err
}

func makeAppFiles(env envs.EnvInfo, ca CreateApp) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)
    namespace := ""
    switch env.Type {
    case "cluster":
        namespace = ca.Namespace
    case "namespace":
        namespace = env.Namespace
    default:
        return cfs, ErrUnsupportedTargetType
    }

    appKustomization, err := makeAppKustomization(env.ClusterCode, namespace, ca.ProjectCode, env.Type,
        ca.ImageRegistry, ca.ImageName, ca.LinkConfig, ca.UsePatch, ca.PatchContent)
    if err != nil {
        return cfs, err
    }
    cfs = append(cfs, appKustomization...)

    if ca.UsePatch == 1 {
        patchFile, err := makeAppPatch(env.ClusterCode, namespace, ca.ProjectCode, ca.PatchContent)
        if err != nil {
            return cfs, err
        }
        cfs = append(cfs, patchFile...)
    }
    return cfs, err
}

func makeAppKustomization(cluster string, namespace string, appName string, deployType string, imageRegistry string,
    imageName string, linkConfig uint64, usePatch uint64, patchContent string) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)
    kustomizationPath := magiyaml.MakeAppKustomizationPath(cluster, namespace, appName)
    kustomization, err := magiyaml.MakeAppKustomization(namespace, appName, deployType, imageRegistry, imageName, linkConfig, usePatch, patchContent)
    if err != nil {
        return cfs, err
    }
    cfs = append(cfs, git.CommitFile{Path: &kustomizationPath, Content: &kustomization})
    return cfs, err
}

func makeAppPatch(cluster string, namespace string, appName string, patchContent string) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)
    patchPath := magiyaml.MakeAppPatchPath(cluster, namespace, appName)
    cfs = append(cfs, git.CommitFile{Path: &patchPath, Content: &patchContent})
    return cfs, err
}
