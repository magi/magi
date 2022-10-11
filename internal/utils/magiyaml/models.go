package magiyaml

type AppKustomization struct {
    ApiVersion            string            `yaml:"apiVersion"`
    Kind                  string            `yaml:"kind"`
    Namespace             string            `yaml:"namespace"`
    CommonLabels          CommonLabels      `yaml:"commonLabels"`
    CommonAnnotations     CommonAnnotations `yaml:"commonAnnotations"`
    Resources             []string          `yaml:"resources"`
    PatchesStrategicMerge []string          `yaml:"patchesStrategicMerge"`
    Images                []Image           `yaml:"images"`
}

type Image struct {
    Name    string `yaml:"name"`
    NewName string `yaml:"newName"`
    NewTag  string `yaml:"newTag"`
}

type CommonLabels struct {
    MagiApp string `yaml:"magi-app"`
}

type CommonAnnotations struct {
    MagiDeployType string `yaml:"magi-deploy-type"`
}
