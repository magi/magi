import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { TemplateCreateInfo } from "../data";
import { useTranslation } from "react-i18next";

const {Item} = Form;

interface CreateFormProps {
    open: boolean;
    onOk: (template: TemplateCreateInfo) => void;
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
            title={t("create_template")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
            bodyStyle={{alignItems: "fit-content"}}
        >
            <Form{...form_layout} form={form}>
                <Item name='name'
                      label={t("name")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_template_name")},
                      ]}>
                    <Input placeholder={t("please_enter_template_name")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default CreateForm;
