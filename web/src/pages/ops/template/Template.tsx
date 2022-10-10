import React, { FC, Fragment, useEffect, useState } from "react";
import { Button, Card, Divider, message, Modal, Table } from "antd";
import { TemplateCreateInfo, TemplateFileEdit, TemplateListItem } from "./data";
import { createTemplate, deleteTemplate, editTemplateFiles, templateList } from "./service";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import EditFileForm from "./components/EditFileForm";
import { useTranslation } from "react-i18next";

const {confirm} = Modal;

const Template: FC = () => {
    const {t} = useTranslation();
    const [templates, setTemplates] = useState<TemplateListItem[]>([]);
    const [templateUpdate, setTemplateUpdate] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [editFileFormVisible, setEditFileFormVisible] = useState(false);
    const [editable, setEditable] = useState(false);
    const title = t("template");

    const getTemplateList = async () => {
        const result = await templateList();
        if (result.code === 0) {
            setTemplates(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getTemplateList().then();
    }, []);

    const formatTime = (date: any) => {
        return date ? moment(date).format("YYYY-MM-DD HH:mm") : "";
    };

    const handleCreateTemplate = async (template: TemplateCreateInfo) => {
        const result = await createTemplate(template);
        if (result.code === 0) {
            setCreateFormVisible(false);
            getTemplateList().then();
        } else {
            message.error(t("created_failed"));
        }
    };

    const handleDeleteTemplate = async (id: number) => {
        const result = await deleteTemplate(id);
        if (result.code === 0) {
            getTemplateList().then();
        } else {
            message.error(t("deleted_failed"));
        }
    };

    const addTemplate = (
        <Button type='primary' onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    function deleteModal(template: TemplateListItem) {
        confirm({
            title: t("deleting") + " " + template.name + t("question_mark"),
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDeleteTemplate(template.id).then();
            },
        });
    }

    const handleEditTemplateFiles = async (id: number, files: TemplateFileEdit) => {
        const result = await editTemplateFiles(id, files);
        if (result.code === 0) {
            setEditFileFormVisible(false);
            getTemplateList().then();
        } else {
            message.error(t("updated_failed"));
        }
    };

    const columns: ColumnsType<TemplateListItem> = [
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
            align: "center",
        },
        {
            title: t("creator"),
            dataIndex: "creator",
            key: "creator",
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
            render: (template) => (
                <Fragment>
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => {
                            setEditFileFormVisible(true);
                            setTemplateUpdate(template);
                            setEditable(false);
                        }}>
                        {t("view")}
                    </Button>
                    <Divider type='vertical' />
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => {
                            setEditFileFormVisible(true);
                            setTemplateUpdate(template);
                            setEditable(true);
                        }}>
                        {t("edit")}
                    </Button>
                    <Divider type='vertical' />
                    <Button
                        type='link'
                        size={"small"}
                        onClick={() => deleteModal(template)}>
                        {t("delete")}
                    </Button>
                </Fragment>
            ),
        },
    ];

    return (
        <div>
            <Card title={title} extra={addTemplate}>
                <Table
                    columns={columns}
                    dataSource={templates}
                    rowKey={templates => templates.id}
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
                    onOk={handleCreateTemplate}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}

            {editFileFormVisible ?
                <EditFileForm
                    open={editFileFormVisible}
                    editable={editable}
                    template={templateUpdate}
                    onOk={handleEditTemplateFiles}
                    onCancel={() => {
                        setEditFileFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default Template;
