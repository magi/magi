import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Divider, message, Modal, Table, Tag } from "antd";
import { EnvInfo, EnvSetCreateInfo, EnvSetListItem, EnvSetUpdateInfo } from "./data";
import { createEnvSet, deleteEnvSet, envSetList, updateEnvSet } from "./service";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";
import { useTranslation } from "react-i18next";

const {confirm} = Modal;

const EnvSet: FC = () => {
    const {t} = useTranslation();
    const [envSets, setEnvSets] = useState<EnvSetListItem[]>([]);
    const [envSetUpdate, setEnvSetUpdate] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const title = t("env_set");

    const getEnvSetList = async () => {
        const result = await envSetList();
        if (result.code === 0) {
            setEnvSets(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getEnvSetList().then();
    }, []);

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const handleCreateEnvSet = async (envSet: EnvSetCreateInfo) => {
        const result = await createEnvSet(envSet);
        if (result.code === 0) {
            setCreateFormVisible(false);
            getEnvSetList().then();
        } else {
            message.error(t("created_failed"));
        }
    };

    const handleUpdateEnvSet = async (code: string, envSet: EnvSetUpdateInfo) => {
        const result = await updateEnvSet(code, envSet);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getEnvSetList().then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const handleDeleteEnvSet = async (code: string) => {
        const result = await deleteEnvSet(code);
        if (result.code === 0) {
            getEnvSetList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addEnvSet = (
        <Button type='primary' onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(envSet: EnvSetListItem) {
        confirm({
            title: t("deleting") + " " + envSet.name + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteEnvSet(envSet.code).then();
            },
        });
    }

    const columns: ColumnsType<EnvSetListItem> = [
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
            title: t("env"),
            align: "center",
            render: (env_set) => (
                <>
                    {env_set.envs.map((env: EnvInfo) => {
                        return (
                            <div key={env.code}>
                                <Tag key={env.code}>{env.name}</Tag>
                            </div>
                        );
                    })}
                </>
            ),
        },
        {
            title: t("label"),
            dataIndex: "label",
            key: "label",
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
            title: t("create_time"),
            dataIndex: "create_time",
            key: "create_time",
            align: "center",
            render: formatTime,
        },
        {
            title: t("update_time"),
            dataIndex: "update_time",
            key: "update_time",
            align: "center",
            render: formatTime,
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (env_set) => (
                <Fragment>
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => {
                            setUpdateFormVisible(true);
                            setEnvSetUpdate(env_set);
                        }}>
                        {t("edit")}
                    </Button>
                    <Divider type='vertical' />
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => deleteModal(env_set)}>
                        {t("delete")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Card title={title} extra={addEnvSet}>
                <Table
                    columns={columns}
                    dataSource={envSets}
                    rowKey={envSets => envSets.id}
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
                    onOk={handleCreateEnvSet}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}

            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    envSet={envSetUpdate}
                    onOk={handleUpdateEnvSet}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default EnvSet;
