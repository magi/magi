import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { deleteToken } from "../../../utils/auth";
import { message, Modal } from "antd";
import { useTranslation } from "react-i18next";

interface LogoutModalProps {
    open: boolean;
    changeLogoutModalVisible: Function;
}

const LogoutModal: React.FC<LogoutModalProps> = (props) => {
    const {t} = useTranslation();
    const history = useHistory();
    const {open, changeLogoutModalVisible} = props;

    useEffect(() => {
        changeLogoutModalVisible(open);
    }, [open, changeLogoutModalVisible]);

    const okHandle = () => {
        deleteToken();
        message.success(t("logout_successful")).then();
        changeLogoutModalVisible(false);
        history.replace("/login");
    };
    const cancelHandle = () => {
        changeLogoutModalVisible(false);
    };

    return (
        <Modal
            title={t("logout")}
            open={open}
            onOk={okHandle}
            onCancel={cancelHandle}
            destroyOnClose={true}
            width={320}
        >
            <div>{t("confirm_logging_out") + t("question_mark")}</div>
        </Modal>
    );

};
export default LogoutModal;
