import React, { FC } from "react";
import { Button, Form, Input, Modal, Space } from "antd";
import { Var, VarSetInfo, VarSetUpdateInfo } from "../data";
import { useTranslation } from "react-i18next";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

const {Item} = Form;

interface UpdateFormProps {
    open: boolean;
    loading: boolean;
    varSet: VarSetInfo;
    onOk: (code: string, varSet: VarSetUpdateInfo) => void;
    onCancel: () => void;
}

const UpdateForm: FC<UpdateFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, loading, varSet, onOk, onCancel} = props;
    const [form] = Form.useForm();

    const varSetMap = new Map(varSet.vars.map((v) => [v.v_key, v]));
    const ok = () => {
        form
            .validateFields()
            .then(values => {
                const newVars: Var[] = values.vars;
                const oldVars: Var[] = varSet.vars;
                const varsMap = new Map(newVars.map((v) => [v.id, v]));
                const addVars: Var[] = [];
                const delVars: Var[] = [];
                const updateVars: Var[] = [];

                newVars.filter((v) => (v.id === undefined)).map((v) => (addVars.push(v)));

                oldVars.map((v) => {
                    if (varsMap.has(v.id)) {
                        const nv = varsMap.get(v.id);
                        if (nv !== undefined) {
                            if (!(nv.v_key === v.v_key && nv.v_value === v.v_value)) {
                                updateVars.push(nv);
                            }
                        }

                    } else {
                        delVars.push(v);
                    }
                });

                const newVarSet: VarSetUpdateInfo = {
                    name: values.name,
                    description: values.description,
                    add: addVars,
                    update: updateVars,
                    delete: delVars,
                };

                form.resetFields();
                onOk(varSet.code, newVarSet);
            })
            .catch(info => {
                console.log(t("parameter_validation_failed"), t("colon"), info);
            });
    };

    const form_layout = {
        labelCol: {span: 2},
    };

    return (
        <Modal
            title={t("edit_var_set")}
            open={open}
            width={960}
            confirmLoading={loading}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}>
            <Form{...form_layout} form={form} initialValues={varSet}>
                <Item
                    name='name'
                    label={t("name")}
                    rules={[{required: true, whitespace: true, message: t("please_enter_var_set_name")}]}
                >
                    <Input placeholder={t("please_enter_var_set_name")} />
                </Item>
                <Item name='description'
                      label={t("description")}>
                    <Input placeholder={t("description")} />
                </Item>
                <Item label={t("vars")}>
                    <Form.List name='vars'>
                        {(fields, {add, remove}) => (
                            <>
                                {fields.map(({key, name, ...restField}) => (
                                    <Space key={key} style={{marginBottom: 12}}>
                                        <Item
                                            noStyle
                                            {...restField}
                                            name={[name, "v_key"]}
                                            rules={[
                                                {required: true},
                                                {pattern: /^[A-Za-z_]\w*$/, message: t("var_key_character_check")},
                                            ]}>
                                            <Input
                                                disabled={varSetMap.has(
                                                    form.getFieldValue("vars")[key] === undefined
                                                        ? ""
                                                        : form.getFieldValue("vars")[key].key)}
                                                style={{width: 300}}
                                                placeholder={t("var_key")} />
                                        </Item>
                                        <Item
                                            noStyle
                                            {...restField}
                                            name={[name, "v_value"]}
                                            rules={[{required: true}]}>
                                            <Input style={{width: 500}} placeholder={t("var_value")} />
                                        </Item>
                                        <MinusCircleOutlined
                                            onClick={() => {
                                                remove(name);
                                            }}
                                        />
                                    </Space>
                                ))}
                                <Item>
                                    <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                        {t("add_var")}
                                    </Button>
                                </Item>
                            </>
                        )}
                    </Form.List>
                </Item>
            </Form>
        </Modal>
    );
};
export default UpdateForm;
