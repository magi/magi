import React, { FC, useEffect, useState } from "react";
import { Button, Card, Descriptions, message, PageHeader, Table } from "antd";
import { useLocation } from "react-router-dom";
import moment from "moment";
import { updateVarSet, varSetInfo } from "./service";
import { useTranslation } from "react-i18next";
import { ColumnsType } from "antd/es/table";
import { Var, VarSetUpdateInfo } from "./data";
import UpdateForm from "./components/UpdateForm";

const VarSetInfo: FC = () => {
    const {t} = useTranslation();
    const location = useLocation();
    const [varSet, setVarSet] = useState<any>({});
    const [vars, setVars] = useState<Var[]>([]);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const [updateFormLoading, setUpdateFormLoading] = useState(false);
    const [varSetUpdate, setVarSetUpdate] = useState<any>();

    const getVariableInfo = async (code: string) => {
        const result = await varSetInfo(code);
        setVarSet(result.data);
        setVars(result.data.vars);
    };

    useEffect(() => {
        const variableCode = location.pathname.split("/")[2];
        getVariableInfo(variableCode).then();
    }, [location.pathname]);

    const handleUpdateVarSet = async (code: string, varSet: VarSetUpdateInfo) => {
        setUpdateFormLoading(true);
        const result = await updateVarSet(code, varSet);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getVariableInfo(code).then();
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
                    setVarSetUpdate(varSet);
                }}>
            {t("edit")}
        </Button>
    );

    const columns: ColumnsType<Var> = [
        {
            title: t("var_key"),
            dataIndex: "v_key",
            key: "v_key",
            align: "center",
        },
        {
            title: t("var_value"),
            dataIndex: "v_value",
            key: "v_value",
            align: "center",
        },
        {
            title: t("update_time"),
            dataIndex: "update_time",
            key: "update_time",
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
            title: t("editor"),
            dataIndex: "editor",
            key: "editor",
        },
    ];

    return (
        <div>
            <PageHeader
                ghost={false}
                onBack={() => window.history.back()}
                title={varSet.name}
                extra={[edit]}>
                <Descriptions size='small' column={3}>
                    <Descriptions.Item label={t("create_time")}>{formatTime(varSet.create_time)}</Descriptions.Item>
                    <Descriptions.Item label={t("update_time")}>{formatTime(varSet.update_time)}</Descriptions.Item>
                    <Descriptions.Item label={t("description")}>{varSet.description}</Descriptions.Item>
                </Descriptions>
            </PageHeader>
            <Card style={{marginTop: "12px"}}>
                <Table
                    columns={columns}
                    dataSource={vars}
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
                    varSet={varSetUpdate}
                    onOk={handleUpdateVarSet}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default VarSetInfo;
