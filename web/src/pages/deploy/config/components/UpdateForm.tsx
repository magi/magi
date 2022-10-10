import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { ConfigInfo, ConfigUpdateInfo } from "../data";
import { useTranslation } from "react-i18next";

const {Item} = Form;

interface UpdateFormProps {
    open: boolean;
    loading: boolean;
    config: ConfigInfo;
    onOk: (code: string, config: ConfigUpdateInfo) => void;
    onCancel: () => void;
}

const UpdateForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, loading, config, onOk, onCancel} = props;
    const [form] = Form.useForm();

    const ok = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onOk(config.code, values);
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
            title={t("edit_config")}
            open={open}
            confirmLoading={loading}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}>
            <Form{...form_layout} form={form} initialValues={config}>
                <Item
                    name='name'
                    label={t("name")}
                    rules={[{required: true, whitespace: true, message: t("please_enter_config_name")}]}
                >
                    <Input placeholder={t("please_enter_config_name")} />
                </Item>
                <Item name='description'
                      label={t("description")}>
                    <Input placeholder={t("description")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default UpdateForm;
