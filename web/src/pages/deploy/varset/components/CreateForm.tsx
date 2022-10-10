import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import { VarSetCreateInfo } from "../data";
import { LabelListItem } from "../../../ops/label/data";
import { labelList } from "../../../ops/label/service";

const {Item} = Form;
const {Option} = Select;

interface CreateFormProps {
    open: boolean;
    loading: boolean;
    onOk: (variable: VarSetCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, loading, onOk, onCancel} = props;
    const [labels, setLabels] = useState<LabelListItem[]>([]);
    const [form] = Form.useForm();

    const getLabelList = async () => {
        const result = await labelList();
        if (result.code === 0) {
            setLabels(result.data);
        }
    };

    useEffect(() => {
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
        labelCol: {span: 4},
    };

    return (
        <Modal
            title={t("create_var_set")}
            open={open}
            confirmLoading={loading}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
            width={560}
        >
            <Form{...form_layout} form={form}>
                <Item name='name'
                      label={t("name")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_var_set_name")},
                      ]}>
                    <Input placeholder={t("please_enter_var_set_name")} />
                </Item>
                <Item name='code'
                      label={t("code")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_var_set_code")},
                          {pattern: /^[a-zA-Z][a-zA-Z\d-]+$/, message: t("var_set_code_character_check")},
                      ]}>
                    <Input placeholder={t("please_enter_var_set_code")} />
                </Item>
                <Item name='label'
                      label={t("label")}
                      rules={[{required: true}]}>
                    <Select placeholder={t("please_select_label")}>
                        {labels.map(label => {
                            return (<Option key={label.code} value={label.code}>{label.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='description'
                      label={t("description")}>
                    <Input placeholder={t("description")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default CreateForm;
