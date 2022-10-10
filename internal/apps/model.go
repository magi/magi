package apps

import (
	"github/basefas/magi/internal/global"
	"time"
)

type App struct {
	global.Model
	Name          string `json:"name" gorm:"NOT NULL;"`
	Code          string `json:"code" gorm:"unique;NOT NULL;"`
	ProjectCode   string `json:"project_code" gorm:"NOT NULL;"`
	LabelCode     string `json:"label_code" gorm:"NOT NULL;"`
	TargetType    string `json:"target_type" gorm:"NOT NULL;"`
	EnvType       string `json:"env_type" gorm:"NOT NULL;"`
	EnvCode       string `json:"env_code"`
	EnvSetCode    string `json:"env_set_code"`
	Namespace     string `json:"namespace"`
	VarSetCode    string `json:"var_set_code" gorm:"NOT NULL;"`
	Description   string `json:"description"`
	ImageRegistry string `json:"image_registry" gorm:"NOT NULL;"`
	ImageName     string `json:"image_name" gorm:"NOT NULL;"`
	ImageTag      string `json:"image_tag"`
	Commit        string `json:"commit" gorm:"NOT NULL;"`
	Status        uint64 `json:"status" gorm:"type:uint;size:32;NOT NULL"`
	LinkConfig    uint64 `json:"link_config" gorm:"type:uint;size:32;NOT NULL;"`
	ConfigCode    string `json:"config_code"`
	ConfigVersion string `json:"config_version"`
	DeployVersion string `json:"deploy_version"`
	UsePatch      uint64 `json:"use_patch" gorm:"type:uint;size:32;NOT NULL;"`
	PatchContent  string `json:"patch_content" gorm:"type:text;"`
}

func (App) TableName() string {
	return "magi_app"
}

type CreateApp struct {
	ProjectCode   string `json:"project_code" binding:"required"`
	LabelCode     string `json:"label_code" binding:"required"`
	TargetType    string `json:"target_type" binding:"required"`
	EnvCode       string `json:"env_code"`
	EnvSetCode    string `json:"env_set_code"`
	Namespace     string `json:"namespace"`
	VarSetCode    string `json:"var_set_code" binding:"required"`
	Description   string `json:"description"`
	ImageRegistry string `json:"image_registry" binding:"required"`
	ImageName     string `json:"image_name" binding:"required"`
	LinkConfig    uint64 `json:"link_config" binding:"required"`
	UsePatch      uint64 `json:"use_patch" binding:"required"`
	ConfigCode    string `json:"config_code"`
	PatchContent  string `json:"patch_content"`
}

type UpdateApp struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AppInfo struct {
	ID            uint64    `json:"id"`
	Name          string    `json:"name"`
	Code          string    `json:"code"`
	Project       string    `json:"project"`
	Label         string    `json:"label"`
	TargetType    string    `json:"target_type"`
	EnvType       string    `json:"env_type"`
	Env           string    `json:"env"`
	EnvSet        string    `json:"env_set"`
	VarSet        string    `json:"var_set"`
	Namespace     string    `json:"namespace"`
	Description   string    `json:"description"`
	ImageRegistry string    `json:"image_registry"`
	ImageName     string    `json:"image_name"`
	ImageTag      string    `json:"image_tag"`
	Commit        string    `json:"commit"`
	LinkConfig    uint64    `json:"link_config"`
	UsePatch      uint64    `json:"use_patch"`
	ConfigCode    string    `json:"config_code"`
	ConfigVersion string    `json:"config_version"`
	DeployVersion string    `json:"deploy_version"`
	PatchContent  string    `json:"patch_content"`
	Status        uint64    `json:"status"`
	CreatedAt     time.Time `json:"create_time"`
	UpdatedAt     time.Time `json:"update_time"`
}
