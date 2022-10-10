import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Divider, message, Modal, Segmented, Table } from "antd";
import { ConfigCreateInfo, ConfigListItem } from "./data";
import { configList, configListByLabel, createConfig, deleteConfig } from "./service";
import { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { labelList } from "../../ops/label/service";

const {confirm} = Modal;

const Config: FC = () => {
    const {t} = useTranslation();
    const [configs, setConfigs] = useState<ConfigListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [createFormLoading, setCreateFormLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<string>("all");

    const history = useHistory();
    const location = useLocation();
    const title = t("config_manager");

    const getConfigList = async () => {
        const result = await configList();
        setConfigs(result.data);
    };

    const getLabelList = async () => {
        const result = await labelList();
        if (result.code === 0) {
            const labelOptions: any[] = [];
            if (result.data.length === 1) {
                labelOptions.push({
                    label: (<div>{t("label_" + result.data[0].code)}</div>),
                    value: result.data[0].code
                });
                setSelectedLabel(result.data[0].code);
            } else {
                labelOptions.push({label: (<div>{t("all")}</div>), value: "all"});
                result.data.map((item) => {
                    labelOptions.push({label: (<div>{t("label_" + item.code)}</div>), value: item.code});
                });
            }
            setOptions(labelOptions);
        }
    };

    const getConfigListByLabel = async (label: string) => {
        const result = await configListByLabel(label);
        if (result.code === 0) {
            setConfigs(result.data);
        }
    };

    useEffect(() => {
        getLabelList().then();
        getConfigList().then();
    }, []);

    const handleCreateConfig = async (variable: ConfigCreateInfo) => {
        setCreateFormLoading(true);
        const result = await createConfig(variable);
        if (result.code === 0) {
            getConfigList().then();
        } else {
            message.error(t("created_failed"));
        }
        setCreateFormLoading(false);
        setCreateFormVisible(false);
    };


    const handleDeleteConfig = async (code: string) => {
        const result = await deleteConfig(code);
        if (result.code === 0) {
            getConfigList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addVariable = (
        <Button type='primary'
                onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(variable: ConfigListItem) {
        confirm({
            title: t("deleting") + " " + variable.name + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteConfig(variable.code).then();
            },
        });
    }

    const onSegmentedChange = (value: any) => {
        setSelectedLabel(value);
        getConfigListByLabel(value).then();
    };

    const goVariableEdit = (variable: ConfigListItem) => {
        history.push({pathname: location.pathname + "/" + variable.code});
    };

    const columns: ColumnsType<ConfigListItem> = [
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
            align: "center",
        },
        {
            title: t("code"),
            dataIndex: "code",
            key: "code",
            align: "center",
        },
        {
            title: t("project"),
            dataIndex: "project",
            key: "project",
            align: "center",
        },
        {
            title: t("linked_app"),
            dataIndex: "linked_app",
            key: "linked_app",
            align: "center",
        },
        {
            title: t("current_version"),
            dataIndex: "current_version",
            key: "current_version",
            align: "center",
        },
        {
            title: t("label"),
            dataIndex: "label",
            key: "label",
            align: "center",
        },
        {
            title: t("description"),
            dataIndex: "description",
            key: "description",
            align: "center",
        },
        {
            title: t("commit"),
            dataIndex: "commit",
            key: "commit",
            align: "center",
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (config: ConfigListItem) => (
                <Fragment>
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                goVariableEdit(config);
                            }}>
                        {t("view")}
                    </Button>
                    <Divider type='vertical' />
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => deleteModal(config)}>
                        {t("delete")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Segmented
                options={options}
                size={"middle"}
                style={{marginBottom: 8}}
                value={selectedLabel}
                onChange={onSegmentedChange}
            />

            <Card title={title} extra={addVariable}>
                <Table
                    columns={columns}
                    dataSource={configs}
                    rowKey={variables => variables.id}
                    loading={loading}
                    pagination={{
                        hideOnSinglePage: true,
                        pageSize: 10,
                    }}
                />
            </Card>

            {createFormVisible ?
                <CreateForm
                    open={createFormVisible}
                    loading={createFormLoading}
                    onOk={handleCreateConfig}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}

        </div>
    );
};
export default Config;
