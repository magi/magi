import React, { FC, useEffect, useState } from "react";
import { Button, Card, message, Modal, Table } from "antd";
import { LabelCreateInfo, LabelListItem, LabelUpdateInfo } from "./data";
import { createLabel, deleteLabel, labelList, updateLabel } from "./service";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";
import { useTranslation } from "react-i18next";

const {confirm} = Modal;

const Label: FC = () => {
    const {t} = useTranslation();
    const [labels, setLabels] = useState<LabelListItem[]>([]);
    const [labelUpdate, setLabelUpdate] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [updateFormVisible, setUpdateFormVisible] = useState(false);
    const title = t("label");

    const getLabelList = async () => {
        const result = await labelList();
        if (result.code === 0) {
            setLabels(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getLabelList().then();
    }, []);

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const handleCreateLabel = async (label: LabelCreateInfo) => {
        const result = await createLabel(label);
        if (result.code === 0) {
            setCreateFormVisible(false);
            getLabelList().then();
        } else {
            message.error(t("created_failed"));
        }
    };

    const handleUpdateLabel = async (code: string, label: LabelUpdateInfo) => {
        const result = await updateLabel(code, label);
        if (result.code === 0) {
            setUpdateFormVisible(false);
            getLabelList().then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const handleDeleteLabel = async (code: string) => {
        const result = await deleteLabel(code);
        if (result.code === 0) {
            getLabelList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addLabel = (
        <Button type='primary' onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(label: LabelListItem) {
        confirm({
            title: t("deleting") + " " + label.name + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteLabel(label.code).then();
            },
        });
    }

    const columns: ColumnsType<LabelListItem> = [
        {
            title: t("name"),
            dataIndex: "code",
            key: "code",
            align: "center",
            render: (code) => (
                <div>{t("label_" + code)}</div>
            ),
        },
        {
            title: t("code"),
            dataIndex: "code",
            key: "code",
            align: "center",
        },
        {
            title: t("create_time"),
            dataIndex: "create_time",
            key: "create_time",
            align: "center",
            render: formatTime,
        },
        // {
        //     title: t("action"),
        //     key: "action",
        //     align: "center",
        //     render: (label) => (
        //         <Fragment>
        //             <Button
        //                 type='link'
        //                 size={"small"}
        //                 onClick={() => {
        //                     setUpdateFormVisible(true);
        //                     setLabelUpdate(label);
        //                 }}>
        //                 {t("edit")}
        //             </Button>
        //             <Divider type='vertical' />
        //             <Button
        //                 type='link'
        //                 size={"small"}
        //                 onClick={() => deleteModal(label)}>
        //                 {t("delete")}
        //             </Button>
        //         </Fragment>
        //     ),
        // },
    ];

    return (
        <div>
            <Card title={title}>
                <Table
                    columns={columns}
                    dataSource={labels}
                    rowKey={labels => labels.id}
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
                    onOk={handleCreateLabel}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}

            {updateFormVisible ?
                <UpdateForm
                    open={updateFormVisible}
                    label={labelUpdate}
                    onOk={handleUpdateLabel}
                    onCancel={() => {
                        setUpdateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default Label;
