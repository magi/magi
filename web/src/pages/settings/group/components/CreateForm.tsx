import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { roleList } from "../../role/service";
import { GroupCreateInfo } from "../data";
import { RoleListItem } from "../../role/data";
import { useTranslation } from "react-i18next";

const {Item} = Form;
const {Option} = Select;

interface CreateFormProps {
    open: boolean;
    onOk: (user: GroupCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, onOk, onCancel} = props;
    const [roles, setRoles] = useState<RoleListItem[]>([]);
    const [form] = Form.useForm();

    const getRoleList = async () => {
        const result = await roleList();
        if (result.code === 0) {
            setRoles(result.data);
        }
    };

    useEffect(() => {
        getRoleList().then();
    }, []);

    const ok = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onOk(values);
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
            title={t("create_group")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form{...form_layout} form={form}>
                <Item name='name'
                      label={t("name")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_group_name")},
                      ]}>
                    <Input placeholder={t("please_enter_group_name")} />
                </Item>
                <Item name='role_id'
                      label={t("role")}
                      rules={[{required: true}]}>
                    <Select placeholder={t("please_select_role")}>
                        {roles.map(role => {
                            return (<Option key={role.id} value={role.id}>{role.name}</Option>);
                        })}
                    </Select>
                </Item>
            </Form>
        </Modal>
    );
};
export default CreateForm;
