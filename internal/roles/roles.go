package roles

import (
	"errors"
	"fmt"
	"github/basefas/magi/internal/auth"
	"github/basefas/magi/internal/groups"
	"github/basefas/magi/internal/users"
	"github/basefas/magi/internal/utils"
	"github/basefas/magi/internal/utils/db"
	"gorm.io/gorm"
)

var (
	ErrRoleNotFound = errors.New("role not found ")
	ErrRoleExists   = errors.New("role already exists")
	ErrRoleBound    = errors.New("role hah been bound")
)

func Create(cr CreateRole) error {
	r := Role{}

	if err := db.Mysql.
		Where("name = ?", cr.Name).
		Find(&r).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if r.ID != 0 {
		return ErrRoleExists
	}

	nr := Role{Name: cr.Name}

	err := db.Mysql.Create(&nr).Error
	return err
}

func Get(roleID uint64) (role Role, err error) {
	if err = db.Mysql.Take(&role, roleID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return role, ErrRoleNotFound
		} else {
			return role, err
		}
	}
	return role, err
}

func GetInfo(roleID uint64) (roleInfo RoleInfo, err error) {
	if err = db.Mysql.
		Model(&Role{}).
		Where("id", roleID).
		Scan(&roleInfo).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return roleInfo, ErrRoleNotFound
		} else {
			return roleInfo, err
		}
	}
	return roleInfo, err
}

func Update(roleID uint64, ur UpdateRole) error {
	if _, err := Get(roleID); err != nil {
		return err
	}

	updateRole := make(map[string]interface{})
	if ur.Name != "" {
		updateRole["name"] = ur.Name
	}

	err := db.Mysql.
		Model(&Role{}).
		Where("id = ?", roleID).
		Updates(updateRole).Error
	return err
}

func Delete(roleID uint64) error {
	if _, err := Get(roleID); err != nil {
		return err
	}

	ur := make([]users.UserRole, 0)

	if err := db.Mysql.
		Model(&users.UserRole{}).
		Where("role_id = ?", roleID).
		Find(&ur).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if len(ur) > 0 {
		return ErrRoleBound
	}

	gr := make([]groups.GroupRole, 0)

	if err := db.Mysql.
		Model(&groups.GroupRole{}).
		Where("role_id = ?", roleID).
		Find(&gr).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if len(gr) > 0 {
		return ErrRoleBound
	}

	if err := db.Mysql.Delete(&Role{}, roleID).Error; err != nil {
		return err
	}
	if _, err := auth.Casbin.RemoveFilteredGroupingPolicy(0, fmt.Sprintf("role::%d", roleID)); err != nil {
		return err
	}

	return nil
}

func List() (roles []RoleInfo, err error) {
	roles = make([]RoleInfo, 0)
	err = db.Mysql.
		Model(&Role{}).
		Find(&roles).Error
	return roles, err
}

func GetRoleMenus(roleID uint64) (roleMenu []RoleMenu, err error) {
	roleMenu = make([]RoleMenu, 0)
	err = db.Mysql.
		Model(&RoleMenu{}).
		Where("role_id = ?", roleID).
		Find(&roleMenu).Error
	return roleMenu, err
}

func UpdateRoleMenu(roleID uint64, new []uint64) error {
	rm, err := GetRoleMenus(roleID)
	if err != nil {
		return err
	}
	old := make([]uint64, 0)
	for _, menu := range rm {
		old = append(old, menu.MenuID)
	}

	delRoleMenu := utils.Difference(old, new)
	addRoleMenu := utils.Difference(new, old)
	for _, mid := range delRoleMenu {
		db.Mysql.
			Where("role_id = ?", roleID).
			Where("menu_id = ?", mid).
			Delete(&RoleMenu{})
		if _, casbinErr := auth.Casbin.RemoveGroupingPolicy(fmt.Sprintf("role::%d", roleID), fmt.Sprintf("action::%d", mid)); casbinErr != nil {
			return casbinErr
		}
	}

	for _, mid := range addRoleMenu {
		nrm := RoleMenu{RoleID: roleID, MenuID: mid}
		db.Mysql.Create(&nrm)
		if _, casbinErr := auth.Casbin.AddGroupingPolicy(fmt.Sprintf("role::%d", roleID), fmt.Sprintf("action::%d", mid)); casbinErr != nil {
			return casbinErr
		}
	}
	return err
}
