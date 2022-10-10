import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { UserResetPassword } from "../data";

const {Item} = Form;

interface CreateFormProps {
    open: boolean;
    uid: number;
    onOk: (uid: number, password: UserResetPassword) => void;
    onCancel: () => void;
}

const ResetPasswordForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, uid, onOk, onCancel} = props;
    const [form] = Form.useForm();
    const title = t("reset_password");

    const ok = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onOk(uid, values);
            })
            .catch(info => {
                console.log(t("parameter_validation_failed"), t("colon"), info);
            });
    };

    const form_layout = {
        labelCol: {span: 4},
    };

    return (
        <Modal
            title={title}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form{...form_layout} form={form}>
                <Item name='password' label={t("new_password")} rules={[
                    {required: true, whitespace: true, message: t("please_enter_new_password")},
                    {min: 6, message: t("password_length_check")},
                ]}>
                    <Input placeholder={t("please_enter_new_password")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default ResetPasswordForm;
