package users

import (
	"errors"
	"fmt"
	"github/basefas/magi/internal/auth"
	"github/basefas/magi/internal/utils/db"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrUserNotFound                = errors.New("user not found")
	ErrUserExists                  = errors.New("user already exist")
	ErrIncorrectUsernameOrPassword = errors.New("incorrect username or password")
	ErrUsernameOrPasswordNil       = errors.New("username or password can not be null")
	ErrGenerateTokenFailed         = errors.New("generate token failed")
)

func Create(cu CreateUser) error {
	u := User{}

	if err := db.Mysql.
		Where("username = ?", cu.Username).
		Find(&u).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
	}

	if u.ID != 0 {
		return ErrUserExists
	}

	hash, pwErr := bcrypt.GenerateFromPassword([]byte(cu.Password), bcrypt.DefaultCost)
	if pwErr != nil {
		return pwErr
	}

	nu := User{Username: cu.Username, Password: string(hash), FullName: cu.FullName, Email: cu.Email, Status: 1}

	err := db.Mysql.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&nu).Error; err != nil {
			return err
		}

		ug := UserGroup{UserID: nu.ID, GroupID: cu.GroupID}
		ur := UserRole{UserID: nu.ID, RoleID: cu.RoleID}
		if err := tx.Create(&ug).Error; err != nil {
			return err
		}
		if err := tx.Create(&ur).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	if _, casbinErr := auth.Casbin.AddGroupingPolicy(fmt.Sprintf("user::%d", u.ID), fmt.Sprintf("role::%d", cu.RoleID)); casbinErr != nil {
		return casbinErr
	}

	return nil
}

func Get(uid uint64) (user User, err error) {
	if err = db.Mysql.Take(&user, uid).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return user, ErrUserNotFound
		} else {
			return user, err
		}
	}
	return user, nil
}

func GetInfo(uid uint64) (userInfo UserInfo, err error) {
	if err = db.Mysql.
		Model(&User{}).
		Where("id = ?", uid).
		Take(&userInfo).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return userInfo, ErrUserNotFound
		} else {
			return userInfo, err
		}
	}
	return userInfo, err
}

func Update(uid uint64, uu UpdateUser) error {
	ur := UserRole{}
	if err := db.Mysql.
		Where("user_id = ?", uid).
		Take(&ur).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrUserNotFound
		} else {
			return err
		}
	}

	updateUser := make(map[string]interface{})
	if uu.Username != "" {
		updateUser["username"] = uu.Username
	}
	if uu.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(uu.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		updateUser["password"] = string(hash)
	}
	if uu.FullName != "" {
		updateUser["full_name"] = uu.FullName
	}
	if uu.Email != "" {
		updateUser["email"] = uu.Email
	}
	if uu.Status != 0 {
		updateUser["status"] = uu.Status
	}

	err := db.Mysql.Transaction(func(tx *gorm.DB) error {
		if err := tx.
			Model(&User{}).
			Where("id = ?", uid).
			Updates(&updateUser).Error; err != nil {
			return err
		}

		if uu.GroupID != 0 {
			ug := UserGroup{GroupID: uu.GroupID}
			if err := tx.
				Model(&UserGroup{}).
				Where("id = ?", uid).
				Updates(&ug).Error; err != nil {
				return err
			}
		}
		if uu.RoleID != 0 {
			ur := UserRole{RoleID: uu.RoleID}
			if err := tx.
				Model(&UserRole{}).
				Where("id = ?", uid).
				Updates(&ur).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return err
	}

	if uu.RoleID != 0 {
		if _, casbinErr := auth.Casbin.RemoveGroupingPolicy(fmt.Sprintf("user::%d", uid), fmt.Sprintf("role::%d", ur.RoleID)); casbinErr != nil {
			return casbinErr
		}

		if _, casbinErr := auth.Casbin.AddGroupingPolicy(fmt.Sprintf("user::%d", uid), fmt.Sprintf("role::%d", uu.RoleID)); casbinErr != nil {
			return casbinErr
		}
	}

	return nil
}

func Delete(uid uint64) error {
	if _, err := Get(uid); err != nil {
		return err
	}

	u := User{Status: 2}

	err := db.Mysql.Transaction(func(tx *gorm.DB) error {
		if err := tx.
			Where("id = ?", uid).
			Delete(&u).Error; err != nil {
			return err
		}

		if err := tx.
			Where("id = ?", uid).
			Delete(&UserGroup{}).Error; err != nil {
			return err
		}

		if err := tx.
			Where("id = ?", uid).
			Delete(&UserRole{}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	if _, casbinErr := auth.Casbin.RemoveFilteredGroupingPolicy(0, fmt.Sprintf("user::%d", uid)); casbinErr != nil {
		return casbinErr
	}

	return nil
}

func List() (users []UserInfo, err error) {
	users = make([]UserInfo, 0)
	q := db.Mysql.
		Table("magi_user AS u").
		Select("u.id, u.username, u.full_name, u.email, u.status, u.created_at, u.updated_at," +
			" g.id AS group_id, g.name AS group_name, r.id AS role_id, r.name AS role_name").
		Joins("LEFT JOIN magi_user_group AS ug ON ug.user_id = u.id").
		Joins("LEFT JOIN magi_group AS g ON g.id = ug.group_id").
		Joins("LEFT JOIN magi_user_role AS ur ON ur.user_id = u.id").
		Joins("LEFT JOIN magi_role AS r ON r.id = ur.role_id").
		Where("u.deleted_at IS NULL").
		Where("ug.deleted_at IS NULL").
		Where("g.deleted_at IS NULL").
		Where("ur.deleted_at IS NULL").
		Where("r.deleted_at IS NULL").
		Order("u.id")

	err = q.Find(&users).Error
	return users, err
}

func Token(l Login) (li LoginInfo, err error) {
	if len(l.Username) <= 0 || len(l.Password) <= 0 {
		return li, ErrUsernameOrPasswordNil
	}

	var u User
	if err = db.Mysql.
		Where("username = ? ", l.Username).
		Find(&u).Error; err != nil {
		return li, ErrIncorrectUsernameOrPassword
	}

	if err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(l.Password)); err != nil {
		return li, ErrIncorrectUsernameOrPassword
	}

	if u.Status != 1 {
		return li, ErrIncorrectUsernameOrPassword
	}

	token, tokenErr := auth.GenerateToken(u.ID)

	if tokenErr != nil {
		return li, ErrGenerateTokenFailed
	}
	li.Username = l.Username
	li.FullName = u.FullName
	li.ID = u.ID
	li.Token = token
	return li, err
}

func ResetPassword(uid uint64, password string) error {
	hash, pwErr := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if pwErr != nil {
		return pwErr
	}

	err := db.Mysql.
		Model(&User{}).
		Where("id = ?", uid).
		Update("password", string(hash)).Error
	return err
}
