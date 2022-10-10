import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import { EnvSetListItem, EnvSetUpdateInfo } from "../data";
import { envList } from "../../env/service";
import { EnvListItem } from "../../env/data";

const {Item} = Form;
const {Option} = Select;


interface UpdateFormProps {
    open: boolean;
    envSet: EnvSetListItem;
    onOk: (code: string, envSet: EnvSetUpdateInfo) => void;
    onCancel: () => void;
}

const UpdateForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, envSet, onOk, onCancel} = props;
    const [envs, setEnvs] = useState<EnvListItem[]>([]);
    const [form] = Form.useForm();

    const update: EnvSetUpdateInfo = {
        name: envSet.name,
        code: envSet.code,
        envs: envSet.envs.map(env => env.code),
    };

    const getEnvList = async () => {
        const result = await envList();
        if (result.code === 0) {
            setEnvs(result.data);
        }
    };

    useEffect(() => {
        getEnvList().then();
    }, []);

    const ok = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onOk(envSet.code, values);
            })
            .catch(info => {
                console.log(t("parameter_validation_failed"), t("colon"), info);
            });
    };

    const form_layout = {
        envSetCol: {span: 4},
    };

    return (
        <Modal
            title={t("edit_env_set")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}>
            <Form {...form_layout} form={form} initialValues={update}>
                <Item
                    name='name'
                    label={t("name")}
                    rules={[{required: true, whitespace: true, message: t("please_enter_env_set_name")}]}
                >
                    <Input placeholder={t("please_enter_env_set_name")} />
                </Item>
                <Item name='envs'
                      label={t("env")}>
                    <Select placeholder={t("please_select_env_cluster")} mode='multiple' showArrow>
                        {envs.map(env => {
                            return (<Option key={env.code} value={env.code}>{env.name}</Option>);
                        })}
                    </Select>
                </Item>
            </Form>
        </Modal>
    );
};
export default UpdateForm;
