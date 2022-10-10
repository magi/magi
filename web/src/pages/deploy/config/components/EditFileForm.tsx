import React, { FC, useEffect, useState } from "react";
import { Button, message, Modal, Tabs } from "antd";
import CodeMirror from "@uiw/react-codemirror";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { StreamLanguage } from "@codemirror/language";
import AddFileForm from "./AddFileForm";
import { ConfigFileListItem, ConfigHistoryListItem, EditConfigFile } from "../data";
import { configFileList } from "../service";
import { useTranslation } from "react-i18next";

const {TabPane} = Tabs;

interface UpdateFormProps {
    type: string;
    open: boolean;
    editable: boolean;
    configCode: string;
    configLabelCode: string;
    configHistory: ConfigHistoryListItem;
    onOk: (configCode: string, configs: EditConfigFile) => void;
    onCancel: () => void;
}

const UpdateForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {type, open, editable, configCode, configLabelCode, configHistory, onOk, onCancel} = props;
    const [files, setFiles] = useState<ConfigFileListItem[]>([]);
    const [addFiles, setAddFiles] = useState<ConfigFileListItem[]>([]);
    const [updateFiles, setUpdateFiles] = useState<ConfigFileListItem[]>([]);
    const [deleteFiles, setDeleteFiles] = useState<ConfigFileListItem[]>([]);
    const [activeKey, setActiveKey] = useState<string>("0");
    const [addVisible, setAddVisible] = useState(false);
    const [filesVisible, setFilesVisible] = useState(false);
    // const [tabItems, setTabItems] = useState([]);

    const getConfigFileList = async (code: string, version: string) => {
        if (type === "edit") {
            const result = await configFileList(code, version);
            if (result.code === 0) {
                setFiles(result.data);
                setActiveKey(result.data[0].filename);
                setAddVisible(false);
                setFilesVisible(true);
            }
        }
    };

    useEffect(() => {
        getConfigFileList(configCode, configHistory.version).then();
    }, [configCode, configHistory]);

    // useEffect(() => {
    //     setTabItems()
    // }, [files]);

    const ok = () => {
        if (addFiles.length > 0 || updateFiles.length > 0 || deleteFiles.length > 0) {
            const edit: EditConfigFile = {
                label: configLabelCode,
                files: files,
            };
            onOk(configCode, edit);
        } else {
            onCancel();
        }
    };

    const onTabChange = (activeKey: string) => {
        setActiveKey(activeKey);
    };

    const onTabEdit = (targetKey: any, action: string) => {
        if (action === "remove") {
            if (files.length === 1) {
                message.error("不能删除全部配置文件").then();
                return;
            }
            const index = files.findIndex(item => item.filename === targetKey);

            if (addFiles.find(item => item.filename === targetKey)) {
                const index = addFiles.findIndex(item => item.filename === targetKey);
                addFiles.splice(index, 1);
                setAddFiles([...addFiles]);
            } else {
                setDeleteFiles([...deleteFiles, files[index]]);
            }

            files.splice(index, 1);
            setFiles([...files]);

            setActiveKey(files[index === 0 ? index : index - 1].filename);
        }
        if (action === "add") {
            setAddVisible(true);
        }
    };

    const onEmptyOk = () => {
        setAddVisible(true);
    };

    const onAddFile = (value: string) => {
        setAddVisible(false);
        if (!filesVisible) {
            setFilesVisible(true);
        }
        const newFile: ConfigFileListItem = {
            config_history_id: configHistory.id,
            filename: value,
            content: "",
        };
        setActiveKey(value);
        setAddFiles([...addFiles, newFile]);
        setFiles([...files, newFile]);
    };

    const onCancelAddFile = () => {
        setAddVisible(false);
    };

    const onCodeChange = (value: string) => {
        const addIndex = addFiles.findIndex(item => item.filename === activeKey);
        if (addIndex > -1) {
            addFiles[addIndex].content = value;
            setAddFiles([...addFiles]);
        } else {
            const update: ConfigFileListItem = {
                config_history_id: configHistory.id,
                filename: activeKey,
                content: value,
            };

            const updateIndex = updateFiles.findIndex(item => item.filename === activeKey);
            if (updateIndex === -1) {
                setUpdateFiles([...updateFiles, update]);
            } else {
                updateFiles[updateIndex].content = value;
                setUpdateFiles([...updateFiles]);
            }
        }
        const index = files.findIndex(item => item.filename === activeKey);
        files[index].content = value;
        setFiles([...files]);
    };


    return (
        <Modal
            title={t("config_file")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
            maskClosable={false}
            width={1080}
        >
            {!filesVisible ?
                <Button type='dashed' onClick={onEmptyOk}>{t("add_file")}</Button> : null}
            {filesVisible ? <Tabs
                type={"editable-card"}
                onChange={onTabChange}
                hideAdd={!editable}
                activeKey={activeKey}
                onEdit={onTabEdit}
                items={files.map((file) => {
                    return {
                        label: file.filename,
                        key: file.filename,
                        children: <CodeMirror
                            value={file.content}
                            minHeight={"400px"}
                            maxHeight={"520px"}
                            theme={"dark"}
                            editable={editable}
                            extensions={[StreamLanguage.define(yaml)]}
                            onChange={onCodeChange}
                        />,
                    };
                })}
            /> : null}
            {addVisible ?
                <AddFileForm
                    open={addVisible}
                    files={files}
                    onOk={onAddFile}
                    onCancel={onCancelAddFile}
                /> : null}
        </Modal>
    );
};
export default UpdateForm;
