import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Descriptions, Divider, message, PageHeader, Table, Tag } from "antd";
import { useLocation } from "react-router-dom";
import moment from "moment";
import { appInfo, deployListByAppCode, updateApp } from "./service";
import { useTranslation } from "react-i18next";
import { ColumnsType } from "antd/es/table";
import { AppUpdateInfo } from "./data";
import UpdateForm from "./components/UpdateForm";
import { DeployListItem } from "../deploy/data";
import { deployDo } from "../deploy/service";


const AppInfo: FC = () => {
    const {t} = useTranslation();
    const location = useLocation();
    const [app, setApp] = useState<any>({});
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const [updateFormLoading, setUpdateFormLoading] = useState(false);
    const [appUpdate, setAppUpdate] = useState<any>();
    const [deploys, setDeploys] = useState<DeployListItem[]>([]);
    const [deploying, setDeploying] = useState<any>({});

    const getAppInfo = async (code: string) => {
        const result = await appInfo(code);
        if (result.code === 0) {
            setApp(result.data);
        }
    };

    const getDeployList = async (code: string) => {
        const result = await deployListByAppCode(code);
        if (result.code === 0) {
            setDeploys(result.data);
        }
    };

    useEffect(() => {
        const appCode = location.pathname.split("/")[2];
        getAppInfo(appCode).then();
        getDeployList(appCode).then();
    }, [location.pathname]);

    const handleDeploy = async (version: string) => {
        setDeploying({...deploying, [version]: true});
        const result = await deployDo(version);
        if (result.code === 0) {
            getDeployList(app.code).then();
        } else {
            message.error(t("updated_failed"));
        }
        setDeploying({...deploying, [version]: false});

    };

    const handleUpdateApp = async (code: string, app: AppUpdateInfo) => {
        setUpdateFormLoading(true);
        const result = await updateApp(code, app);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getAppInfo(code).then();
            getDeployList(code).then();
        } else {
            message.error(t("updated_failed"));
        }
        setUpdateFormLoading(false);
        setUpdateFormVisible(false);
    };

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const edit = (
        <Button type='primary' key={"edit"}
                onClick={() => {
                    setUpdateFormVisible(true);
                    setAppUpdate(app);
                }}>
            {t("edit")}
        </Button>
    );

    const columns: ColumnsType<DeployListItem> = [
        {
            title: t("deploy_version"),
            dataIndex: "version",
            key: "version",
        },
        {
            title: t("image_tag"),
            dataIndex: "image_tag",
            key: "image_tag",
        },
        {
            title: t("config_version"),
            dataIndex: "config_version",
            key: "config_version",
            render: (config_version: string) => {
                return config_version.length === 0 ? t("none") : config_version;
            },
        },
        {
            title: t("status"),
            dataIndex: "status",
            key: "status",
            render: (status: number) => {
                switch (status) {
                    case 1:
                        return <Tag color='magenta'>{t("created")}</Tag>;
                    case 2:
                        return <Tag color='blue'>{t("deploying")}</Tag>;
                    case 3:
                        return <Tag color='green'>{t("deployed")}</Tag>;
                    case 4:
                        return <Tag color='geekblue'>{t("cancel")}</Tag>;
                    case 5:
                        return <Tag color='red'>{t("deploy_failed")}</Tag>;
                    default:
                        return <Tag color='red'>{t("unknown")}</Tag>;
                }
            },
        },
        {
            title: t("creator"),
            dataIndex: "creator",
            key: "creator",
        },
        {
            title: t("deployer"),
            dataIndex: "deployer",
            key: "deployer",
        },
        {
            title: t("create_time"),
            dataIndex: "create_time",
            key: "create_time",
            align: "center",
            render: formatTime,
        },
        {
            title: t("finish_time"),
            dataIndex: "finish_time",
            key: "finish_time",
            align: "center",
            render: formatTime,
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
            render: (deploy: DeployListItem) => (
                <Fragment>
                    <Button
                        id={deploy.version}
                        type='primary'
                        size={"small"}
                        loading={deploying[deploy.version]}
                        disabled={!(deploy.status === 1 || deploy.status === 5)}
                        onClick={() => {
                            handleDeploy(deploy.version).then();
                        }}
                    >
                        {t("deploy")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            disabled={deploy.status !== 1}
                        // onClick={() => cancelModal(deployment)}
                    >
                        {t("cancel")}
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
                title={app.name}
                extra={[edit]}>
                <Descriptions size='small' column={3}>
                    <Descriptions.Item label={t("create_time")}>{formatTime(app.create_time)}</Descriptions.Item>
                    <Descriptions.Item label={t("update_time")}>{formatTime(app.update_time)}</Descriptions.Item>
                    <Descriptions.Item label={t("code")}>{app.code}</Descriptions.Item>
                    <Descriptions.Item label={t("label")}>{app.label}</Descriptions.Item>
                    <Descriptions.Item label={t("env_type")}>{t(app.env_type)}</Descriptions.Item>
                    {app.env_type === "env" ? <Descriptions.Item label={t("env")}>{app.env}</Descriptions.Item> : null}
                    {app.env_type === "env_set" ?
                        <Descriptions.Item label={t("env_set")}>{app.env_set}</Descriptions.Item> : null}
                    <Descriptions.Item label={t("image_registry")}>{app.image_registry}</Descriptions.Item>
                    <Descriptions.Item label={t("image_name")}>{app.image_name}</Descriptions.Item>
                    <Descriptions.Item label={t("description")}>{app.description}</Descriptions.Item>
                </Descriptions>
            </PageHeader>
            <Card style={{marginTop: "12px"}}>
                <Table
                    columns={columns}
                    dataSource={deploys}
                    size={"small"}
                    rowKey={variables => variables.id}
                    // loading={loading}
                    pagination={{
                        hideOnSinglePage: true,
                    }}
                />
            </Card>

            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    loading={updateFormLoading}
                    app={appUpdate}
                    onOk={handleUpdateApp}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default AppInfo;
