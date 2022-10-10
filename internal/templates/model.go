package templates

import (
	"github/basefas/magi/internal/global"
	"time"
)

type Template struct {
	global.Model
	Name      string `json:"name" gorm:"NOT NULL;"`
	CreatorID uint64 `json:"creator_id" gorm:"type:uint;size:32;NOT NULL;"`
	UpdaterID uint64 `json:"updater_id" gorm:"type:uint;size:32;"`
}

func (Template) TableName() string {
	return "magi_template"
}

type TemplateManifest struct {
	global.Model
	TemplateID uint64 `json:"template_id" gorm:"NOT NULL;type:uint;size:32;"`
	Filename   string `json:"filename" gorm:"NOT NULL;"`
	Content    string `json:"content" gorm:"type:text;"`
}

func (TemplateManifest) TableName() string {
	return "magi_template_manifest"
}

type CreateTemplate struct {
	Name string `json:"name" binding:"required"`
}

type TemplateInfo struct {
	ID        uint64    `json:"id"`
	Name      string    `json:"name"`
	Creator   string    `json:"creator"`
	CreatedAt time.Time `json:"create_time"`
	UpdatedAt time.Time `json:"update_time"`
}

type EditTemplateFile struct {
	Add    []TemplateFile `json:"add"`
	Delete []TemplateFile `json:"delete"`
	Update []TemplateFile `json:"update"`
}

type TemplateFile struct {
	Filename string `json:"filename" binding:"required"`
	Content  string `json:"content"`
}
