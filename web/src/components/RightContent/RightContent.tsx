import { Avatar, Dropdown, Menu, Select } from "antd";
import "./RightContent.less";
import React, { useEffect, useState } from "react";
import { LogoutOutlined } from "@ant-design/icons";
import { getCurrentUser, getUsername } from "../../utils/auth";
import LogoutModal from "./components/LogoutModal";
import { getLocalString, setLocal } from "../../utils/local";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

const {Option} = Select;

const RightContent: React.FC = () => {
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [user, setUser] = useState("User");
    const [username, setUsername] = useState("User");
    const [language, setLanguage] = useState(getLocalString());
    const {i18n} = useTranslation();

    useEffect(() => {
        let currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        let currentUsername = getUsername();
        if (currentUsername) {
            setUsername(currentUsername);
        }
    }, [getCurrentUser(), getUsername()]);

    useEffect(() => {
        let local = getLocalString();
        if (local) {
            setLanguage(local);
        }
    }, []);

    const onMenuClick = () => {
        setLogoutModalVisible(true);
    };

    const menuHeaderDropdown = (
        <Menu onClick={onMenuClick}>
            <Menu.Item key='logout'>
                <LogoutOutlined />
                {t("logout")}
            </Menu.Item>
        </Menu>
    );

    const changeLogoutModalVisible = (status: boolean) => {
        setLogoutModalVisible(status);
    };

    const handleChange = (value: string) => {
        setLocal(value);
        i18n.changeLanguage(value).then();
        setLanguage(value);
    };

    return (
        <div className='right'>
            <Select value={language} onChange={handleChange} bordered={false} style={{marginRight: 10, width: 100}}>
                <Option value='zh-CN'>简体中文</Option>
                <Option value='en-US'>English</Option>
            </Select>
            <Avatar size={28}>
                {username.slice(0, 1).toUpperCase()}
            </Avatar>
            <Dropdown className={"action"} overlay={menuHeaderDropdown}>
        <span>
          <span>{user}</span>
        </span>
            </Dropdown>
            {logoutModalVisible ?
                <LogoutModal
                    open={logoutModalVisible}
                    changeLogoutModalVisible={changeLogoutModalVisible} /> : null}
        </div>
    );
};
export default RightContent;
