package configs

import (
	"errors"
	"github/basefas/magi/internal/utils"
	"github/basefas/magi/internal/utils/db"
	"gorm.io/gorm"
)

var (
	ErrConfigExists = errors.New("config already exists")
)

func Create(cc CreateConfig) error {
	config := Config{}

	if err := db.Mysql.
		Where("code = ?", cc.Code).
		Find(&config).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if config.ID != 0 {
		return ErrConfigExists
	}

	nc := Config{
		Name:          cc.ProjectCode,
		Code:          cc.Code,
		ProjectCode:   cc.ProjectCode,
		LabelCode:     cc.LabelCode,
		Description:   cc.Description,
		Linked:        2,
		LinkedAppCode: "",
	}

	if err := db.Mysql.Create(&nc).Error; err != nil {
		return err
	}

	return nil
}

func GetInfo(code string) (ci ConfigInfo, err error) {
	q := db.Mysql.
		Table("magi_config AS c").
		Select("c.id, c.name, c.code, c.description, c.label_code, c.project_code, c.linked, c.current_version,"+
			" c.commit, c.created_at, c.updated_at, p.name AS project, l.name AS label, a.name AS linked_app").
		Joins("LEFT JOIN magi_project AS p ON p.code = c.project_code").
		Joins("LEFT JOIN magi_label AS l ON l.code = c.label_code").
		Joins("LEFT JOIN magi_app AS a ON a.code = c.linked_app_code").
		Where("c.deleted_at IS NULL").
		Where("p.deleted_at IS NULL").
		Where("l.deleted_at IS NULL").
		Where("a.deleted_at IS NULL").
		Where("c.code = ?", code).
		Order("c.id")
	err = q.Find(&ci).Error
	return ci, err
}

func Update(code string, uc UpdateConfig) error {
	updateConfig := make(map[string]interface{})

	if uc.Name != "" {
		updateConfig["name"] = uc.Name
	}

	if uc.Description != "" {
		updateConfig["description"] = uc.Description
	}

	if err := db.Mysql.
		Model(&Config{}).
		Where("code = ?", code).
		Updates(updateConfig).Error; err != nil {
		return err
	}

	return nil
}

func Delete(code string) error {
	err := db.Mysql.
		Where("code = ?", code).
		Delete(&Config{}).Error

	return err
}

func List(label string, linked string) ([]ConfigInfo, error) {
	return ListBy(label, linked, "")
}

func ListBy(label string, linked string, projectCode string) (configs []ConfigInfo, err error) {
	configs = make([]ConfigInfo, 0)
	q := db.Mysql.
		Table("magi_config AS c").
		Select("c.id, c.name, c.code, c.description, c.label_code, c.project_code, c.linked, c.current_version," +
			" c.commit, c.created_at, c.updated_at, p.name AS project, l.name AS label, a.name AS linked_app").
		Joins("LEFT JOIN magi_project AS p ON p.code = c.project_code").
		Joins("LEFT JOIN magi_label AS l ON l.code = c.label_code").
		Joins("LEFT JOIN magi_app AS a ON a.code = c.linked_app_code").
		Where("c.deleted_at IS NULL").
		Where("p.deleted_at IS NULL").
		Where("l.deleted_at IS NULL").
		Where("a.deleted_at IS NULL").
		Order("c.id")

	if !(label == "" || label == "all") {
		q = q.Where("c.label_code = ?", label)
	}
	if linked == "false" {
		q = q.Where("c.linked = ?", 2)
	}
	if projectCode != "" {
		q = q.Where("c.project_code = ?", projectCode)
	}
	err = q.Find(&configs).Error
	return configs, err
}

func HistoryList(code string) (histories []ConfigHistoryInfo, err error) {
	histories = make([]ConfigHistoryInfo, 0)
	q := db.Mysql.
		Table("magi_config_history AS h").
		Select("h.id, h.version, h.status, h.commit, h.created_at, h.updated_at, u.full_name AS creator").
		Joins("LEFT JOIN magi_user u on h.creator_id = u.id").
		Where("h.deleted_at IS NULL").
		Where("u.deleted_at IS NULL").
		Where("h.config_code = ?", code).
		Order("h.version DESC")

	err = q.Find(&histories).Error
	return histories, err
}

func FileList(version string) (files []ConfigFileInfo, err error) {
	files = make([]ConfigFileInfo, 0)
	q := db.Mysql.
		Table("magi_config_file AS f").
		Select("f.id, f.history_version, f.filename, f.content, f.created_at, f.updated_at").
		Where("f.deleted_at IS NULL").
		Where("f.history_version = ?", version).
		Order("f.id")

	err = q.Find(&files).Error
	return files, err
}

func EditFiles(code string, uid uint64, config EditConfigFile) error {
	err := db.Mysql.Transaction(func(tx *gorm.DB) error {
		version := "c-" + config.Label + utils.GetNowString()

		c := ConfigHistory{
			ConfigCode: code,
			Version:    version,
			CreatorID:  uid,
			Status:     2,
		}
		if err := tx.Create(&c).Error; err != nil {
			return err
		}
		var files []ConfigFile
		for _, file := range config.Files {
			files = append(files, ConfigFile{
				HistoryVersion: version,
				Filename:       file.Filename,
				Content:        file.Content,
			})
		}

		if err := tx.Create(&files).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func CurrentConfig() (config ConfigHistoryCurrent, err error) {
	var history ConfigHistoryInfo
	q := db.Mysql.
		Table("magi_config_history AS h").
		Select("h.id, h.version, h.status, h.commit, h.created_at, h.updated_at, u.full_name AS creator").
		Joins("LEFT JOIN magi_user u on h.creator_id = u.id").
		Where("h.deleted_at IS NULL").
		Where("u.deleted_at IS NULL").
		Where("h.status = ?", 1)

	err = q.Find(&history).Error
	if err != nil {
		return config, err
	}

	files, err := FileList(history.Version)
	if err != nil {
		return config, err
	}

	config = ConfigHistoryCurrent{
		ID:        history.ID,
		Version:   history.Version,
		Creator:   history.Creator,
		Status:    history.Status,
		Commit:    history.Commit,
		Files:     files,
		CreatedAt: history.CreatedAt,
		UpdatedAt: history.UpdatedAt,
	}
	return config, err
}
