import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { EnvSetCreateInfo } from "../data";
import { useTranslation } from "react-i18next";
import { EnvListItem } from "../../env/data";
import { LabelListItem } from "../../label/data";
import { labelList } from "../../label/service";
import { envListByLabelAndType } from "../../env/service";

const {Item} = Form;
const {Option} = Select;

interface CreateFormProps {
    open: boolean;
    onOk: (label: EnvSetCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, onOk, onCancel} = props;
    const [envs, setEnvs] = useState<EnvListItem[]>([]);
    const [label, setLabel] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [labels, setLabels] = useState<LabelListItem[]>([]);
    const types = ["cluster", "namespace"];
    const [form] = Form.useForm();

    const getEnvList = async (label: string, type: string) => {
        const result = await envListByLabelAndType(label, type);
        if (result.code === 0) {
            setEnvs(result.data);
        }
    };

    const getLabelList = async () => {
        const result = await labelList();
        if (result.code === 0) {
            setLabels(result.data);
        }
    };

    useEffect(() => {
        getLabelList().then();
    }, []);

    useEffect(() => {
        getEnvList(label, type).then();
    }, [label, type]);

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

    function onLabelChange(label: string) {
        setLabel(label);
    }

    const onTypeChange = (type: string) => {
        setType(type);
    };

    return (
        <Modal
            title={t("create_env_set")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
        >
            <Form{...form_layout} form={form}>
                <Item name='name'
                      label={t("name")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_env_set_name")},
                      ]}>
                    <Input placeholder={t("please_enter_env_set_name")} />
                </Item>
                <Item name='code'
                      label={t("code")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_env_set_code")},
                      ]}>
                    <Input placeholder={t("please_enter_env_set_code")} />
                </Item>
                <Item name='label_code'
                      label={t("label")}
                      rules={[{required: true}]}>
                    <Select placeholder={t("please_select_label")} onChange={onLabelChange}>
                        {labels.map(label => {
                            return (<Option key={label.code} value={label.code}>{label.name}</Option>);
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
                <Item name='envs'
                      label={t("env")}
                      rules={[{required: true}]}>
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
export default CreateForm;
