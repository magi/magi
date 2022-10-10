package magiyaml

type AppKustomization struct {
    ApiVersion            string      `yaml:"apiVersion"`
    Kind                  string      `yaml:"kind"`
    Namespace             string      `yaml:"namespace"`
    CommonLabels          CommonLabel `yaml:"commonLabels"`
    Resources             []string    `yaml:"resources"`
    PatchesStrategicMerge []string    `yaml:"patchesStrategicMerge"`
    Images                []Image     `yaml:"images"`
}

type Image struct {
    Name    string `yaml:"name"`
    NewName string `yaml:"newName"`
    NewTag  string `yaml:"newTag"`
}

type CommonLabel struct {
    MagiApp        string `yaml:"magi-app"`
    MagiDeployType string `yaml:"magi-deploy-type"`
}
