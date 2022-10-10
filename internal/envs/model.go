package envs

import (
    "github/basefas/magi/internal/global"
    "time"
)

type Env struct {
    global.Model
    Name        string `json:"name" gorm:"NOT NULL;"`
    Code        string `json:"code" gorm:"unique;NOT NULL;"`
    Type        string `json:"type" gorm:"NOT NULL;"`
    ClusterCode string `json:"cluster_code" gorm:"NOT NULL;"`
    LabelCode   string `json:"label_code" gorm:"NOT NULL;"`
    Namespace   string `json:"namespace"`
}

func (Env) TableName() string {
    return "magi_env"
}

type CreateEnv struct {
    Name        string `json:"name" binding:"required"`
    Code        string `json:"code" binding:"required"`
    Type        string `json:"type" binding:"required"`
    ClusterCode string `json:"cluster_code" binding:"required"`
    Namespace   string `json:"namespace"`
    LabelCode   string `json:"label_code" binding:"required"`
}

type UpdateEnv struct {
    Name string `json:"name"`
}

type EnvInfo struct {
    ID          uint64    `json:"id"`
    Name        string    `json:"name"`
    Code        string    `json:"code"`
    Type        string    `json:"type"`
    Cluster     string    `json:"cluster"`
    Label       string    `json:"label"`
    ClusterCode string    `json:"cluster_code"`
    LabelCode   string    `json:"label_code"`
    Namespace   string    `json:"namespace"`
    CreatedAt   time.Time `json:"create_time"`
    UpdatedAt   time.Time `json:"update_time"`
}
