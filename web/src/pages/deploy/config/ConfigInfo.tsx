import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Descriptions, Divider, message, PageHeader, Table, Tag } from "antd";
import { useLocation } from "react-router-dom";
import moment from "moment";
import { configHistoryList, configInfo, editConfigFiles, updateConfig } from "./service";
import { useTranslation } from "react-i18next";
import { ColumnsType } from "antd/es/table";
import { ConfigHistoryListItem, ConfigUpdateInfo, EditConfigFile } from "./data";
import UpdateForm from "./components/UpdateForm";
import EditFileForm from "./components/EditFileForm";

const ConfigInfo: FC = () => {
    const {t} = useTranslation();
    const location = useLocation();
    const [config, setConfig] = useState<any>({});
    const [configHistories, setConfigHistories] = useState<ConfigHistoryListItem[]>([]);
    const [configHistory, setConfigHistory] = useState<any>({});
    const [updateFormLoading, setUpdateFormLoading] = useState(false);
    const [editFileFormVisible, setEditFileFormVisible] = useState(false);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const [configUpdate, setConfigUpdate] = useState<any>();
    const [editable, setEditable] = useState(false);
    const [editType, setEditType] = useState("edit");

    const getConfigInfo = async (code: string) => {
        const result = await configInfo(code);
        if (result.code === 0) {
            setConfig(result.data);
        }
    };

    const getConfigHistories = async (code: string) => {
        const result = await configHistoryList(code);
        if (result.code === 0) {
            setConfigHistories(result.data);
            if (result.data.length === 0) {
                setEditType("create");
                setEditable(true);
            } else {
                setEditType("edit");
            }
        }
    };

    useEffect(() => {
        const configCode = location.pathname.split("/")[2];
        getConfigInfo(configCode).then();
        getConfigHistories(configCode).then();
    }, [location.pathname]);

    const handleUpdateConfig = async (code: string, config: ConfigUpdateInfo) => {
        setUpdateFormLoading(true);
        const result = await updateConfig(code, config);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getConfigInfo(code).then();
        } else {
            message.error(t("updated_failed"));
        }
        setUpdateFormLoading(false);
        setUpdateFormVisible(false);
    };

    const handleEditConfigFiles = async (configCode: string, files: EditConfigFile) => {
        const result = await editConfigFiles(configCode, files);
        if (result.code === 0) {
            setEditFileFormVisible(false);
            getConfigHistories(config.code).then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const create = (
        <Button
            type='primary'
            key={"create_config_file"}
            onClick={() => {
                setEditFileFormVisible(true);
            }}>
            {t("create_config_file")}
        </Button>
    );

    const edit = (
        <Button
            type='primary'
            key={"edit"}
            onClick={() => {
                setUpdateFormVisible(true);
                setConfigUpdate(config);
            }}>
            {t("edit")}
        </Button>
    );

    const buttons = (editType: string) => {
        switch (editType) {
            case "create":
                return [create, edit];
            case "edit":
                return [edit];
            default:
                return [edit];
        }
    };

    const columns: ColumnsType<ConfigHistoryListItem> = [
        {
            title: t("version"),
            dataIndex: "version",
            key: "version",
        },
        {
            title: t("creator"),
            dataIndex: "creator",
            key: "creator",
        },
        {
            title: t("create_time"),
            dataIndex: "create_time",
            key: "create_time",
            align: "center",
            render: formatTime,
        },
        {
            title: t("status"),
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status: number) => {
                switch (status) {
                    case 1:
                        return <Tag color='green'>{t("using")}</Tag>;
                    case 2:
                        return <Tag color='geekblue'>{t("unused")}</Tag>;
                    default:
                        return <Tag color='yellow'>{t("unknown")}</Tag>;
                }
            },
        },
        {
            title: t("commit"),
            dataIndex: "commit",
            key: "commit",
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (history) => (
                <Fragment>
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => {
                            setEditType("edit");
                            setEditFileFormVisible(true);
                            setEditable(false);
                            setConfigHistory(history);
                        }}>
                        {t("view")}
                    </Button>
                    <Divider type='vertical' />
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => {
                            setEditFileFormVisible(true);
                            setConfigHistory(history);
                            setEditable(true);
                        }}>
                        {t("edit")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                ghost={false}
                onBack={() => window.history.back()}
                title={config.name}
                extra={buttons(editType)}
            >
                <Descriptions size='small' column={3}>
                    <Descriptions.Item label={t("create_time")}>{formatTime(config.create_time)}</Descriptions.Item>
                    <Descriptions.Item label={t("update_time")}>{formatTime(config.update_time)}</Descriptions.Item>
                    <Descriptions.Item label={t("code")}>{config.code}</Descriptions.Item>
                    <Descriptions.Item label={t("label")}>{config.label}</Descriptions.Item>
                    <Descriptions.Item label={t("project")}>{config.project}</Descriptions.Item>
                    <Descriptions.Item label={t("description")}>{config.description}</Descriptions.Item>
                </Descriptions>
            </PageHeader>

            <Card style={{marginTop: "12px"}}>
                <Table
                    columns={columns}
                    dataSource={configHistories}
                    size={"small"}
                    rowKey={configHistories => configHistories.id}
                    pagination={{
                        hideOnSinglePage: true,
                    }}
                />
            </Card>

            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    loading={updateFormLoading}
                    config={configUpdate}
                    onOk={handleUpdateConfig}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}

            {editFileFormVisible ?
                <EditFileForm
                    type={editType}
                    open={editFileFormVisible}
                    editable={editable}
                    configCode={config.code}
                    configLabelCode={config.label_code}
                    configHistory={configHistory}
                    onOk={handleEditConfigFiles}
                    onCancel={() => {
                        setEditFileFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default ConfigInfo;
