package menus

import (
    "errors"
    "fmt"
    "github/basefas/magi/internal/auth"
    "github/basefas/magi/internal/roles"
    "github/basefas/magi/internal/utils/db"
    "gorm.io/gorm"
)

var (
    ErrMenuNotFound = errors.New("menu not found")
    ErrMenuExists   = errors.New("menu already exists")
    ErrMenuBound    = errors.New("menu had been bound")
)

func Create(cm CreateMenu) error {
    var m Menu
    if err := db.Mysql.
        Where("locale = ?", cm.Locale).
        Where("path = ?", cm.Path).
        Where("method = ?", cm.Method).
        Find(&m).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }

    if m.ID != 0 {
        return ErrMenuExists
    }

    nm := Menu{
        Locale:   cm.Locale,
        Path:     cm.Path,
        Type:     cm.Type,
        Method:   cm.Method,
        Icon:     cm.Icon,
        ParentID: cm.ParentID,
        OrderID:  cm.OrderID}

    if err := db.Mysql.Create(&nm).Error; err != nil {
        return err
    }

    if cm.Type == 2 || cm.Type == 3 {
        if _, casbinErr := auth.Casbin.AddPolicy(fmt.Sprintf("action::%d", nm.ID), nm.Path, nm.Method); casbinErr != nil {
            return casbinErr
        }
    }

    return nil
}

func Get(menuID uint64) (menu Menu, err error) {
    if err = db.Mysql.Take(&menu, menuID).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return menu, ErrMenuNotFound
        } else {
            return menu, err
        }
    }
    return menu, err
}

func GetInfo(menuID uint64) (menuInfo MenuInfo, err error) {
    if err = db.Mysql.
        Model(&Menu{}).
        Where("id", menuID).
        Take(&menuInfo).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return menuInfo, ErrMenuNotFound
        } else {
            return menuInfo, err
        }
    }
    return menuInfo, err
}

func GetTree(menuID uint64) (menuInfo MenuInfo, err error) {
    menuInfo, err = GetInfo(menuID)
    if err != nil {
        return menuInfo, err
    }
    funs := make([]MenuInfo, 0)
    funs, err = FunListForPid(menuID)
    if err != nil {
        return menuInfo, err
    }
    menuInfo.Funs = funs
    return menuInfo, err
}

func Update(menuID uint64, um UpdateMenu) error {
    oldMenu, err := Get(menuID)
    if err != nil {
        return err
    }

    updateMenu := make(map[string]interface{})
    if um.Locale != "" {
        updateMenu["locale"] = um.Locale
    }
    if um.Path != "" {
        updateMenu["path"] = um.Path
    }
    if um.Type != 0 {
        updateMenu["type"] = um.Type
    }
    if um.Method != "" {
        updateMenu["method"] = um.Method
    }
    if um.Icon != "" {
        updateMenu["icon"] = um.Icon
    }
    if um.OrderID != 999999 {
        updateMenu["order_id"] = um.OrderID
    }
    updateMenu["parent_id"] = um.ParentID

    if dbErr := db.Mysql.
        Model(&Menu{}).
        Where("id = ?", menuID).
        Updates(updateMenu).Error; dbErr != nil {
        return dbErr
    }

    newMenu, err := Get(menuID)
    if err != nil {
        return err
    }

    if oldMenu.Type == 2 || oldMenu.Type == 3 {
        if _, casbinErr := auth.Casbin.RemovePolicy(fmt.Sprintf("action::%d", oldMenu.ID), oldMenu.Path, oldMenu.Method); casbinErr != nil {
            return casbinErr
        }
    }

    if newMenu.Type == 2 || newMenu.Type == 3 {
        if _, casbinErr := auth.Casbin.AddPolicy(fmt.Sprintf("action::%d", newMenu.ID), newMenu.Path, newMenu.Method); casbinErr != nil {
            return casbinErr
        }
    }

    return nil
}

func Delete(menuID uint64) error {
    if _, err := Get(menuID); err != nil {
        return err
    }

    rm := make([]roles.RoleMenu, 0)

    if err := db.Mysql.
        Model(&roles.RoleMenu{}).
        Where("menu_id = ?", menuID).
        Find(&rm).Error; err != nil {
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }
    }

    if len(rm) > 0 {
        return ErrMenuBound
    }

    if err := db.Mysql.Delete(&Menu{}, menuID).Error; err != nil {
        return err
    }

    if _, err := auth.Casbin.RemoveFilteredPolicy(0, fmt.Sprintf("action::%d", menuID)); err != nil {
        return err
    }

    return nil
}

func List() (menus []MenuInfo, err error) {
    menus = make([]MenuInfo, 0)
    err = db.Mysql.
        Model(&Menu{}).
        Find(&menus).Error
    return menus, err
}

func FunListForPid(pid uint64) (menus []MenuInfo, err error) {
    menus = make([]MenuInfo, 0)
    err = db.Mysql.
        Model(&Menu{}).
        Where("type = ?", 3).
        Where("parent_id = ?", pid).
        Find(&menus).Error
    return menus, err
}

func System(uid uint64) ([]MenuInfo, error) {
    return TreeForPid(0, uid)
}

func Tree() ([]MenuInfo, error) {
    return TreeForPid(0, 0)
}

func TreeForPid(pid, uid uint64) (menus []MenuInfo, err error) {
    l, listErr := list(uid)
    if listErr != nil {
        return menus, listErr
    }
    ml := make([]MenuInfo, 0)
    fl := make([]MenuInfo, 0)
    root := make([]MenuInfo, 0)
    menus = make([]MenuInfo, 0)
    for _, item := range l {
        if item.Type == 1 || item.Type == 2 {
            ml = append(ml, item)
        }
        if item.Type == 3 {
            fl = append(fl, item)
        }
        if item.ParentID == pid {
            root = append(root, item)
        }
    }
    for _, menu := range root {
        menu.Children = getMenuForPid(menu.ID, ml, fl)
        menu.Funs = getFunForPid(menu.ID, fl)
        menus = append(menus, menu)
    }
    return menus, err
}

func list(uid uint64) (menus []MenuInfo, err error) {
    menus = make([]MenuInfo, 0)
    if uid == 0 {
        err = db.Mysql.
            Model(&Menu{}).
            Order("order_id").
            Find(&menus).Error
    } else {
        err = db.Mysql.
            Table("magi_menu AS m").
            Select("m.id, m.locale, m.path, m.type, m.method, m.icon, m.parent_id, m.order_id, m.created_at, m.updated_at").
            Joins("LEFT JOIN magi_role_menu AS rm ON rm.menu_id = m.id").
            Joins("LEFT JOIN magi_user_role AS ur ON ur.role_id = rm.role_id").
            Where("m.deleted_at IS NULL").
            Where("rm.deleted_at IS NULL").
            Where("ur.deleted_at IS NULL").
            Where("user_id = ?", uid).
            Order("m.order_id").
            Find(&menus).Error
    }
    return menus, err
}

func getMenuForPid(pid uint64, menuList, funList []MenuInfo) []MenuInfo {
    cl := make([]MenuInfo, 0)
    for _, menu := range menuList {
        if menu.ParentID == pid {
            cl = append(cl, menu)
        }
    }

    children := make([]MenuInfo, 0)
    for i, menu := range cl {
        cl[i].Children = getMenuForPid(menu.ID, menuList, funList)
        cl[i].Funs = getFunForPid(menu.ID, funList)
        children = append(children, cl[i])
    }

    return children
}

func getFunForPid(pid uint64, funs []MenuInfo) []MenuInfo {
    fs := make([]MenuInfo, 0)
    for i, fun := range funs {
        if pid == fun.ParentID {
            funs[i].Children = make([]MenuInfo, 0)
            funs[i].Funs = make([]MenuInfo, 0)
            fs = append(fs, funs[i])
        }
    }
    return fs
}
