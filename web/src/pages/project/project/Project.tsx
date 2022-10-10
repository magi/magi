import React, { FC, useEffect, useState } from "react";
import { Button, Card, message, Table } from "antd";
import { ProjectCreateInfo, ProjectListItem } from "./data";
import { createProject, projectList } from "./service";
import { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import CreateForm from "./components/CreateForm";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Project: FC = () => {
    const {t} = useTranslation();
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [createFormVisible, setCreateFormVisible] = useState(false);
    const [createFormLoading, setCreateFormLoading] = useState(false);
    const history = useHistory();
    const title = t("project");

    const getProjectList = async () => {
        const result = await projectList();
        setProjects(result.data);
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        getProjectList().then();
    }, []);

    const handleCreateProject = async (project: ProjectCreateInfo) => {
        setCreateFormLoading(true);
        const result = await createProject(project);
        if (result.code === 0) {
            getProjectList().then();
        } else {
            message.error(t("created_failed"));
        }
        setCreateFormLoading(false);
        setCreateFormVisible(false);
    };

    const addProject = (
        <Button type='primary'
                onClick={() => setCreateFormVisible(true)}>
            <PlusOutlined />
            {t("create")}
        </Button>
    );

    const goProjectInfo = (project: ProjectListItem) => {
        history.push({pathname: "/project/" + project.name, state: project});
    };

    const columns: ColumnsType<ProjectListItem> = [
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
            title: t("template"),
            dataIndex: "template",
            key: "template",
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
        // {
        //     title: t("action"),
        //     key: "action",
        //     align: "center",
        //     render: (project) => (
        //         <Fragment>
        //             <Button type='link'
        //                     size={"small"}
        //                     onClick={() => {
        //                         goProjectInfo(project);
        //                     }}>
        //                 {t("detail")}
        //             </Button>
        //         </Fragment>
        //     ),
        // },
    ];

    return (
        <div>
            <Card title={title} extra={addProject}>
                <Table
                    columns={columns}
                    dataSource={projects}
                    rowKey={projects => projects.id}
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
                    onOk={handleCreateProject}
                    onCancel={() => {
                        setCreateFormVisible(false);
                    }}
                /> : null}
        </div>
    );
};
export default Project;
