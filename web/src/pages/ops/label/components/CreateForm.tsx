import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { LabelCreateInfo } from "../data";
import { useTranslation } from "react-i18next";

const {Item} = Form;

interface CreateFormProps {
    open: boolean;
    onOk: (label: LabelCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, onOk, onCancel} = props;
    const [form] = Form.useForm();

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
        labelCol: {span: 5},
    };

    return (
        <Modal
            title={t("create_label")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form{...form_layout} form={form}>
                <Item name='name'
                      label={t("name")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_label_name")},
                      ]}>
                    <Input placeholder={t("please_enter_label_name")} />
                </Item>
                <Item name='code'
                      label={t("code")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_label_code")},
                          {pattern: /^[0-9a-zA-Z_-]+$/, message: t("username_character_check")},
                      ]}>
                    <Input placeholder={t("please_enter_label_code")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default CreateForm;
