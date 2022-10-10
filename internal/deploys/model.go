package deploys

import (
	"github/basefas/magi/internal/global"
	"gorm.io/gorm"
	"time"
)

type Deploy struct {
	global.Model
	Version       string         `json:"version" gorm:"unique;NOT NULL;"`
	AppName       string         `json:"app_name" gorm:"NOT NULL;"`
	AppCode       string         `json:"app_code" gorm:"NOT NULL;"`
	ImageTag      string         `json:"image_tag" gorm:"NOT NULL;"`
	ConfigVersion string         `json:"config_version"`
	PatchContent  string         `json:"patch_content" gorm:"type:text;"`
	Status        uint64         `json:"status" gorm:"type:uint;size:32;NOT NULL"`
	DeployerID    uint64         `json:"deployer_id" gorm:"type:uint;size:32"`
	CreatorID     uint64         `json:"creator_id" gorm:"type:uint;size:32;NOT NULL"`
	Commit        string         `json:"commit"`
	FinishedAt    gorm.DeletedAt `json:"finish_time"`
}

func (Deploy) TableName() string {
	return "magi_deploy"
}

type CreateDeploy struct {
	AppCode       string `json:"app_code" binding:"required"`
	ImageTag      string `json:"image_tag" binding:"required"`
	ConfigVersion string `json:"config_version"`
	PatchContent  string `json:"patch_content"`
}

type UpdateDeploy struct {
	Status   string `json:"status"`
	Deployer string `json:"deployer"`
}

type DeployInfo struct {
	ID            uint64         `json:"id"`
	Version       string         `json:"version"`
	ImageTag      string         `json:"image_tag"`
	ConfigVersion string         `json:"config_version"`
	Status        uint64         `json:"status"`
	Deployer      string         `json:"deployer"`
	Creator       string         `json:"creator"`
	PatchContent  string         `json:"patch_content"`
	Commit        string         `json:"commit"`
	CreatedAt     time.Time      `json:"create_time"`
	UpdatedAt     time.Time      `json:"update_time"`
	FinishedAt    gorm.DeletedAt `json:"finish_time"`
}
