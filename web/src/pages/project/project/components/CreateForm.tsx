import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import { TemplateListItem } from "../../../ops/template/data";
import { templateList } from "../../../ops/template/service";
import { ProjectCreateInfo } from "../data";

const {Item} = Form;
const {Option} = Select;

interface CreateFormProps {
    open: boolean;
    loading: boolean;
    onOk: (project: ProjectCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, loading, onOk, onCancel} = props;
    const [form] = Form.useForm();
    const [templates, setTemplates] = useState<TemplateListItem[]>([]);

    const getTemplateList = async () => {
        const result = await templateList();
        if (result.code === 0) {
            setTemplates(result.data);
        }
    };

    useEffect(() => {
        getTemplateList().then();
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
            title={t("create_project")}
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
                          {required: true, whitespace: true, message: t("please_enter_project_name")},
                      ]}>
                    <Input placeholder={t("please_enter_project_name")} />
                </Item>
                <Item name='code'
                      label={t("code")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_project_code")},
                          {pattern: /^[a-zA-Z][a-zA-Z\d-]+$/, message: t("project_code_character_check")},
                      ]}>
                    <Input placeholder={t("please_enter_project_code")} />
                </Item>
                <Item name='description'
                      label={t("description")}>
                    <Input placeholder={t("description")} />
                </Item>
                <Item name='template_id'
                      label={t("template")}
                      rules={[
                          {required: true, message: t("please_select_template")},
                      ]}>
                    <Select placeholder={t("please_select_template")}>
                        {templates.map(template => {
                            return (<Option key={template.id} value={template.id}>{template.name}</Option>);
                        })}
                    </Select>
                </Item>
            </Form>
        </Modal>
    );
};
export default CreateForm;
