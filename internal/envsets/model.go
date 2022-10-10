package envsets

import (
	"github/basefas/magi/internal/envs"
	"github/basefas/magi/internal/global"
	"time"
)

type EnvSet struct {
	global.Model
	Name      string `json:"name" gorm:"NOT NULL;"`
	Code      string `json:"code" gorm:"unique;NOT NULL;"`
	LabelCode string `json:"label_code" gorm:"NOT NULL;"`
	Type      string `json:"type" gorm:"NOT NULL;"`
}

func (EnvSet) TableName() string {
	return "magi_env_set"
}

type CreateEnvSet struct {
	Name      string   `json:"name" binding:"required"`
	Code      string   `json:"code" binding:"required"`
	Envs      []string `json:"envs" binding:"required"`
	Type      string   `json:"type" binding:"required"`
	LabelCode string   `json:"label_code" binding:"required"`
}

type UpdateEnvSet struct {
	Name string   `json:"name"`
	Envs []string `json:"envs"`
}

type EnvSetInfo struct {
	ID        uint64         `json:"id"`
	Name      string         `json:"name"`
	Code      string         `json:"code"`
	Envs      []envs.EnvInfo `json:"envs"`
	Type      string         `json:"type"`
	Label     string         `json:"label"`
	CreatedAt time.Time      `json:"create_time"`
	UpdatedAt time.Time      `json:"update_time"`
}

type EnvSetInfoWithoutEnv struct {
	ID        uint64    `json:"id"`
	Name      string    `json:"name"`
	Code      string    `json:"code"`
	Type      string    `json:"type"`
	Label     string    `json:"label"`
	CreatedAt time.Time `json:"create_time"`
	UpdatedAt time.Time `json:"update_time"`
}

type Env struct {
	Name string `json:"name"`
	Code string `json:"code"`
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
	EnvSetCode  string    `json:"env_set_code"`
	CreatedAt   time.Time `json:"create_time"`
	UpdatedAt   time.Time `json:"update_time"`
}

type EnvSetEnv struct {
	global.Model
	EnvCode    string `json:"env_code" gorm:"NOT NULL;"`
	EnvSetCode string `json:"env_set_code" gorm:"NOT NULL;"`
}

func (EnvSetEnv) TableName() string {
	return "magi_env_set_env"
}
