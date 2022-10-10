import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { EnvCreateInfo } from "../data";
import { useTranslation } from "react-i18next";
import { ClusterListItem } from "../../cluster/data";
import { clusterList } from "../../cluster/service";
import { labelList } from "../../label/service";
import { LabelListItem } from "../../label/data";

const {Item} = Form;
const {Option} = Select;

interface CreateFormProps {
    open: boolean;
    onOk: (env: EnvCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, onOk, onCancel} = props;
    const [hideNamespace, setHideNamespace] = useState<boolean>(true);
    const [clusters, setClusters] = useState<ClusterListItem[]>([]);
    const [labels, setLabels] = useState<LabelListItem[]>([]);
    const types = ["cluster", "namespace"];
    const [form] = Form.useForm();

    const getClusterList = async () => {
        const result = await clusterList();
        if (result.code === 0) {
            setClusters(result.data);
        }
    };

    const getLabelList = async () => {
        const result = await labelList();
        if (result.code === 0) {
            setLabels(result.data);
        }
    };

    useEffect(() => {
        getClusterList().then();
        getLabelList().then();
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
        labelCol: {span: 5},
    };

    const onTypeChange = (type: string) => {
        if (type === "namespace") {
            setHideNamespace(false);
        } else {
            setHideNamespace(true);
        }
    };

    return (
        <Modal
            title={t("create_env")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form{...form_layout} form={form}>
                <Item name='name'
                      label={t("name")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_env_name")},
                      ]}>
                    <Input placeholder={t("please_enter_env_name")} />
                </Item>
                <Item name='code'
                      label={t("code")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_env_code")},
                          {pattern: /^[0-9a-zA-Z_-]+$/, message: t("username_character_check")},
                      ]}>
                    <Input placeholder={t("please_enter_env_code")} />
                </Item>
                <Item name='cluster_code'
                      label={t("cluster")}
                      rules={[{required: true}]}>
                    <Select placeholder={t("please_select_env_cluster")} onChange={onTypeChange}>
                        {clusters.map(cluster => {
                            return (<Option key={cluster.code} value={cluster.code}>{cluster.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='type'
                      label={t("type")}
                      rules={[{required: true}]}>
                    <Select placeholder={t("please_select_env_type")} onChange={onTypeChange}>
                        {types.map(type => {
                            return (<Option key={type} value={type}>{t(type)}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='namespace'
                      label={t("namespace")}
                      rules={[
                          {whitespace: true, message: t("please_enter_env_namespace")},
                          {pattern: /^[0-9a-zA-Z-]+$/, message: t("username_character_check")},
                      ]}
                      hidden={hideNamespace}>
                    <Input placeholder={t("please_enter_env_namespace")} />
                </Item>
                <Item name='label_code'
                      label={t("label")}
                      rules={[{required: true}]}>
                    <Select placeholder={t("please_select_label")}>
                        {labels.map(label => {
                            return (<Option key={label.code} value={label.code}>{label.name}</Option>);
                        })}
                    </Select>
                </Item>
            </Form>
        </Modal>
    );
};
export default CreateForm;
