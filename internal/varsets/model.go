package varsets

import (
    "github/basefas/magi/internal/global"
    "time"
)

type VarSet struct {
    global.Model
    Name        string `json:"name" gorm:"NOT NULL;"`
    Code        string `json:"code" gorm:"unique;NOT NULL;"`
    LabelCode   string `json:"label_code" gorm:"NOT NULL;"`
    Description string `json:"description"`
    Commit      string `json:"commit"`
    EditorID    uint64 `json:"editor_id" gorm:"type:uint;size:32;NOT NULL"`
}

func (VarSet) TableName() string {
    return "magi_var_set"
}

type Var struct {
    global.Model
    VarSetCode string `json:"var_set_code" gorm:"NOT NULL;"`
    VKey       string `json:"v_key" gorm:"NOT NULL;"`
    VValue     string `json:"v_value" gorm:"NOT NULL;"`
    Commit     string `json:"commit"`
    EditorID   uint64 `json:"editor_id" gorm:"type:uint;size:32;NOT NULL"`
}

func (Var) TableName() string {
    return "magi_var"
}

type CreateVarSet struct {
    Name        string `json:"name" binding:"required"`
    Code        string `json:"code" binding:"required"`
    LabelCode   string `json:"label_code" binding:"required"`
    Description string `json:"description"`
}

type UpdateVarSet struct {
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Add         []VarInfo `json:"add"`
    Update      []VarInfo `json:"update"`
    Delete      []VarInfo `json:"delete"`
}

type VarSetItem struct {
    ID          uint64    `json:"id"`
    Name        string    `json:"name"`
    Code        string    `json:"code"`
    Label       string    `json:"label"`
    Description string    `json:"description"`
    Commit      string    `json:"commit"`
    Editor      string    `json:"editor"`
    CreatedAt   time.Time `json:"create_time"`
    UpdatedAt   time.Time `json:"update_time"`
}

type VarSetInfo struct {
    ID          uint64    `json:"id"`
    Name        string    `json:"name"`
    Code        string    `json:"code"`
    Label       string    `json:"label"`
    Description string    `json:"description"`
    Commit      string    `json:"commit"`
    Editor      string    `json:"editor"`
    Vars        []VarInfo `json:"vars"`
    CreatedAt   time.Time `json:"create_time"`
    UpdatedAt   time.Time `json:"update_time"`
}

type VarInfo struct {
    ID        uint64    `json:"id"`
    VKey      string    `json:"v_key"`
    VValue    string    `json:"v_value"`
    Commit    string    `json:"commit"`
    Editor    string    `json:"editor"`
    UpdatedAt time.Time `json:"update_time"`
}
