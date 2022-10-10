package clusters

import (
    "errors"
    "github/basefas/magi/internal/utils/db"
    "github/basefas/magi/internal/utils/git"
    "github/basefas/magi/internal/utils/magiyaml"
    "github/basefas/magi/pkg/k8s/client"
    "github/basefas/magi/pkg/k8s/cluster"
    "gorm.io/gorm"
)

var (
    ErrClusterNotFound         = errors.New("cluster not found")
    ErrClusterNotBoundWithFlux = errors.New("cluster not bound with flux")
    ErrClusterExists           = errors.New("cluster already exists")
)

func Create(cc AddCluster) error {
    c := Cluster{}

    if err := db.Mysql.
        Where("code = ?", cc.Code).
        Find(&c).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }

    if c.ID != 0 {
        return ErrClusterExists
    }

    clusterPath := magiyaml.MakeClusterKustomizationPath(cc.Code)
    hasCluster, err := git.HasContent(clusterPath)
    if err != nil {
        return err
    }
    if !hasCluster {
        return ErrClusterNotBoundWithFlux
    }

    varsPath := magiyaml.MakeVarKustomizationPath(cc.Code)
    hasVars, err := git.HasContent(varsPath)
    if err != nil {
        return err
    }
    if !hasVars {
        cfs := make([]git.CommitFile, 0)
        varKustomization, err := makeVarKustomization(cc.Code)
        if err != nil {
            return err
        }
        cfs = append(cfs, varKustomization...)
        _, err = git.CommitWithShortSHA(cfs)
        if err != nil {
            return err
        }
    }

    nc := Cluster{Name: cc.Name, Code: cc.Code, KubeConfig: cc.KubeConfig, Status: 0}

    err = db.Mysql.Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(&nc).Error; err != nil {
            return err
        }
        return nil
    })

    return err
}

func GetInfo(code string) (ci ClusterInfo, err error) {
    if err = db.Mysql.
        Model(&Cluster{}).
        Where("code", code).
        Take(&ci).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return ci, ErrClusterNotFound
        } else {
            return ci, err
        }
    }
    return ci, nil
}

func Update(code string, uc UpdateCluster) error {
    updateK8sCluster := make(map[string]interface{})

    if uc.Name != "" {
        updateK8sCluster["name"] = uc.Name
    }

    if err := db.Mysql.
        Model(&Cluster{}).
        Where("code = ?", code).
        Updates(updateK8sCluster).Error; err != nil {
        return err
    }

    return nil
}

func Delete(code string) error {
    err := db.Mysql.
        Where("code = ?", code).
        Delete(&Cluster{}).Error

    return err
}

func List() (clusters []ClusterInfo, err error) {
    clusters = make([]ClusterInfo, 0)
    q := db.Mysql.
        Table("magi_cluster AS c").
        Select("c.id, c.name, c.code, c.created_at, c.updated_at, c.kube_config").
        Where("c.deleted_at IS NULL").
        Order("c.id")

    err = q.Find(&clusters).Error
    if err != nil {
        return clusters, err
    }
    for i, c := range clusters {
        kc, _ := client.GetK8sClient(c.KubeConfig)
        version, _ := cluster.GetK8sClusterVersion(kc)
        status, readyNodes, nodes, _ := cluster.GetK8sClusterNodesNumber(kc)
        clusters[i].K8sClusterVersion = version
        clusters[i].K8sClusterNodesNumber = nodes
        clusters[i].K8sClusterNodesReadyNumber = readyNodes
        clusters[i].Status = status
    }
    return clusters, err
}

func makeVarKustomization(cluster string) (cfs []git.CommitFile, err error) {
    cfs = make([]git.CommitFile, 0)
    kustomizationPath := magiyaml.MakeVarKustomizationPath(cluster)
    kustomization, err := magiyaml.MakeVarKustomization()
    cfs = append(cfs, git.CommitFile{Path: &kustomizationPath, Content: &kustomization})
    return cfs, err
}
