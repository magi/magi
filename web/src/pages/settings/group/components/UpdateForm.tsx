import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { GroupListItem, GroupUpdateInfo } from "../data";
import { RoleListItem } from "../../role/data";
import { roleList } from "../../role/service";
import { useTranslation } from "react-i18next";

const {Item} = Form;
const {Option} = Select;

interface UpdateFormProps {
    open: boolean;
    group: GroupListItem;
    onOk: (id: number, group: GroupUpdateInfo) => void;
    onCancel: () => void;
}

const UpdateForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, group, onOk, onCancel} = props;
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
                onOk(group.id, values);
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
            title={t("edit_group")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}>
            <Form{...form_layout} form={form} initialValues={group}>
                <Item name='name' label={t("name")}
                      rules={[{required: true, whitespace: true, message: t("please_enter_group_name")}]}>
                    <Input placeholder={t("please_enter_group_name")} />
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
export default UpdateForm;
