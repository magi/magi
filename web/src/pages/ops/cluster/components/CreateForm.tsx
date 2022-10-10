import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { ClusterCreateInfo } from "../data";
import { useTranslation } from "react-i18next";
import TextArea from "antd/lib/input/TextArea";

const {Item} = Form;

interface CreateFormProps {
    open: boolean;
    onOk: (cluster: ClusterCreateInfo) => void;
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
            title={t("add_cluster")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form{...form_layout} form={form}>
                <Item name='name'
                      label={t("name")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_cluster_name")},
                      ]}>
                    <Input placeholder={t("please_enter_cluster_name")} />
                </Item>
                <Item name='code'
                      label={t("code")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_cluster_code")},
                          {pattern: /^[0-9a-zA-Z_-]+$/, message: t("username_character_check")},
                      ]}>
                    <Input placeholder={t("please_enter_cluster_code")} />
                </Item>
                <Item name='kube_config'
                      label={t("k8s_kubeconfig")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_cluster_kubeconfig")},
                      ]}>
                    <TextArea rows={4} placeholder={t("please_enter_cluster_kubeconfig")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default CreateForm;
