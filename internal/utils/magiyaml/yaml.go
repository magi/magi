package magiyaml

import (
    "bytes"
    _ "embed"
    "text/template"
)

var (
    //go:embed  manifests/kustomization-cluster.yamltmpl
    clusterKustomization string

    //go:embed  manifests/kustomization-app.yamltmpl
    appKustomization string

    //go:embed  manifests/kustomization-project.yamltmpl
    projectKustomization string

    //go:embed  manifests/kustomization-config.yamltmpl
    configKustomization string

    //go:embed  manifests/kustomization-vars.yamltmpl
    varKustomization string

    //go:embed  manifests/var-configmap.yamltmpl
    varConfigMap string
)

const (
    ProjectPath = "projects"
    ClusterPath = "clusters"
    VarPath     = "vars"
    AppPath     = "apps"
    ConfigPath  = "config"
)

type Magi struct {
    Cluster                string
    AppPath                string
    ProjectPath            string
    ConfigPath             string
    VarPath                string
    ProjectName            string
    VarName                string
    AppName                string
    Namespace              string
    LinkConfig             uint64
    UsePatch               uint64
    PatchContent           string
    ImageRegistry          string
    ImageName              string
    ImageTag               string
    AppFolder              string
    DeployType             string
    KustomizationResources []string
    VarData                []string
    ConfigFiles            []string
}

func Make(file string, data interface{}) (string, error) {
    t := template.Must(template.New("yaml").Parse(file))
    var yaml bytes.Buffer
    err := t.Execute(&yaml, data)
    if err != nil {
        return "", err
    }

    return yaml.String(), nil
}

func MakeClusterKustomization(cluster string, namespace string, appName string, varName string) (string, error) {
    m := map[string]interface{}{}
    m["Magi"] = Magi{
        Cluster:   cluster,
        Namespace: namespace,
        AppName:   appName,
        AppPath:   AppPath,
        VarName:   varName,
    }
    k, err := Make(clusterKustomization, m)
    if err != nil {
        return "", err
    }
    return k, err
}

func MakeAppKustomization(namespace string, appName string, deployType string, imageRegistry string, imageName string,
    linkConfig uint64, usePatch uint64, patchContent string) (string, error) {
    m := map[string]interface{}{}
    m["Magi"] = Magi{
        ProjectPath:   ProjectPath,
        ConfigPath:    ConfigPath,
        Namespace:     namespace,
        AppName:       appName,
        DeployType:    deployType,
        ImageRegistry: imageRegistry,
        ImageName:     imageName,
        ImageTag:      "0.0.0",
        LinkConfig:    linkConfig,
        UsePatch:      usePatch,
        PatchContent:  patchContent}
    k, err := Make(appKustomization, m)
    if err != nil {
        return "", err
    }
    return k, err
}

func MakeProjectKustomization(files []string) (string, error) {
    m := map[string]interface{}{}
    m["Magi"] = Magi{KustomizationResources: files}
    k, err := Make(projectKustomization, m)
    if err != nil {
        return "", err
    }
    return k, err
}

func MakeConfigKustomization(appName string, files []string) (string, error) {
    m := map[string]interface{}{}
    m["Magi"] = Magi{AppName: appName, ConfigFiles: files}
    k, err := Make(configKustomization, m)
    if err != nil {
        return "", err
    }
    return k, err
}

func MakeVarKustomization() (string, error) {
    m := map[string]interface{}{}
    m["Magi"] = Magi{VarPath: VarPath}
    k, err := Make(varKustomization, m)
    if err != nil {
        return "", err
    }
    return k, err
}

func MakeVarConfigMap(varName string, varData []string) (string, error) {
    m := map[string]interface{}{}
    m["Magi"] = Magi{VarName: varName, VarData: varData}
    k, err := Make(varConfigMap, m)
    if err != nil {
        return "", err
    }
    return k, err
}

func makeAppFolder(cluster string, namespace string, appName string) string {
    return AppPath + "/" + cluster + "/" + namespace + "/" + appName + "/"
}

func MakeAppPatchPath(cluster string, namespace string, appName string) string {
    return makeAppFolder(cluster, namespace, appName) + "patch.yaml"
}

func MakeAppKustomizationPath(cluster string, namespace string, appName string) string {
    return makeAppFolder(cluster, namespace, appName) + "kustomization.yaml"
}

func makeConfigFolder(cluster string, namespace string, appName string) string {
    return makeAppFolder(cluster, namespace, appName) + ConfigPath + "/"
}

func MakeConfigFilePath(cluster string, namespace string, appName string, file string) string {
    return makeConfigFolder(cluster, namespace, appName) + file
}

func MakeConfigKustomizationPath(cluster string, namespace string, appName string) string {
    return makeConfigFolder(cluster, namespace, appName) + "kustomization.yaml"
}

func MakeClusterAppPath(cluster string, namespace string, appName string) string {
    return ClusterPath + "/" + cluster + "/" + AppPath + "/" + namespace + "/" + appName + ".yaml"
}

func MakeVarFilePath(code string) string {
    return VarPath + "/" + code + ".yaml"
}

func MakeVarKustomizationPath(cluster string) string {
    return ClusterPath + "/" + cluster + "/" + VarPath + "/vars.yaml"
}

func MakeClusterKustomizationPath(cluster string) string {
    return ClusterPath + "/" + cluster + "/flux-system/kustomization.yaml"
}
