import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Divider, message, Modal, Segmented, Table, Tag } from "antd";
import { AppCreateInfo, AppListItem } from "./data";
import { appList, appListByLabel, createApp, deleteApp } from "./service";
import { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from "moment/moment";
import { labelList } from "../../ops/label/service";
import DeployForm from "./components/DeployForm";
import { createDeploy } from "../deploy/service";
import { DeployCreateInfo } from "../deploy/data";

const {confirm} = Modal;

const App: FC = () => {
    const {t} = useTranslation();
    const [apps, setApps] = useState<AppListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [deployFormVisible, setDeployFormVisible] = useState(false);
    const [createFormLoading, setCreateFormLoading] = useState(false);
    const [deployFormLoading, setDeployFormLoading] = useState(false);
    const [options, setOptions] = useState<any[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<string>("all");
    const [appDeploy, setAppDeploy] = useState<any>();

    const history = useHistory();
    const location = useLocation();
    const title = t("app");

    const getAppList = async () => {
        const result = await appList();
        if (result.code === 0) {
            setApps(result.data);
        }
        setLoading(false);
    };

    const getAppListByLabel = async (label: string) => {
        const result = await appListByLabel(label);
        if (result.code === 0) {
            setApps(result.data);
        }
        setLoading(false);
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

    useEffect(() => {
        getLabelList().then();
        setLoading(true);
        getAppList().then();
    }, []);

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const handleCreateApp = async (app: AppCreateInfo) => {
        setCreateFormLoading(true);
        const result = await createApp(app);
        if (result.code === 0) {
            getAppListByLabel(selectedLabel).then();
        } else {
            message.error(t("created_failed"));
        }
        setCreateFormLoading(false);
        setCreateFormVisible(false);
    };

    const handleDeployApp = async (deploy: DeployCreateInfo) => {
        setDeployFormLoading(true);
        setDeployFormVisible(false);
        const result = await createDeploy(deploy);
        setDeployFormLoading(false);

        if (result.code === 0) {
            getAppListByLabel(selectedLabel).then();
        } else {
            message.error(t("created_failed"));
        }
    };

    const handleDeleteApp = async (code: string) => {
        const result = await deleteApp(code);
        if (result.code === 0) {
            getAppList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addApp = (
        <Button type='primary'
                onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(app: AppListItem) {
        confirm({
            title: t("deleting") + " " + app.project + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteApp(app.code).then();
            },
        });
    }

    const goAppInfo = (app: AppListItem) => {
        history.push({pathname: location.pathname + "/" + app.code});
    };

    const onSegmentedChange = (value: any) => {
        setSelectedLabel(value);
        setLoading(true);
        getAppListByLabel(value).then();
    };

    const columns: ColumnsType<AppListItem> = [
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
            align: "center",
        },
        {
            title: t("label"),
            dataIndex: "label",
            key: "label",
            align: "center",
        },
        {
            title: t("env"),
            key: "env",
            align: "center",
            render: (app: AppListItem) => {
                switch (app.target_type) {
                    case "env":
                        return <div>{"[" + t("env") + "] " + app.env}</div>;
                    case "env_set":
                        return <div>{"[" + t("env_set") + "] " + app.env_set}</div>;
                    default:
                        return <div>{t("unknown")}</div>;
                }
            },
        },
        {
            title: t("deploy_version"),
            dataIndex: "deploy_version",
            key: "deploy_version",
            align: "center",
        },
        {
            title: t("config_version"),
            dataIndex: "config_version",
            key: "config_version",
            align: "center",
            render: (config_version: string) => {
                return config_version.length === 0 ? t("none") : config_version;
            },
        },
        {
            title: t("var_set"),
            dataIndex: "var_set",
            key: "var_set",
            align: "center",
        },
        {
            title: t("image_name"),
            key: "image_name",
            align: "center",
            render: (app: AppListItem) => {
                return app.image_tag.length === 0 ? app.image_name : app.image_name + ":" + app.image_tag;
            },
        },
        {
            title: t("update_time"),
            dataIndex: "update_time",
            key: "update_time",
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
                        return <Tag color='magenta'>{t("created")}</Tag>;
                    case 2:
                        return <Tag color='blue'>{t("syncing")}</Tag>;
                    case 3:
                        return <Tag color='green'>{t("ready")}</Tag>;
                    case 4:
                        return <Tag color='geekblue'>{t("suspended")}</Tag>;
                    default:
                        return <Tag color='red'>{t("unknown")}</Tag>;
                }
            },
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
            render: (app: AppListItem) => (
                <Fragment>
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                setAppDeploy(app);
                                setDeployFormVisible(true);
                            }}>
                        {t("create_deploy_list")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                goAppInfo(app);
                            }}>
                        {t("view")}
                    </Button>
                    <Divider type='vertical' />
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => deleteModal(app)}>
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

            <Card title={title} extra={addApp}>
                <Table
                    columns={columns}
                    dataSource={apps}
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
                    onOk={handleCreateApp}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}
            {deployFormVisible ?
                <DeployForm
                    open={deployFormVisible}
                    loading={deployFormLoading}
                    app={appDeploy}
                    onOk={handleDeployApp}
                    onCancel={() => {
                        setDeployFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default App;
