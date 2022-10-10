import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { RoleListItem, RoleUpdateInfo } from "../data";
import { useTranslation } from "react-i18next";

const {Item} = Form;

interface UpdateFormProps {
    open: boolean;
    role: RoleListItem;
    onOk: (id: number, user: RoleUpdateInfo) => void;
    onCancel: () => void;
}

const UpdateForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, role, onOk, onCancel} = props;
    const [form] = Form.useForm();

    const ok = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onOk(role.id, values);
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
            title={t("edit_role")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form{...form_layout} form={form} initialValues={role}>
                <Item name='name'
                      label={t("name")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_role_name")},
                      ]}
                >
                    <Input placeholder={t("please_enter_role_name")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default UpdateForm;
