import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Radio, RadioChangeEvent, Select, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { AppCreateInfo } from "../data";
import { ProjectListItem } from "../../../project/project/data";
import { projectConfigListByLabel, projectList } from "../../../project/project/service";
import { LabelListItem } from "../../../ops/label/data";
import { labelList } from "../../../ops/label/service";
import { VarSetListItem } from "../../varset/data";
import { varSetListByLabel } from "../../varset/service";
import { EnvListItem } from "../../../ops/env/data";
import { EnvSetListItem } from "../../../ops/envset/data";
import { envListByLabel } from "../../../ops/env/service";
import { envSetListByLabel } from "../../../ops/envset/service";
import { ConfigListItem } from "../../config/data";
import env from "../../../ops/env/Env";

const {Item} = Form;
const {Option} = Select;
const {TextArea} = Input;

interface CreateFormProps {
    open: boolean;
    loading: boolean;
    onOk: (app: AppCreateInfo) => void;
    onCancel: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, loading, onOk, onCancel} = props;
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [projectCode, setProjectCode] = useState<string>("");
    const [labels, setLabels] = useState<LabelListItem[]>([]);
    const [label, setLabel] = useState<string>("");
    const [varSets, setVarSets] = useState<VarSetListItem[]>([]);
    const [envs, setEnvs] = useState<EnvListItem[]>([]);
    const [envSets, setEnvSets] = useState<EnvSetListItem[]>([]);
    const [configs, setConfigs] = useState<ConfigListItem[]>([]);
    const [envRequired, setEnvRequired] = useState<boolean>(false);
    const [configRequired, setConfigRequired] = useState<boolean>(false);
    const [envSetRequired, setEnvSetRequired] = useState<boolean>(false);
    const [patchRequired, setPatchRequired] = useState<boolean>(false);
    const [namespaceRequired, setNamespaceRequired] = useState<boolean>(false);
    const [targetType, setTargetType] = useState<string>("env");
    const [form] = Form.useForm();

    const getProjectList = async () => {
        const result = await projectList();
        if (result.code === 0) {
            setProjects(result.data);
        }
    };

    const getLabelList = async () => {
        const result = await labelList();
        if (result.code === 0) {
            setLabels(result.data);
        }
    };

    const getVarSetListByLabel = async (label: string) => {
        const result = await varSetListByLabel(label);
        if (result.code === 0) {
            setVarSets(result.data);
        }
    };

    const getEnvListByLabel = async (label: string) => {
        const result = await envListByLabel(label);
        if (result.code === 0) {
            setEnvs(result.data);
        }
    };

    const getEnvSetListByLabel = async (label: string) => {
        const result = await envSetListByLabel(label);
        if (result.code === 0) {
            setEnvSets(result.data);
        }
    };

    const getConfigListByLabel = async (project_code: string, label: string) => {
        const result = await projectConfigListByLabel(project_code, label);
        if (result.code === 0) {
            setConfigs(result.data);
        }
    };

    useEffect(() => {
        getEnvListByLabel(label).then();
        getEnvSetListByLabel(label).then();
        getVarSetListByLabel(label).then();
    }, [label]);

    useEffect(() => {
        getProjectList().then();
        getLabelList().then();
    }, []);

    const ok = () => {
        form
            .validateFields()
            .then((values: AppCreateInfo) => {
                values.link_config ? values.link_config = 1 : values.link_config = 2;
                values.use_patch ? values.use_patch = 1 : values.use_patch = 2;
                form.resetFields();
                onOk(values);
            })
            .catch(info => {
                console.log(t("parameter_validation_failed"), t("colon"), info);
            });
    };

    function onLabelChange(labelValue: string) {
        setLabel(labelValue);
    }

    function onTargetTypeChange(e: RadioChangeEvent) {
        const type = e.target.value;
        setTargetType(type);
        switch (type) {
            case "env":
                setEnvRequired(true);
                setEnvSetRequired(false);
                break;
            case "env_set":
                setEnvRequired(false);
                setEnvSetRequired(true);
                break;
        }
    }

    function onLinkConfigChange(checked: boolean) {
        if (checked) {
            setConfigRequired(true);
            getConfigListByLabel(projectCode, label).then();
        } else {
            setConfigRequired(false);
            setConfigs([]);
        }
    }

    function onUsePatchChange(checked: boolean) {
        if (checked) {
            setPatchRequired(true);
        } else {
            setPatchRequired(false);
        }
    }

    function onProjectChange(v: string) {
        setProjectCode(v);
    }

    function onEnvChange(value: string) {
        envs.map((env) => {
            if (env.code === value) {
                if (env.type === "cluster") {
                    setNamespaceRequired(true);
                } else {
                    setNamespaceRequired(false);
                }
            }
        });
    }

    function onEnvSetChange(value: string) {
        envSets.map((envSet) => {
            if (envSet.code === value) {
                if (envSet.type === "cluster") {
                    setNamespaceRequired(true);
                } else {
                    setNamespaceRequired(false);
                }
            }
        });
    }

    const form_layout = {
        labelCol: {span: 4},
    };


    return (
        <Modal
            title={t("create_app")}
            open={open}
            confirmLoading={loading}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
            width={800}
        >
            <Form{...form_layout} form={form}>
                <Item name='project_code'
                      label={t("project")}
                      rules={[{required: true}]}>
                    <Select
                        placeholder={t("please_select_project")}
                        onChange={onProjectChange}>
                        {projects.map(project => {
                            return (<Option key={project.code} value={project.code}>{project.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='label_code'
                      label={t("label")}
                      rules={[{required: true}]}>
                    <Select
                        placeholder={t("please_select_label")}
                        onChange={onLabelChange}
                        value={label}>
                        {labels.map(label => {
                            return (<Option key={label.code} value={label.code}>{label.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='target_type'
                      label={t("env_type")}
                      rules={[{required: true}]}>
                    <Radio.Group value={targetType} onChange={onTargetTypeChange}>
                        <Radio value={"env"}>{t("env")}</Radio>
                        <Radio value={"env_set"}>{t("env_set")}</Radio>
                    </Radio.Group>
                </Item>
                <Item name='env_code'
                      label={t("env")}
                      hidden={!envRequired}
                      dependencies={["label_code"]}
                      rules={[{required: envRequired}]}>
                    <Select placeholder={t("please_select_env")} onChange={onEnvChange}>
                        {envs.map(env => {
                            return (<Option key={env.code} value={env.code}>{env.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='env_set_code'
                      label={t("env_set")}
                      hidden={!envSetRequired}
                      dependencies={["label_code"]}
                      rules={[{required: envSetRequired}]}>
                    <Select placeholder={t("please_select_env_set")} onChange={onEnvSetChange}>
                        {envSets.map(envSet => {
                            return (<Option key={envSet.code} value={envSet.code}>{envSet.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='namespace'
                      label={t("namespace")}
                      hidden={!namespaceRequired}
                      rules={[{required: namespaceRequired}]}>
                    <Input placeholder={t("namespace")} />
                </Item>
                <Item name='var_set_code'
                      label={t("var_set")}
                      rules={[{required: true}]}>
                    <Select placeholder={t("please_select_var_set")}>
                        {varSets.map(varSet => {
                            return (<Option key={varSet.code} value={varSet.code}>{varSet.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='image_registry'
                      label={t("image_registry")}
                      rules={[{required: true}]}>
                    <Input placeholder={t("image_registry")} />
                </Item>
                <Item name='image_name'
                      label={t("image_name")}
                      rules={[{required: true}]}>
                    <Input placeholder={t("image_name")} />
                </Item>
                <Item name='link_config'
                      label={t("link_config")}>
                    <Switch checked={configRequired} onChange={onLinkConfigChange} />
                </Item>
                <Item name='config_code'
                      label={t("config")}
                      hidden={!configRequired}
                      dependencies={["label_code"]}
                      rules={[{required: configRequired}]}>
                    <Select placeholder={t("please_select_config")}>
                        {configs.map(config => {
                            return (<Option key={config.code} value={config.code}>{config.name}</Option>);
                        })}
                    </Select>
                </Item>
                <Item name='use_patch'
                      label={t("use_patch")}>
                    <Switch checked={patchRequired} onChange={onUsePatchChange} />
                </Item>
                <Item name='patch_content'
                      label={t("patch")}
                      hidden={!patchRequired}
                      rules={[{required: patchRequired}]}>
                    <TextArea placeholder={t("patch")} autoSize={{minRows: 4, maxRows: 10}} />
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
