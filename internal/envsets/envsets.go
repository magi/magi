package envsets

import (
	"errors"
	"github/basefas/magi/internal/envs"
	"github/basefas/magi/internal/utils"
	"github/basefas/magi/internal/utils/db"
	"gorm.io/gorm"
)

var (
	ErrEnvSetNotFound = errors.New("env set not found")
	ErrEnvSetExists   = errors.New("env set already exists")
)

func Create(ce CreateEnvSet) error {
	e := EnvSet{}

	if err := db.Mysql.
		Where("code = ?", ce.Code).
		Find(&e).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if e.ID != 0 {
		return ErrEnvSetExists
	}

	err := db.Mysql.Transaction(func(tx *gorm.DB) error {
		nes := EnvSet{Name: ce.Name, Code: ce.Code, LabelCode: ce.LabelCode, Type: ce.Type}
		if err := tx.Create(&nes).Error; err != nil {
			return err
		}

		ese := make([]EnvSetEnv, 0)
		for _, env := range ce.Envs {
			ese = append(ese, EnvSetEnv{EnvCode: env, EnvSetCode: ce.Code})
		}

		if err := tx.Create(&ese).Error; err != nil {
			return err
		}
		return nil
	})

	return err
}

func GetInfo(code string) (envSetInfo EnvSetInfo, err error) {
	var es EnvSetInfoWithoutEnv

	q := db.Mysql.
		Table("magi_env_set AS es").
		Select("es.id, es.name, es.code, es.type, es.created_at, es.updated_at, l.name AS label").
		Joins("LEFT JOIN magi_label AS l ON l.code = es.label_code").
		Where("es.deleted_at IS NULL").
		Where("l.deleted_at IS NULL").
		Where("es.code = ?", code).
		Order("es.id")

	err = q.Find(&es).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return envSetInfo, ErrEnvSetNotFound
	} else if err != nil {
		return envSetInfo, err
	}

	envInfos := make([]EnvInfo, 0)

	q2 := db.Mysql.
		Table("magi_env AS e").
		Select("e.id, e.name, e.code, e.type, e.namespace, e.label_code, e.cluster_code, e.created_at, e.updated_at,"+
			"c.name AS cluster, l.name AS label, ese.env_set_code AS env_set_code").
		Joins("LEFT JOIN magi_cluster AS c ON e.cluster_code = c.code").
		Joins("LEFT JOIN magi_label AS l ON e.label_code = l.code").
		Joins("LEFT JOIN magi_env_set_env AS ese ON ese.env_code = e.code").
		Where("e.deleted_at IS NULL").
		Where("c.deleted_at IS NULL").
		Where("l.deleted_at IS NULL").
		Where("ese.deleted_at IS NULL").
		Where("ese.env_set_code = ?", code).
		Order("e.id")

	err = q2.Find(&envInfos).Error
	if err != nil {
		return envSetInfo, err
	}

	eis := make([]envs.EnvInfo, 0)
	for _, env := range envInfos {
		eis = append(eis, envs.EnvInfo{
			ID:          env.ID,
			Name:        env.Name,
			Code:        env.Code,
			Type:        env.Type,
			Cluster:     env.Cluster,
			Label:       env.Label,
			ClusterCode: env.ClusterCode,
			LabelCode:   env.LabelCode,
			Namespace:   env.Namespace,
			CreatedAt:   env.CreatedAt,
			UpdatedAt:   env.UpdatedAt,
		})

	}
	envSetInfo = EnvSetInfo{
		ID:        es.ID,
		Name:      es.Name,
		Code:      es.Code,
		Envs:      eis,
		Type:      es.Type,
		Label:     es.Label,
		CreatedAt: es.CreatedAt,
		UpdatedAt: es.UpdatedAt,
	}

	return envSetInfo, err
}

func Update(code string, ue UpdateEnvSet) error {
	old := make([]string, 0)

	err := db.Mysql.
		Model(&EnvSetEnv{}).
		Select("env_code").
		Where("env_set_code = ?", code).
		Scan(&old).Error

	if err != nil {
		return err
	}
	update := ue.Envs
	delEnv := utils.Difference(old, update)
	addEnv := utils.Difference(update, old)

	updateEnvSet := make(map[string]interface{})

	if ue.Name != "" {
		updateEnvSet["name"] = ue.Name
	}

	err = db.Mysql.Transaction(func(tx *gorm.DB) error {
		if err = tx.Model(&EnvSet{}).
			Where("code = ?", code).
			Updates(updateEnvSet).Error; err != nil {
			return err
		}

		if len(addEnv) != 0 {
			ese := make([]EnvSetEnv, 0)
			for _, env := range addEnv {
				ese = append(ese, EnvSetEnv{EnvCode: env, EnvSetCode: code})
			}

			if err = tx.Create(&ese).Error; err != nil {
				return err
			}
		}

		if len(delEnv) != 0 {
			if err = tx.Where("env_set_code = ?", code).
				Where("env_code IN ?", delEnv).
				Delete(&EnvSetEnv{}).Error; err != nil {
				return err
			}
		}
		return nil
	})

	return err
}

func Delete(code string) error {
	err := db.Mysql.
		Where("code = ?", code).
		Delete(&EnvSet{}).Error

	return err
}

func ListByLabel(label string) (esi []EnvSetInfo, err error) {
	envInfos := make([]EnvInfo, 0)
	ess := make([]EnvSetInfoWithoutEnv, 0)
	esi = make([]EnvSetInfo, 0)

	q := db.Mysql.
		Table("magi_env_set AS es").
		Select("es.id, es.name, es.code, es.type, es.created_at, es.updated_at, l.name AS label").
		Joins("LEFT JOIN magi_label AS l ON l.code = es.label_code").
		Where("es.deleted_at IS NULL").
		Where("l.deleted_at IS NULL").
		Order("es.id")

	if label != "" {
		q = q.Where("l.code = ?", label)
	}

	err = q.Find(&ess).Error
	if err != nil {
		return esi, err
	}

	q2 := db.Mysql.
		Table("magi_env AS e").
		Select("e.id, e.name, e.code, e.type, e.namespace, e.label_code, e.cluster_code, e.created_at, e.updated_at," +
			"c.name AS cluster, l.name AS label, ese.env_set_code AS env_set_code").
		Joins("LEFT JOIN magi_cluster AS c ON e.cluster_code = c.code").
		Joins("LEFT JOIN magi_label AS l ON e.label_code = l.code").
		Joins("LEFT JOIN magi_env_set_env AS ese ON ese.env_code = e.code").
		Where("e.deleted_at IS NULL").
		Where("c.deleted_at IS NULL").
		Where("l.deleted_at IS NULL").
		Where("ese.deleted_at IS NULL").
		Order("e.id")

	err = q2.Find(&envInfos).Error
	if err != nil {
		return esi, err
	}

	for _, es := range ess {
		eis := make([]envs.EnvInfo, 0)
		for _, env := range envInfos {
			if env.EnvSetCode == es.Code {
				eis = append(eis, envs.EnvInfo{
					ID:          env.ID,
					Name:        env.Name,
					Code:        env.Code,
					Type:        env.Type,
					Cluster:     env.Cluster,
					Label:       env.Label,
					ClusterCode: env.ClusterCode,
					LabelCode:   env.LabelCode,
					Namespace:   env.Namespace,
					CreatedAt:   env.CreatedAt,
					UpdatedAt:   env.UpdatedAt,
				})
			}
		}
		esi = append(esi, EnvSetInfo{
			ID:        es.ID,
			Name:      es.Name,
			Code:      es.Code,
			Label:     es.Label,
			Type:      es.Type,
			Envs:      eis,
			CreatedAt: es.CreatedAt,
			UpdatedAt: es.UpdatedAt,
		})
	}
	return esi, nil
}
