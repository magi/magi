import React, { FC, useEffect, useState } from "react";
import BasicLayout, { MenuDataItem } from "@ant-design/pro-layout";
import { useHistory, useLocation, withRouter } from "react-router-dom";
import RightContent from "../components/RightContent/RightContent";
import logo from "../assets/logo.svg";
import { menuIcons } from "../utils/icons";
import { systemMenuList } from "./service";
import { useTranslation } from "react-i18next";

const BaseLayout: FC = (props) => {
    const {t} = useTranslation();

    const history = useHistory();
    const location = useLocation();
    const [menuData, setMenuData] = useState<MenuDataItem[]>([]);
    const [pathname, setPathname] = useState(location.pathname);
    const [loading, setLoading] = useState(true);

    const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] => {
        if (menus != null && menus.length > 0) {
            return menus.map(({icon, children, locale, ...item}) => ({
                ...item,
                name: t(locale as string),
                icon: icon && menuIcons[icon as string],
                children: children && loopMenuItem(children),
            }));
        } else {
            return [];
        }
    };

    const fetchData = async () => {
        const result = await systemMenuList();
        setMenuData(result.data);
        setLoading(false);
    };

    useEffect(() => {
        setMenuData([]);
        setLoading(true);
        fetchData().then();
    }, []);


    return (
        <BasicLayout
            title={"Magi"}
            logo={logo}
            menu={{loading}}
            location={{pathname}}
            navTheme='light'
            menuDataRender={() => loopMenuItem(menuData)}
            rightContentRender={() => <RightContent />}
            menuItemRender={(item, dom) => (
                <div onClick={() => {
                    setPathname(item.path || "/dashboard");
                    history.push(item.path || "/dashboard");
                }}>
                    {dom}
                </div>
            )}>
            <div>{props.children}</div>
        </BasicLayout>
    );
};

export default withRouter(BaseLayout);
