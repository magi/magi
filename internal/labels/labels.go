package labels

import (
	"errors"
	"github/basefas/magi/internal/utils/db"
	"gorm.io/gorm"
)

var (
	ErrLabelNotFound = errors.New("label not found ")
	ErrLabelExists   = errors.New("label already exists")
)

func Create(ce CreateLabel) error {
	e := Label{}

	if err := db.Mysql.
		Where("code = ?", ce.Code).
		Find(&e).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if e.ID != 0 {
		return ErrLabelExists
	}
	ne := Label{
		Name: ce.Name,
		Code: ce.Code,
	}

	if err := db.Mysql.Create(&ne).Error; err != nil {
		return err
	}

	return nil
}

func GetInfo(code string) (ei LabelInfo, err error) {
	if err = db.Mysql.
		Model(&Label{}).
		Where("code", code).
		Take(&ei).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ei, ErrLabelNotFound
		} else {
			return ei, err
		}
	}
	return ei, err
}

func Update(code string, ue UpdateLabel) error {
	updateLabel := make(map[string]interface{})

	if ue.Name != "" {
		updateLabel["name"] = ue.Name
	}

	if err := db.Mysql.
		Model(&Label{}).
		Where("code = ?", code).
		Updates(updateLabel).Error; err != nil {
		return err
	}

	return nil
}

func Delete(code string) error {
	err := db.Mysql.
		Where("code = ?", code).
		Delete(&Label{}).Error

	return err
}

func List() (labels []LabelInfo, err error) {
	labels = make([]LabelInfo, 0)

	q := db.Mysql.
		Table("magi_label AS l").
		Select("l.id, l.name, l.code, l.created_at, l.updated_at").
		Where("l.deleted_at IS NULL").
		Order("l.id")

	err = q.Find(&labels).Error
	return labels, err
}
