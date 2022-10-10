package clusters

import (
    "github/basefas/magi/internal/global"
    "time"
)

type Cluster struct {
    global.Model
    Name       string `json:"name" gorm:"NOT NULL"`
    Code       string `json:"code" gorm:"NOT NULL;unique"`
    K8sVersion string `json:"k8s_version" gorm:"NOT NULL"`
    KubeConfig string `json:"kube_config" gorm:"NOT NULL;type:text;"`
    Status     uint64 `json:"status" gorm:"type:uint;size:32;"`
    Common     string `json:"common"`
}

func (Cluster) TableName() string {
    return "magi_cluster"
}

type AddCluster struct {
    Name       string `json:"name"`
    Code       string `json:"code"`
    KubeConfig string `json:"kube_config"`
    Common     string `json:"common"`
}

type UpdateCluster struct {
    Name   string `json:"name"`
    Common string `json:"common"`
}

type ClusterInfo struct {
    ID                         uint64    `json:"id"`
    CreatedAt                  time.Time `json:"create_time"`
    UpdatedAt                  time.Time `json:"update_time"`
    Name                       string    `json:"name"`
    Code                       string    `json:"code"`
    KubeConfig                 string    `json:"kube_config"`
    K8sClusterVersion          string    `json:"k8s_cluster_version"`
    K8sClusterNodesNumber      int       `json:"k8s_cluster_nodes_number"`
    K8sClusterNodesReadyNumber int       `json:"k8s_cluster_nodes_ready_number"`
    Status                     string    `json:"k8s_cluster_status"`
    Common                     string    `json:"common"`
}
