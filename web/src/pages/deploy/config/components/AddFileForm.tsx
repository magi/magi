import React, { FC } from "react";
import { Form, Input, Modal } from "antd";
import { ConfigFileListItem } from "../data";
import { useTranslation } from "react-i18next";

const {Item} = Form;

interface AddFileFormProps {
    open: boolean;
    files: ConfigFileListItem[];
    onOk: (filename: string) => void;
    onCancel: () => void;
}

const AddFileForm: FC<AddFileFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, files, onOk, onCancel} = props;
    const [form] = Form.useForm();

    const ok = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onOk(values["filename"]);
            })
            .catch(info => {
                console.log(t("parameter_validation_failed"), t("colon"), info);
            });
    };

    return (
        <Modal
            title={t("new_file")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}>
            <Form form={form}>
                <Item
                    name='filename'
                    label={t("filename")}
                    rules={[
                        {required: true, whitespace: true, message: t("please_enter_filename")},
                        {
                            validator: (rule, value) => {
                                if (value && files.find(item => item.filename === value)) {
                                    return Promise.reject(t("file_already_exists"));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <Input placeholder={t("please_enter_filename")} />
                </Item>
            </Form>
        </Modal>
    );
};
export default AddFileForm;
