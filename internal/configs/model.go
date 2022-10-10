package configs

import (
    "github/basefas/magi/internal/global"
    "time"
)

type Config struct {
    global.Model
    Name           string `json:"name" gorm:"NOT NULL;"`
    Code           string `json:"code" gorm:"unique;NOT NULL;"`
    ProjectCode    string `json:"project_code" gorm:"NOT NULL;"`
    LabelCode      string `json:"label_code" gorm:"NOT NULL;"`
    Linked         uint64 `json:"linked" gorm:"type:uint;size:32;NOT NULL;"`
    LinkedAppCode  string `json:"linked_app_code"`
    CurrentVersion string `json:"current_version"`
    Commit         string `json:"commit"`
    Description    string `json:"description"`
}

func (Config) TableName() string {
    return "magi_config"
}

type ConfigHistory struct {
    global.Model
    ConfigCode string `json:"config_code" gorm:"NOT NULL;"`
    Version    string `json:"version" gorm:"NOT NULL;"`
    CreatorID  uint64 `json:"creator_id" gorm:"type:uint;size:32;NOT NULL;"`
    Status     uint64 `json:"status" gorm:"type:uint;size:32;NOT NULL;"`
    Commit     string `json:"commit"`
}

func (ConfigHistory) TableName() string {
    return "magi_config_history"
}

type ConfigFile struct {
    global.Model
    HistoryVersion string `json:"history_version" gorm:"NOT NULL;"`
    Filename       string `json:"filename" gorm:"NOT NULL;"`
    Content        string `json:"content" gorm:"type:text;"`
}

func (ConfigFile) TableName() string {
    return "magi_config_file"
}

type CreateConfig struct {
    Name        string `json:"name" binding:"required"`
    Code        string `json:"code" binding:"required"`
    ProjectCode string `json:"project_code" binding:"required"`
    LabelCode   string `json:"label_code" binding:"required"`
    Description string `json:"description"`
}

type UpdateConfig struct {
    Name        string `json:"name"`
    Description string `json:"description"`
}

type ConfigInfo struct {
    ID             uint64    `json:"id"`
    Name           string    `json:"name"`
    Code           string    `json:"code"`
    Label          string    `json:"label"`
    LabelCode      string    `json:"label_code"`
    Project        string    `json:"project"`
    ProjectCode    string    `json:"project_code"`
    Linked         uint64    `json:"linked"`
    LinkedApp      string    `json:"linked_app"`
    CurrentVersion string    `json:"current_version"`
    Commit         string    `json:"commit"`
    Description    string    `json:"description"`
    CreatedAt      time.Time `json:"create_time"`
    UpdatedAt      time.Time `json:"update_time"`
}

type ConfigHistoryInfo struct {
    ID        uint64    `json:"id"`
    Version   string    `json:"version"`
    Creator   string    `json:"creator"`
    Status    uint64    `json:"status"`
    Commit    string    `json:"commit"`
    CreatedAt time.Time `json:"create_time"`
    UpdatedAt time.Time `json:"update_time"`
}

type ConfigFileInfo struct {
    HistoryVersion string `json:"history_version"`
    Filename       string `json:"filename"`
    Content        string `json:"content"`
}

type EditConfigFile struct {
    Label string                 `json:"label" binding:"required"`
    Files []ConfigFileCreateInfo `json:"files" binding:"required"`
}

type ConfigFileCreateInfo struct {
    Filename string `json:"filename" binding:"required"`
    Content  string `json:"content"`
}

type ConfigHistoryCurrent struct {
    ID        uint64           `json:"id"`
    Version   string           `json:"version"`
    Creator   string           `json:"creator"`
    Status    uint64           `json:"status"`
    Commit    string           `json:"commit"`
    Files     []ConfigFileInfo `json:"files"`
    CreatedAt time.Time        `json:"create_time"`
    UpdatedAt time.Time        `json:"update_time"`
}
