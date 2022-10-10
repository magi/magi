import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Divider, message, Modal, Table } from "antd";
import { GroupCreateInfo, GroupListItem, GroupUpdateInfo } from "./data";
import { createGroup, deleteGroup, groupList, updateGroup } from "./service";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";
import { useTranslation } from "react-i18next";

const {confirm} = Modal;

const Group: FC = () => {
    const {t} = useTranslation();
    const [groups, setGroups] = useState<GroupListItem[]>([]);
    const [groupUpdate, setGroupUpdate] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const title = t("group");

    const getGroupList = async () => {
        const result = await groupList();
        if (result.code === 0) {
            setGroups(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getGroupList().then();
    }, []);

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const handleCreateGroup = async (group: GroupCreateInfo) => {
        const result = await createGroup(group);
        if (result.code === 0) {
            setCreateFormVisible(false);
            getGroupList().then();
        } else {
            message.error(t("created_failed"));
        }
    };

    const handleUpdateGroup = async (id: number, group: GroupUpdateInfo) => {
        const result = await updateGroup(id, group);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getGroupList().then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const handleDeleteGroup = async (id: number) => {
        const result = await deleteGroup(id);
        if (result.code === 0) {
            getGroupList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addGroup = (
        <Button type='primary' onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(group: GroupListItem) {
        confirm({
            title: t("deleting") + " " + group.name + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteGroup(group.id).then();
            },
        });
    }

    const columns: ColumnsType<GroupListItem> = [
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
            align: "center",
        },
        {
            title: t("role"),
            dataIndex: "role_name",
            key: "role_name",
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
            render: (group) => (
                <Fragment>
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                setUpdateFormVisible(true);
                                setGroupUpdate(group);
                            }}>
                        {t("edit")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            onClick={() => deleteModal(group)}>
                        {t("delete")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Card title={title} extra={addGroup}>
                <Table
                    columns={columns}
                    dataSource={groups}
                    rowKey={groups => groups.id}
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
                    onOk={handleCreateGroup}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}

            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    group={groupUpdate}
                    onOk={handleUpdateGroup}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default Group;
