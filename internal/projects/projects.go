package projects

import (
	"errors"
	"github/basefas/magi/internal/configs"
	"github/basefas/magi/internal/templates"
	"github/basefas/magi/internal/utils/db"
	"github/basefas/magi/internal/utils/git"
	"github/basefas/magi/internal/utils/magiyaml"
	"gorm.io/gorm"
)

var (
	ErrProjectNotFound = errors.New("project not found")
	ErrProjectExists   = errors.New("project already exists")
)

func Create(cp CreateProject) error {
	p := Project{}

	if err := db.Mysql.
		Where("code = ?", cp.Code).
		Find(&p).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if p.ID != 0 {
		return ErrProjectExists
	}

	t, err := templates.GetInfo(cp.TemplateID)
	if err != nil {
		return err
	}
	tf, err := templates.FileList(t.ID)
	if err != nil {
		return err
	}

	var cfs []git.CommitFile
	var files []string
	for _, file := range tf {
		m := map[string]interface{}{}
		m["Magi"] = magiyaml.Magi{ProjectName: cp.Code}
		nf, err := magiyaml.Make(file.Content, m)
		if err != nil {
			return err
		}
		filePath := magiyaml.ProjectPath + "/" + cp.Code + "/" + file.Filename
		files = append(files, file.Filename)
		cfs = append(cfs, git.CommitFile{Path: &filePath, Content: &nf})
	}
	kustomization, err := magiyaml.MakeProjectKustomization(files)
	if err != nil {
		return err
	}
	kFilePath := magiyaml.ProjectPath + "/" + cp.Code + "/kustomization.yaml"
	cfs = append(cfs, git.CommitFile{Path: &kFilePath, Content: &kustomization})
	commit, err := git.Commit(cfs)
	if err != nil {
		return err
	}
	shortSha := commit.Get().Sha[0:7]
	np := Project{
		Name:        cp.Name,
		Code:        cp.Code,
		Commit:      shortSha,
		Description: cp.Description,
	}

	if err = db.Mysql.Create(&np).Error; err != nil {
		return err
	}

	return nil
}

func GetInfo(code string) (pi ProjectInfo, err error) {
	if err = db.Mysql.
		Model(&Project{}).
		Where("code", code).
		Take(&pi).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return pi, ErrProjectNotFound
		} else {
			return pi, err
		}
	}
	return pi, nil
}

func Update(code string, up UpdateProject) error {
	updateProject := make(map[string]interface{})

	if up.Name != "" {
		updateProject["name"] = up.Name
	}

	if up.Description != "" {
		updateProject["description"] = up.Description
	}

	if err := db.Mysql.
		Model(&Project{}).
		Where("code = ?", code).
		Updates(updateProject).Error; err != nil {
		return err
	}

	return nil
}

func Delete(code string) error {
	err := db.Mysql.
		Where("code = ?", code).
		Delete(&Project{}).Error
	return err
}

func List() (projects []ProjectInfo, err error) {
	projects = make([]ProjectInfo, 0)

	q := db.Mysql.
		Table("magi_project AS p").
		Select("p.id, p.name, p.code, p.created_at, p.updated_at, p.description, p.commit, t.name AS template").
		Joins("LEFT JOIN magi_template AS t ON p.template_id = t.id").
		Where("p.deleted_at IS NULL").
		Where("t.deleted_at IS NULL").
		Order("p.id")

	err = q.Find(&projects).Error
	return projects, err
}

func ConfigListByLabel(code string, label string, linked string) ([]configs.ConfigInfo, error) {
	return configs.ListBy(label, linked, code)
}
