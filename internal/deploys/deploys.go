package deploys

import (
    "errors"
    "github/basefas/magi/internal/apps"
    "github/basefas/magi/internal/configs"
    "github/basefas/magi/internal/envs"
    "github/basefas/magi/internal/envsets"
    "github/basefas/magi/internal/utils"
    "github/basefas/magi/internal/utils/db"
    "github/basefas/magi/internal/utils/git"
    "github/basefas/magi/internal/utils/magiyaml"
    "gopkg.in/yaml.v3"
    "gorm.io/gorm"
    "time"
)

var (
    ErrDeployStatusErr = errors.New("deploy status error")
)

func Create(cd CreateDeploy, uid uint64) error {
    app, err := apps.Get(cd.AppCode)
    if err != nil {
        return err
    }

    version := "d-" + cd.AppCode + "-" + utils.GetNowString()

    nd := Deploy{
        AppName:       app.Name,
        AppCode:       cd.AppCode,
        Version:       version,
        ImageTag:      cd.ImageTag,
        ConfigVersion: cd.ConfigVersion,
        PatchContent:  cd.PatchContent,
        Status:        1,
        CreatorID:     uid,
    }

    if err = db.Mysql.Create(&nd).Error; err != nil {
        return err
    }

    return nil
}

func DeployDo(version string, uid uint64) error {
    deploy, err := Get(version)
    if err != nil {
        return err
    }

    if !(deploy.Status == 1 || deploy.Status == 5) {
        return ErrDeployStatusErr
    }

    app, err := apps.Get(deploy.AppCode)
    if err != nil {
        return err
    }

    if err = db.Mysql.
        Model(&Deploy{}).
        Where("version = ?", deploy.Version).
        Updates(map[string]interface{}{"status": 2}).Error; err != nil {
        return err
    }

    shortSha, err := makeDeployCommit(app, deploy)
    if err != nil || shortSha == "" {
        if err = db.Mysql.
            Model(&Deploy{}).
            Where("version = ?", deploy.Version).
            Updates(map[string]interface{}{"status": 5}).Error; err != nil {
            return err
        }
        return err
    }

    err = db.Mysql.Transaction(func(tx *gorm.DB) error {
        updateDeploy := map[string]interface{}{
            "status":      3,
            "deployer_id": uid,
            "commit":      shortSha,
            "finished_at": gorm.DeletedAt{Time: time.Now(), Valid: true},
        }
        if err = tx.
            Model(&Deploy{}).
            Where("version = ?", deploy.Version).
            Updates(updateDeploy).Error; err != nil {
            return err
        }
        if app.LinkConfig == 1 && app.ConfigVersion != deploy.ConfigVersion {
            oldConfig := map[string]interface{}{
                "status": 2,
            }
            if err = tx.
                Model(&configs.ConfigHistory{}).
                Where("version = ?", app.ConfigVersion).
                Updates(oldConfig).Error; err != nil {
                return err
            }
            newConfig := map[string]interface{}{
                "status": 1,
                "commit": shortSha,
            }
            if err = tx.
                Model(&configs.ConfigHistory{}).
                Where("version = ?", deploy.ConfigVersion).
                Updates(newConfig).Error; err != nil {
                return err
            }
            updateConfig := map[string]interface{}{
                "current_version": deploy.Version,
                "commit":          shortSha,
            }
            if err = tx.
                Model(&configs.Config{}).
                Where("code = ?", app.ConfigCode).
                Updates(updateConfig).Error; err != nil {
                return err
            }
        }

        updateApp := map[string]interface{}{
            "deploy_version": deploy.Version,
            "image_tag":      deploy.ImageTag,
            "commit":         shortSha,
            "status":         3,
        }
        if deploy.ConfigVersion != "" {
            updateApp["config_version"] = deploy.ConfigVersion
        }
        if deploy.PatchContent != "" {
            updateApp["patch_content"] = deploy.PatchContent
        }
        if err = tx.
            Model(&apps.App{}).
            Where("code = ?", deploy.AppCode).
            Updates(updateApp).Error; err != nil {
            return err
        }

        return nil
    })

    return err
}

func Get(version string) (deploy Deploy, err error) {
    err = db.Mysql.
        Model(&Deploy{}).
        Where("version", version).
        Scan(&deploy).Error
    return deploy, err
}

func List(appCode string) (deploys []DeployInfo, err error) {
    deploys = make([]DeployInfo, 0)
    q := db.Mysql.
        Table("magi_deploy AS d").
        Select("d.id, d.version, d.image_tag, d.config_version, d.status, d.patch_content," +
            " d.created_at, d.updated_at, d.finished_at, d.commit," +
            " u1.full_name AS creator, u2.full_name AS deployer").
        Joins("LEFT JOIN magi_user AS u1 ON u1.id = d.creator_id").
        Joins("LEFT JOIN magi_user AS u2 ON u2.id = d.deployer_id").
        Where("d.deleted_at IS NULL").
        Where("u1.deleted_at IS NULL").
        Where("u2.deleted_at IS NULL").
        Order("d.id DESC")

    if appCode != "" {
        q = q.Where("d.app_code = ?", appCode)
    }

    err = q.Scan(&deploys).Error
    return deploys, err
}

func makeDeployCommit(app apps.App, deploy Deploy) (shortSha string, err error) {
    var cfs []git.CommitFile
    switch app.TargetType {
    case "env":
        env, err := envs.GetInfo(app.EnvCode)
        if err != nil {
            return shortSha, err
        }
        deployFiles := make([]git.CommitFile, 0)
        if app.Status == 1 {
            deployFiles, err = makeCreateDeployFiles(env, app, deploy.ConfigVersion)
        } else {
            deployFiles, err = makeDeployUpdateFiles(env, app, deploy)
        }
        if err != nil {
            return shortSha, err
        }
        cfs = append(cfs, deployFiles...)
    case "env_set":
        es, err := envsets.GetInfo(app.EnvSetCode)
        if err != nil {
            return shortSha, err
        }
        for _, env := range es.Envs {
            deployFiles := make([]git.CommitFile, 0)
            if app.Status == 1 {
                deployFiles, err = makeCreateDeployFiles(env, app, deploy.ConfigVersion)
            } else {
                deployFiles, err = makeDeployUpdateFiles(env, app, deploy)
            }
            if err != nil {
                return shortSha, err
            }
            cfs = append(cfs, deployFiles...)
        }
    }
    shortSha, err = git.CommitWithShortSHA(cfs)
    return shortSha, err
}

func makeCreateDeployFiles(env envs.EnvInfo, app apps.App, configVersion string) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)
    namespace := ""
    switch env.Type {
    case "cluster":
        namespace = app.Namespace
    case "namespace":
        namespace = env.Namespace
    }

    if app.LinkConfig == 1 {
        cfl, err := configs.FileList(configVersion)
        if err != nil {
            return cfs, err
        }

        configFiles, err := makeCreateConfigFiles(cfl, env.ClusterCode, namespace, app.Name)
        if err != nil {
            return cfs, err
        }
        cfs = append(cfs, configFiles...)
    }

    deployFiles, err := makeCreateClusterFiles(env.ClusterCode, namespace, app.Name, app.VarSetCode)
    if err != nil {
        return cfs, err
    }
    cfs = append(cfs, deployFiles...)

    return cfs, err
}

func makeCreateConfigFiles(configFiles []configs.ConfigFileInfo, cluster string, namespace string, appName string) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)

    files := make([]string, 0)
    for _, f := range configFiles {
        files = append(files, f.Filename)
        filePath := magiyaml.MakeConfigFilePath(cluster, namespace, appName, f.Filename)
        cfs = append(cfs, git.CommitFile{Path: &filePath, Content: &f.Content})
    }

    kustomizationPath := magiyaml.MakeConfigKustomizationPath(cluster, namespace, appName)
    kustomization, err := magiyaml.MakeConfigKustomization(appName, files)
    if err != nil {
        return cfs, err
    }
    cfs = append(cfs, git.CommitFile{Path: &kustomizationPath, Content: &kustomization})

    return cfs, err
}

func makeCreateClusterFiles(cluster string, namespace string, appName string, varName string) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)

    appPath := magiyaml.MakeClusterAppPath(cluster, namespace, appName)
    kustomization, err := magiyaml.MakeClusterKustomization(cluster, namespace, appName, varName)
    if err != nil {
        return cfs, err
    }
    cfs = append(cfs, git.CommitFile{Path: &appPath, Content: &kustomization})

    return cfs, err
}

func makeDeployUpdateFiles(env envs.EnvInfo, app apps.App, deploy Deploy) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)
    namespace := ""
    switch env.Type {
    case "cluster":
        namespace = app.Namespace
    case "namespace":
        namespace = env.Namespace
    }
    if app.LinkConfig == 1 && app.ConfigVersion != deploy.ConfigVersion {
        configFiles, err := makeUpdateConfigFiles(env.ClusterCode, namespace, app.Name, deploy.ConfigVersion)
        if err != nil {
            return nil, err
        }
        cfs = append(cfs, configFiles...)
    }

    if app.ImageTag != deploy.ImageTag {
        appFile, err := makeUpdateAppKustomizationFiles(env.ClusterCode, namespace, app.Name, deploy.ImageTag)
        if err != nil {
            return nil, err
        }
        cfs = append(cfs, appFile...)
    }

    if app.UsePatch == 1 && app.PatchContent != deploy.PatchContent {
        patchFile := makeUpdatePatchFile(env.ClusterCode, namespace, app.Name, deploy.PatchContent)
        cfs = append(cfs, patchFile...)
    }

    return cfs, err
}

func makeUpdateConfigFiles(cluster string, namespace string, appName string, configVersion string) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)

    currentConfig, err := configs.CurrentConfig()
    if err != nil {
        return cfs, err
    }
    newConfig, err := configs.FileList(configVersion)
    if err != nil {
        return cfs, err
    }

    oldConfigMap := make(map[string]string)
    newConfigMap := make(map[string]string)
    oldConfigFiles := make([]string, 0)
    newConfigFiles := make([]string, 0)
    for _, f := range currentConfig.Files {
        oldConfigMap[f.Filename] = f.Content
        oldConfigFiles = append(oldConfigFiles, f.Filename)
    }
    for _, f := range newConfig {
        newConfigMap[f.Filename] = f.Content
        newConfigFiles = append(newConfigFiles, f.Filename)
    }

    addConfigFiles := utils.Difference(newConfigFiles, oldConfigFiles)
    for _, file := range addConfigFiles {
        filePath := magiyaml.MakeConfigFilePath(cluster, namespace, appName, file)
        content := newConfigMap[file]
        cfs = append(cfs, git.CommitFile{Path: &filePath, Content: &content})
    }

    deleteConfigFiles := utils.Difference(oldConfigFiles, newConfigFiles)
    for _, file := range deleteConfigFiles {
        filePath := magiyaml.MakeConfigFilePath(cluster, namespace, appName, file)
        cfs = append(cfs, git.CommitFile{Path: &filePath, Content: nil})
    }

    sameConfigFiles := utils.Intersect(oldConfigFiles, newConfigFiles)
    for _, file := range sameConfigFiles {
        if oldConfigMap[file] != newConfigMap[file] {
            filePath := magiyaml.MakeConfigFilePath(cluster, namespace, appName, file)
            content := newConfigMap[file]
            cfs = append(cfs, git.CommitFile{Path: &filePath, Content: &content})
        }
    }

    kustomizationPath := magiyaml.MakeConfigKustomizationPath(cluster, namespace, appName)
    kustomization, err := magiyaml.MakeConfigKustomization(appName, newConfigFiles)
    if err != nil {
        return cfs, err
    }
    cfs = append(cfs, git.CommitFile{Path: &kustomizationPath, Content: &kustomization})

    return cfs, err
}

func makeUpdateAppKustomizationFiles(cluster string, namespace string, appName string, newTag string) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)
    akp := magiyaml.MakeAppKustomizationPath(cluster, namespace, appName)

    ak, err := git.Get(akp)
    if err != nil {
        return cfs, err
    }

    nak, err := setNewTag(ak, newTag)
    if err != nil {
        return cfs, err
    }
    cfs = append(cfs, git.CommitFile{Path: &akp, Content: &nak})
    return cfs, err
}

func makeUpdatePatchFile(cluster string, namespace string, appName string, patchContent string) []git.CommitFile {
    cfs := make([]git.CommitFile, 0)
    patchPath := magiyaml.MakeAppPatchPath(cluster, namespace, appName)
    cfs = append(cfs, git.CommitFile{Path: &patchPath, Content: &patchContent})
    return cfs
}

func setNewTag(appYaml string, newTag string) (newYaml string, err error) {
    var appKustomization magiyaml.AppKustomization
    err = yaml.Unmarshal([]byte(appYaml), &appKustomization)
    if err != nil {
        return "", err
    }
    appKustomization.Images[0].NewTag = newTag
    newKustomization, err := yaml.Marshal(appKustomization)
    if err != nil {
        return "", err
    }
    newYaml = string(newKustomization)
    return newYaml, err
}
