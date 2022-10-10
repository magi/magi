package global

import (
    "gorm.io/gorm"
    "time"
)

const (
    Unknown = iota
    LogInSuccess
    LogInFailed
)

type Model struct {
    ID        uint64 `gorm:"primaryKey;type:uint;size:32;"`
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
    //gorm.Model
}

type OptLog struct {
    Model
    UserID   uint64 `json:"user_id" gorm:"type:uint;size:32;"`
    Url      string `json:"url"`
    Method   string `json:"method"`
    Body     string `json:"body" gorm:"type:text;"`
    ClientIP string `json:"client_ip"`
}

func (OptLog) TableName() string {
    return "magi_opt_log"
}

type AuthLog struct {
    Model
    Username   string `json:"username"`
    ClientIP   string `json:"client_ip"`
    AuthStatus uint64 `json:"auth_status" gorm:"default:0;type:uint;size:32;comment:'0:unknown,1:success,2:failed'"`
}

func (AuthLog) TableName() string {
    return "magi_auth_log"
}
