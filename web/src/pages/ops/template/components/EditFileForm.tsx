import React, { FC, useEffect, useState } from "react";
import { Alert, Button, message, Modal, Tabs } from "antd";
import { CodeErrorAlert, TemplateFile, TemplateFileEdit, TemplateListItem } from "../data";
import { templateFileList } from "../service";
import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import Jsyaml from "js-yaml";
import AddFileForm from "./AddFileForm";
import { useTranslation } from "react-i18next";

const {TabPane} = Tabs;

interface UpdateFormProps {
    open: boolean;
    editable: boolean;
    template: TemplateListItem;
    onOk: (template_id: number, files: TemplateFileEdit) => void;
    onCancel: () => void;
}

const EditFileForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, editable, template, onOk, onCancel} = props;
    const [files, setFiles] = useState<TemplateFile[]>([]);
    const [addFiles, setAddFiles] = useState<TemplateFile[]>([]);
    const [updateFiles, setUpdateFiles] = useState<TemplateFile[]>([]);
    const [deleteFiles, setDeleteFiles] = useState<TemplateFile[]>([]);
    const [activeKey, setActiveKey] = useState<string>("0");
    const [addVisible, setAddVisible] = useState(false);
    const [filesVisible, setFilesVisible] = useState(false);
    const [codeErrorAlerts, setCodeErrorAlerts] = useState<CodeErrorAlert[]>([]);

    const getTemplateFileList = async (id: number) => {
        const result = await templateFileList(id);
        if (result.code === 0) {
            if (result.data.length > 0) {
                setFilesVisible(true);
                setFiles(result.data);
                const alertList: CodeErrorAlert[] = [];
                for (let i = 0; i < result.data.length; i++) {
                    alertList.push({
                        filename: result.data[i].filename,
                        visible: false,
                        errors: "",
                    });
                }
                setCodeErrorAlerts(alertList);
                setActiveKey(result.data[0].filename);
            } else {
                setFilesVisible(false);
            }
        }
    };

    useEffect(() => {
        getTemplateFileList(template.id).then();
    }, [template]);

    const ok = () => {
        if (addFiles.length > 0 || updateFiles.length > 0 || deleteFiles.length > 0) {
            let hasError = false;
            codeErrorAlerts.forEach(item => {
                if (item.visible) {
                    message.error(`${item.filename}` + t("file_format_error")).then();
                    setActiveKey(item.filename);
                    hasError = true;
                    return;
                }
            });
            if (hasError) {
                return;
            }
            const edit: TemplateFileEdit = {
                add: addFiles,
                delete: deleteFiles,
                update: updateFiles,
            };
            onOk(template.id, edit);
        } else {
            onCancel();
        }
    };

    const onEmptyOk = () => {
        setAddVisible(true);
    };
    const onTabChange = (activeKey: string) => {
        setActiveKey(activeKey);
    };

    const onTabEdit = (targetKey: any, action: string) => {
        if (action === "remove") {
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
            if (files.length === 0) {
                setFilesVisible(false);
                setActiveKey("0");
            } else {
                if (activeKey === targetKey) {
                    setActiveKey(files[index === 0 ? index : index - 1].filename);
                }
            }
        }
        if (action === "add") {
            setAddVisible(true);
        }
    };

    const onAddFile = (value: string) => {
        setAddVisible(false);
        if (!filesVisible) {
            setFilesVisible(true);
        }
        const newFile: TemplateFile = {
            filename: value,
            content: "",
        };
        setActiveKey(value);
        setAddFiles([...addFiles, newFile]);
        setFiles([...files, newFile]);
        const newAlert: CodeErrorAlert = {
            filename: value,
            visible: false,
            errors: "",
        };
        setCodeErrorAlerts([...codeErrorAlerts, newAlert]);
    };

    const onCancelAddFile = () => {
        setAddVisible(false);
    };

    const onCodeChange = (value: string) => {
        let isYaml = false;
        let errorMessage = "";
        try {
            isYaml = (value === "" ? true : !!Jsyaml.load(value));
        } catch (e: any) {
            errorMessage = e && e.message;
        }

        if (isYaml) {
            const addIndex = addFiles.findIndex(item => item.filename === activeKey);
            if (addIndex > -1) {
                addFiles[addIndex].content = value;
                setAddFiles([...addFiles]);
            } else {
                const update: TemplateFile = {
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
            setAlert(activeKey, false, "");
        } else {
            setAlert(activeKey, true, errorMessage);
        }
    };

    const getAlertVisible = (filename: string) => {
        const index = codeErrorAlerts.findIndex(item => item.filename === filename);
        if (codeErrorAlerts[index]) {
            return codeErrorAlerts[index].visible;
        } else return false;
    };

    const getAlertErrors = (filename: string) => {
        const index = codeErrorAlerts.findIndex(item => item.filename === filename);
        if (codeErrorAlerts[index]) {
            return codeErrorAlerts[index].errors;
        } else return "";
    };

    const setAlert = (filename: string, visible: boolean, errors: string) => {
        const index = codeErrorAlerts.findIndex(item => item.filename === filename);
        codeErrorAlerts[index].visible = visible;
        codeErrorAlerts[index].errors = errors;
        setCodeErrorAlerts([...codeErrorAlerts]);
    };

    const makeMultiLine = (errorLog: string) => {
        return <pre style={{whiteSpace: "pre-wrap"}}>{errorLog}</pre>;
    };

    return (
        <Modal
            title={t("template_file")}
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
                        closable: editable,
                        children:
                            <div>
                                <CodeMirror
                                    value={file.content}
                                    minHeight={"400px"}
                                    maxHeight={"520px"}
                                    theme={"dark"}
                                    editable={editable}
                                    extensions={[StreamLanguage.define(yaml)]}
                                    onChange={onCodeChange}
                                />
                                {getAlertVisible(activeKey) ?
                                    <Alert
                                        showIcon
                                        message={t("yaml_file_format_error")}
                                        description={makeMultiLine(getAlertErrors(activeKey))}
                                        type='error' />
                                    : null}
                            </div>,
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
export default EditFileForm;
