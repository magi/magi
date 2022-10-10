import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { groupList } from "../../group/service";
import { roleList } from "../../role/service";
import { GroupListItem } from "../../group/data";
import { RoleListItem } from "../../role/data";
import { UserCreateInfo } from "../data";
import { useTranslation } from "react-i18next";

const {Item} = Form;
const {Option} = Select;

interface CreateFormProps {
    open: boolean;
    onOk: (user: UserCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, onOk, onCancel} = props;
    const [groups, setGroups] = useState<GroupListItem[]>([]);
    const [roles, setRoles] = useState<RoleListItem[]>([]);
    const [form] = Form.useForm();

    const getGroupList = async () => {
        const result = await groupList();
        if (result.code === 0) {
            setGroups(result.data);
        }
    };

    const getRoleList = async () => {
        const result = await roleList();
        if (result.code === 0) {
            setRoles(result.data);
        }
    };

    useEffect(() => {
        getGroupList().then();
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
            title={t("create_user")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form{...form_layout} form={form}>
                <Item name='username' label={t("username")} rules={[
                    {required: true, whitespace: true, message: t("please_enter_username")},
                    {pattern: /^[0-9a-zA-Z_-]+$/, message: t("username_character_check")},
                    {min: 4, max: 32, message: t("username_length_check")},
                ]}>
                    <Input placeholder={t("please_enter_username")} />
                </Item>
                <Item name='full_name' label={t("full_name")} rules={[
                    {required: true, whitespace: true, message: t("please_enter_name")},
                ]}>
                    <Input placeholder={t("please_enter_name")} />
                </Item>
                <Item name='email' label={t("email")} rules={[
                    {required: true, whitespace: true, message: t("please_enter_email")},
                    {
                        pattern: /^[0-9a-zA-Z_-]+@[0-9a-zA-Z_-]+(\.[0-9a-zA-Z_-]+)+$/,
                        message: t("email_character_check"),
                    },
                ]}>
                    <Input placeholder={t("please_enter_email")} />
                </Item>
                <Item name='password' label={t("password")} rules={[
                    {required: true, whitespace: true, message: t("please_enter_password")},
                    {min: 6, message: t("password_length_check")},
                ]}>
                    <Input placeholder={t("please_enter_password")} />
                </Item>
                <Item name='group_id' label={t("group")} rules={[{required: true}]}>
                    <Select placeholder={t("please_select_group")}>
                        {groups.map(group => {
                            return (<Option key={group.id} value={group.id}>{group.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='role_id' label={t("role")} rules={[{required: true}]}>
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
