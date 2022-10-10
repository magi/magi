package labels

import (
    "github/basefas/magi/internal/global"
    "time"
)

type Label struct {
    global.Model
    Name string `json:"name" gorm:"NOT NULL;"`
    Code string `json:"code" gorm:"unique;NOT NULL;"`
}

func (Label) TableName() string {
    return "magi_label"
}

type CreateLabel struct {
    Name string `json:"name" binding:"required"`
    Code string `json:"code" binding:"required"`
}

type UpdateLabel struct {
    Name string `json:"name"`
}

type LabelInfo struct {
    ID        uint64    `json:"id"`
    Name      string    `json:"name"`
    Code      string    `json:"code"`
    CreatedAt time.Time `json:"create_time"`
    UpdatedAt time.Time `json:"update_time"`
}
