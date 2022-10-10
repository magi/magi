import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import { ConfigCreateInfo } from "../data";
import { ProjectListItem } from "../../../project/project/data";
import { projectList } from "../../../project/project/service";
import { labelList } from "../../../ops/label/service";
import { LabelListItem } from "../../../ops/label/data";

const {Item} = Form;
const {Option} = Select;

interface CreateFormProps {
    open: boolean;
    loading: boolean;
    onOk: (variable: ConfigCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, loading, onOk, onCancel} = props;
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [labels, setLabels] = useState<LabelListItem[]>([]);
    const [form] = Form.useForm();

    const getProjectList = async () => {
        const result = await projectList();
        setProjects(result.data);
    };

    const getLabelList = async () => {
        const result = await labelList();
        if (result.code === 0) {
            setLabels(result.data);
        }
    };

    useEffect(() => {
        getProjectList().then();
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
            title={t("create_config")}
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
                          {required: true, whitespace: true, message: t("please_enter_config_name")},
                      ]}>
                    <Input placeholder={t("please_enter_config_name")} />
                </Item>
                <Item name='code'
                      label={t("code")}
                      rules={[
                          {required: true, whitespace: true, message: t("please_enter_config_code")},
                          {pattern: /^[a-zA-Z][a-zA-Z\d-]+$/, message: t("config_code_character_check")},
                      ]}>
                    <Input placeholder={t("please_enter_config_code")} />
                </Item>
                <Item name='project_code'
                      label={t("project")}
                      rules={[{required: true}]}>
                    <Select placeholder={t("please_select_project")}>
                        {projects.map(project => {
                            return (<Option key={project.code} value={project.code}>{project.name}</Option>);
                        })}
                    </Select>
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
                <Item name='description'
                      label={t("description")}>
                    <Input placeholder={t("description")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default CreateForm;
