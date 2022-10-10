import React, { FC, Fragment, useEffect, useState } from "react";
import { Badge, Button, Card, Divider, message, Modal, Table } from "antd";
import { createUser, deleteUser, resetPassword, updateUser, userList } from "./service";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { UserCreateInfo, UserListItem, UserResetPassword, UserUpdateInfo } from "./data";
import { ColumnsType } from "antd/es/table";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";
import { useTranslation } from "react-i18next";
import ResetPasswordForm from "./components/ResetPasswordForm";

const {confirm} = Modal;

const User: FC = () => {
    const {t} = useTranslation();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [userUpdate, setUserUpdate] = useState<any>();
    const [userResetPassword, setUserResetPassword] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const [resetPasswordFormVisible, setResetPasswordFormVisible] = useState(false);
    const title = t("user");

    const getUserList = async () => {
        const result = await userList();
        if (result.code === 0) {
            setUsers(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getUserList().then();
    }, []);

    const handleSwitchUserState = async (user: UserListItem) => {
        const result = await updateUser(user.id, {
            status: user.status === 1 ? 2 : 1,
        } as UserUpdateInfo);
        if (result.code === 0) {
            getUserList().then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const handleCreateUser = async (user: UserCreateInfo) => {
        const result = await createUser(user);
        if (result.code === 0) {
            setCreateFormVisible(false);
            getUserList().then();
            message.success(t("created_successfully"));
        } else {
            message.error(t("created_failed"));
        }
    };

    const handleResetPassword = async (id: number, password: UserResetPassword) => {
        const result = await resetPassword(id, password);
        if (result.code === 0) {
            setResetPasswordFormVisible(false);
            getUserList().then();
        } else {
            message.error(t("edited_failed"));
        }
    };

    const handleUpdateUser = async (id: number, user: UserUpdateInfo) => {
        const result = await updateUser(id, user);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getUserList().then();
        } else {
            message.error(t("edited_failed"));
        }
    };

    const handleDeleteUser = async (id: number) => {
        const result = await deleteUser(id);
        if (result.code === 0) {
            getUserList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addUser = (
        <Button type='primary' onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(user: UserListItem) {
        confirm({
            title: t("deleting") + " " + user.username + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteUser(user.id).then();
            },
        });
    }

    const columns: ColumnsType<UserListItem> = [
        {
            title: t("id"),
            dataIndex: "id",
            key: "id",
            align: "center",
        },
        {
            title: t("username"),
            dataIndex: "username",
            key: "username",
            align: "center",
        },
        {
            title: t("full_name"),
            dataIndex: "full_name",
            key: "full_name",
            align: "center",
        },
        {
            title: t("email"),
            dataIndex: "email",
            key: "email",
            align: "center",
        },
        {
            title: t("group"),
            dataIndex: "group_name",
            key: "group_name",
            align: "center",
        },
        {
            title: t("role"),
            dataIndex: "role_name",
            key: "role_name",
            align: "center",
        },
        {
            title: t("status"),
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (status: number) => {
                if (status === 1) {
                    return <Badge status='success' text={t("enable")} />;
                } else if (status === 2) {
                    return <Badge status='default' text={t("disable")} />;
                } else {
                    return <Badge status='warning' text={t("unknown")} />;
                }
            },
        },
        {
            title: t("action"),
            key: "action",
            align: "center",
            render: (user: UserListItem) => (
                <Fragment>
                    <Button type='link'
                            size={"small"}
                            onClick={() => handleSwitchUserState(user)}>
                        {user.status === 1 ? t("disable") : t("enable")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                setUpdateFormVisible(true);
                                setUserUpdate(user);
                            }}>
                        {t("edit")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                setResetPasswordFormVisible(true);
                                setUserResetPassword(user.id);
                            }}>
                        {t("reset_password")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            onClick={() => deleteModal(user)}>
                        {t("delete")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Card title={title} extra={addUser}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey={users => users.id}
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
                    onOk={handleCreateUser}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}
            {resetPasswordFormVisible ?
                <ResetPasswordForm
                    open={resetPasswordFormVisible}
                    uid={userResetPassword}
                    onOk={handleResetPassword}
                    onCancel={() => {
                        setResetPasswordFormVisible(false);
                    }}
                /> : null}
            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    user={userUpdate}
                    onOk={handleUpdateUser}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default User;
