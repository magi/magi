import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Divider, message, Modal, Table, Tag } from "antd";
import { ClusterCreateInfo, ClusterListItem, ClusterUpdateInfo } from "./data";
import { clusterList, createCluster, deleteCluster, updateCluster } from "./service";
import { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";
import { useTranslation } from "react-i18next";

const {confirm} = Modal;

const Cluster: FC = () => {
    const {t} = useTranslation();
    const [clusters, setClusters] = useState<ClusterListItem[]>([]);
    const [clusterUpdate, setClusterUpdate] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const [createFormLoading, setCreateFormLoading] = useState(false);
    const title = t("cluster");

    const getClusterList = async () => {
        const result = await clusterList();
        if (result.code === 0) {
            setClusters(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getClusterList().then();
    }, []);

    const handleCreateCluster = async (cluster: ClusterCreateInfo) => {
        setCreateFormLoading(true)
        const result = await createCluster(cluster);
        if (result.code === 0) {
            setCreateFormVisible(false);
            getClusterList().then();
        } else {
            message.error(t("created_failed"));
        }
        setCreateFormLoading(false)
    };

    const handleUpdateCluster = async (code: string, cluster: ClusterUpdateInfo) => {
        const result = await updateCluster(code, cluster);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getClusterList().then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const handleDeleteCluster = async (code: string) => {
        const result = await deleteCluster(code);
        if (result.code === 0) {
            getClusterList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addCluster = (
        <Button type='primary' onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("add")}
        </Button>
    );

    function deleteModal(cluster: ClusterListItem) {
        confirm({
            title: t("deleting") + " " + cluster.name + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteCluster(cluster.code).then();
            },
        });
    }

    const columns: ColumnsType<ClusterListItem> = [
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
            title: t("status"),
            dataIndex: "k8s_cluster_status",
            key: "k8s_cluster_status",
            align: "center",
            render: (text: string) => {
                switch (text) {
                    case "Active":
                        return <Tag color='green'>Active</Tag>;
                    case "Inactive":
                        return <Tag color='red'>Inactive</Tag>;
                    default:
                        return <Tag color='yellow'>Unknown</Tag>;
                }
            },
        },
        {
            title: t("k8s_cluster_version"),
            dataIndex: "k8s_cluster_version",
            key: "k8s_cluster_version",
            align: "center",
        },
        {
            title: t("k8s_cluster_nodes"),
            align: "center",
            render: (cluster: ClusterListItem) => (
                <Tag color={cluster.k8s_cluster_status === "Active" ? "geekblue" : "red"}>
                    {cluster.k8s_cluster_nodes_ready_number + " / " + cluster.k8s_cluster_nodes_number}
                </Tag>
            ),
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (cluster) => (
                <Fragment>
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                setUpdateFormVisible(true);
                                setClusterUpdate(cluster);
                            }}>
                        {t("edit")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            onClick={() => deleteModal(cluster)}>
                        {t("delete")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Card title={title} extra={addCluster}>
                <Table
                    columns={columns}
                    dataSource={clusters}
                    rowKey={clusters => clusters.id}
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
                    onOk={handleCreateCluster}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}

            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    cluster={clusterUpdate}
                    onOk={handleUpdateCluster}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default Cluster;
