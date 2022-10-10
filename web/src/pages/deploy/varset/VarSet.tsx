import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, message, Modal, Table } from "antd";
import { VarSetCreateInfo, VarSetListItem } from "./data";
import { createVarSet, deleteVarSet, varSetList } from "./service";
import { ColumnsType } from "antd/es/table";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const {confirm} = Modal;

const VarSet: FC = () => {
    const {t} = useTranslation();
    const [vars, setVars] = useState<VarSetListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [createFormLoading, setCreateFormLoading] = useState(false);
    const history = useHistory();
    const location = useLocation();
    const title = t("var_set");

    const getVarSetList = async () => {
        const result = await varSetList();
        setVars(result.data);
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getVarSetList().then();
    }, []);

    const handleCreateVarSet = async (variable: VarSetCreateInfo) => {
        setCreateFormLoading(true);
        const result = await createVarSet(variable);
        if (result.code === 0) {
            getVarSetList().then();
        } else {
            message.error(t("created_failed"));
        }
        setCreateFormLoading(false);
        setCreateFormVisible(false);
    };

    const handleDeleteVarSet = async (code: string) => {
        const result = await deleteVarSet(code);
        if (result.code === 0) {
            getVarSetList().then();
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

    function deleteModal(variable: VarSetListItem) {
        confirm({
            title: t("deleting") + " " + variable.name + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteVarSet(variable.code).then();
            },
        });
    }

    const goVariableEdit = (variable: VarSetListItem) => {
        history.push({pathname: location.pathname + "/" + variable.code});
    };

    const columns: ColumnsType<VarSetListItem> = [
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
            render: (varSet: VarSetListItem) => (
                <Fragment>
                    <Button type='link'
                            size={"small"}
                            onClick={() => {
                                goVariableEdit(varSet);
                            }}>
                        {t("view")}
                    </Button>
                    {/*<Divider type='vertical' />*/}
                    {/*<Button*/}
                    {/*    type='link'*/}
                    {/*    size={"small"}*/}
                    {/*    onClick={() => deleteModal(varSet)}>*/}
                    {/*    {t("delete")}*/}
                    {/*</Button>*/}
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Card title={title} extra={addVariable}>
                <Table
                    columns={columns}
                    dataSource={vars}
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
                    onOk={handleCreateVarSet}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}

        </div>
    );
};
export default VarSet;
