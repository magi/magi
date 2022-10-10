import React, { FC, Fragment, useEffect, useState } from "react";
import moment from "moment";
import { Button, Card, Divider, message, Modal, Table } from "antd";
import { RoleCreateInfo, RoleListItem, RoleUpdateInfo } from "./data";
import { ColumnsType } from "antd/es/table";
import { createRole, deleteRole, roleList, updateRole, updateRoleMenus } from "./service";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { menuList } from "../menu/service";
import { MenuListItem } from "../menu/data";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";
import PermissionForm from "./components/PermissionForm";
import { useTranslation } from "react-i18next";

const {confirm} = Modal;
const Context = React.createContext({name: "Default"});

const Role: FC = () => {
    const {t} = useTranslation();
    const [roles, setRoles] = useState<RoleListItem[]>([]);
    const [menus, setMenus] = useState<MenuListItem[]>([]);
    const [roleUpdate, setRoleUpdate] = useState<any>();
    const [rolePermission, setRolePermission] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const [permissionFormVisible, setPermissionFormVisible] = useState(false);
    const title = t("role");

    const getRoleList = async () => {
        const result = await roleList();
        if (result.code === 0) {
            setRoles(result.data);
        }
        setLoading(false);
    };

    const getMenuList = async () => {
        const result = await menuList();
        if (result.code === 0) {
            setMenus(result.data);
        }
    };

    useEffect(() => {
        setLoading(true);
        getRoleList().then();
        getMenuList().then();
    }, []);

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const handleCreateRole = async (role: RoleCreateInfo) => {
        const result = await createRole(role);
        if (result.code === 0) {
            setCreateFormVisible(false);
            getRoleList().then();
        } else {
            message.error(t("created_failed"));
        }
    };

    const handleUpdateRole = async (id: number, role: RoleUpdateInfo) => {
        const result = await updateRole(id, role);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getRoleList().then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const handleDeleteRole = async (id: number) => {
        const result = await deleteRole(id);
        if (result.code === 0) {
            getRoleList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const handleUpdatePermission = async (id: number, checkedList: number[]) => {
        const res = await updateRoleMenus(id, checkedList);
        if (res.code === 0) {
            setPermissionFormVisible(false);
        } else {
            message.error(t("updated_failed"));
        }
    };

    const addRole = (
        <Button type='primary' onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(role: RoleListItem) {
        confirm({
            title: t("deleting") + "< " + role.name + " >" + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteRole(role.id).then();
            },
        });
    }

    const columns: ColumnsType<RoleListItem> = [
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
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
            render: (role: RoleListItem) => (
                <Fragment>
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                setUpdateFormVisible(true);
                                setRoleUpdate(role);
                            }}>
                        {t("edit")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                setPermissionFormVisible(true);
                                setRolePermission(role);
                            }}>
                        {t("permission")}
                    </Button>
                    <Divider type='vertical' />
                    <Button type='link'
                            size={"small"}
                            onClick={() => deleteModal(role)}>
                        {t("delete")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Card title={title} extra={addRole}>
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey={roles => roles.id}
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
                    onOk={handleCreateRole}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}
            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    role={roleUpdate}
                    onOk={handleUpdateRole}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
            {permissionFormVisible ?
                <PermissionForm
                    open={permissionFormVisible}
                    role={rolePermission}
                    menus={menus}
                    onOk={handleUpdatePermission}
                    onCancel={() => {
                        setPermissionFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default Role;
