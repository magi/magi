import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Divider, message, Modal, Table } from "antd";
import { EnvCreateInfo, EnvListItem, EnvUpdateInfo } from "./data";
import { createEnv, deleteEnv, envList, updateEnv } from "./service";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";
import { useTranslation } from "react-i18next";

const {confirm} = Modal;

const Env: FC = () => {
    const {t} = useTranslation();
    const [envs, setEnvs] = useState<EnvListItem[]>([]);
    const [envUpdate, setEnvUpdate] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const title = t("env");

    const getEnvList = async () => {
        const result = await envList();
        if (result.code === 0) {
            setEnvs(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getEnvList().then();
    }, []);

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const handleCreateEnv = async (env: EnvCreateInfo) => {
        const result = await createEnv(env);
        if (result.code === 0) {
            setCreateFormVisible(false);
            getEnvList().then();
        } else {
            message.error(t("created_failed"));
        }
    };

    const handleUpdateEnv = async (code: string, env: EnvUpdateInfo) => {
        const result = await updateEnv(code, env);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getEnvList().then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const handleDeleteEnv = async (code: string) => {
        const result = await deleteEnv(code);
        if (result.code === 0) {
            getEnvList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addEnv = (
        <Button type='primary' onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(env: EnvListItem) {
        confirm({
            title: t("deleting") + " " + env.name + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteEnv(env.code).then();
            },
        });
    }

    const columns: ColumnsType<EnvListItem> = [
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
            title: t("type"),
            dataIndex: "type",
            key: "type",
            align: "center",
            render: (type: string) => (
                type === "cluster" ?
                    <div>{t("cluster")}</div>
                    :
                    <div>{t("namespace")}</div>
            ),
        },
        {
            title: t("target"),
            align: "center",
            render: (env: EnvListItem) => (
                env.type === "cluster" ?
                    <div>{env.cluster}</div>
                    :
                    <div>{env.cluster + " / " + env.namespace}</div>
            ),
        },
        {
            title: t("label"),
            dataIndex: "label",
            key: "label",
            align: "center",
        },
        {
            title: t("create_time"),
            dataIndex: "create_time",
            key: "create_time",
            align: "center",
            render: formatTime,
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (env) => (
                <Fragment>
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => {
                            setUpdateFormVisible(true);
                            setEnvUpdate(env);
                        }}>
                        {t("edit")}
                    </Button>
                    <Divider type='vertical' />
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => deleteModal(env)}>
                        {t("delete")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Card title={title} extra={addEnv}>
                <Table
                    columns={columns}
                    dataSource={envs}
                    rowKey={envs => envs.id}
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
                    onOk={handleCreateEnv}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}

            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    env={envUpdate}
                    onOk={handleUpdateEnv}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default Env;
