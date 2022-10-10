package projects

import (
    "github/basefas/magi/internal/global"
    "time"
)

type Project struct {
    global.Model
    Name        string `json:"name" gorm:"NOT NULL;"`
    Code        string `json:"code" gorm:"unique;NOT NULL;"`
    TemplateID  uint64 `json:"template_id" gorm:"type:uint;size:32"`
    Commit      string `json:"commit" gorm:"NOT NULL;"`
    Description string `json:"description"`
}

func (Project) TableName() string {
    return "magi_project"
}

type CreateProject struct {
    Name        string `json:"name" binding:"required"`
    Code        string `json:"code" binding:"required"`
    TemplateID  uint64 `json:"template_id" binding:"required"`
    Description string `json:"description"`
}

type UpdateProject struct {
    Name        string `json:"name"`
    Description string `json:"description"`
}

type ProjectInfo struct {
    ID          uint64    `json:"id"`
    Name        string    `json:"name"`
    Code        string    `json:"code"`
    Commit      string    `json:"commit"`
    Template    string    `json:"template"`
    Description string    `json:"description"`
    CreatedAt   time.Time `json:"create_time"`
    UpdatedAt   time.Time `json:"update_time"`
}

type ProjectConfigInfo struct {
    ID        uint64    `json:"id"`
    Name      string    `json:"name"`
    Code      string    `json:"code"`
    CreatedAt time.Time `json:"create_time"`
    UpdatedAt time.Time `json:"update_time"`
}
