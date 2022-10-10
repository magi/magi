import React, { FC, useEffect, useState } from "react";
import { Form, Input, Modal, Select, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { AppListItem } from "../data";
import { configHistoryList } from "../../config/service";
import { ConfigHistoryListItem } from "../../config/data";
import TextArea from "antd/lib/input/TextArea";
import { DeployCreateInfo } from "../../deploy/data";

const {Item} = Form;
const {Option} = Select;

interface CreateFormProps {
    open: boolean;
    loading: boolean;
    app: AppListItem;
    onOk: (deploy: DeployCreateInfo) => void;
    onCancel: () => void;
}

const DeployForm: FC<CreateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, app, loading, onOk, onCancel} = props;
    const [configHistories, setConfigHistories] = useState<ConfigHistoryListItem[]>([]);
    const [configRequired, setConfigRequired] = useState<boolean>(false);
    const [patchRequired, setPatchRequired] = useState<boolean>(false);
    const [form] = Form.useForm();

    const getConfigs = async (config_code: string) => {
        const result = await configHistoryList(config_code);
        if (result.code === 0) {
            if (result.data.length > 0) {
                setConfigHistories(result.data);
            }
        }
    };

    useEffect(() => {
        if (app.link_config === 1) {
            setConfigRequired(true);
            getConfigs(app.config_code).then();
        } else {
            setConfigRequired(false);
        }
        if (app.use_patch === 1) {
            setPatchRequired(true);
        } else {
            setPatchRequired(false);
        }
    }, [app]);

    const ok = () => {
        form
            .validateFields()
            .then((deploy: DeployCreateInfo) => {
                deploy.app_code = app.code;
                form.resetFields();
                onOk(deploy);
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
            title={t("deploy")}
            open={open}
            confirmLoading={loading}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
            width={640}
        >
            <Form{...form_layout} form={form} initialValues={app}>
                <Item name='image_tag'
                      label={t("image_tag")}
                      rules={[{required: true}]}>
                    <Input placeholder={t("image_tag")} />
                </Item>
                <Item name='config_version'
                      label={t("config_version")}
                      hidden={!configRequired}
                      rules={[{required: configRequired}]}>
                    <Select placeholder={t("please_select_config")}>
                        {configHistories.map(config => {
                            return (<Option key={config.version} value={config.version}>
                                {config.version}{config.status === 1 ?
                                <Tag color={"green"} style={{marginLeft: 8}}>{t("using")}</Tag> : null}
                            </Option>);
                        })}
                    </Select>
                </Item>
                <Item name='patch_content'
                      label={t("patch")}
                      hidden={!patchRequired}
                      rules={[{required: patchRequired}]}>
                    <TextArea placeholder={t("patch")} autoSize={{minRows: 4, maxRows: 8}} />
                </Item>
            </Form>
        </Modal>
    );
};
export default DeployForm;
