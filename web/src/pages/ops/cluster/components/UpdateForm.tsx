import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { ClusterListItem, ClusterUpdateInfo } from "../data";
import { useTranslation } from "react-i18next";

const {Item} = Form;

interface UpdateFormProps {
    open: boolean;
    cluster: ClusterListItem;
    onOk: (code: string, cluster: ClusterUpdateInfo) => void;
    onCancel: () => void;
}

const UpdateForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, cluster, onOk, onCancel} = props;
    const [form] = Form.useForm();

    const ok = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onOk(cluster.code, values);
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
            title={t("edit_cluster")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}>
            <Form{...form_layout} form={form} initialValues={cluster}>
                <Item name='name' label={t("name")}
                      rules={[{required: true, whitespace: true, message: t("please_enter_cluster_name")}]}>
                    <Input placeholder={t("please_enter_cluster_name")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default UpdateForm;
