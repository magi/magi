import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { AppInfo, AppUpdateInfo } from "../data";
import { useTranslation } from "react-i18next";

const {Item} = Form;

interface UpdateFormProps {
    open: boolean;
    loading: boolean;
    app: AppInfo;
    onOk: (code: string, app: AppUpdateInfo) => void;
    onCancel: () => void;
}

const UpdateForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, loading, app, onOk, onCancel} = props;
    const [form] = Form.useForm();

    const ok = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onOk(app.code, values);
            })
            .catch(info => {
                console.log(t("parameter_validation_failed"), t("colon"), info);
            });
    };

    const form_layout = {
        labelCol: {span: 2},
    };

    return (
        <Modal
            title={t("edit_app")}
            open={open}
            width={960}
            confirmLoading={loading}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}>
            <Form{...form_layout} form={form} initialValues={app}>
                <Item
                    name='name'
                    label={t("name")}
                    rules={[{required: true, whitespace: true, message: t("please_enter_app_name")}]}
                >
                    <Input placeholder={t("please_enter_app_name")} />
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
