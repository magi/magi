import React, { FC } from "react";
import "./Login.less";
import { Button, Card, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Redirect, useHistory } from "react-router-dom";
import { loggedIn, setFullName, setToken, setUsername } from "../../utils/auth";
import { UserLogIn } from "./data";
import { login } from "./service";
import { useTranslation } from "react-i18next";

const {Item} = Form;

const Login: FC = () => {
    const history = useHistory();
    const {t} = useTranslation();

    const onFinish = (user: UserLogIn) => {
        Login(user).then();
    };

    const Login = async (user: UserLogIn) => {
        const result = await login(user);
        if (result.code === 0) {
            message.success(t("login_successful"));
            setToken(result.data.token);
            setUsername(result.data.username);
            setFullName(result.data.full_name);
            history.replace("/dashboard");
        } else {
            message.error(t("login_failed") + t("colon") + result.message);
        }
    };

    return loggedIn() ? <Redirect to={"/dashboard"} /> : (
        <div className='login'>
            <Card title={"Magi System"} className='login-card'>
                <Form
                    name='login'
                    size={"large"}
                    className='login-form'
                    initialValues={{remember: true}}
                    onFinish={onFinish}
                >
                    <Item
                        name='username'
                        rules={[
                            {required: true, whitespace: true, message: t("please_enter_username")},
                            {pattern: /^[0-9a-zA-Z_-]+$/, message: t("username_character_check")},
                            {min: 4, max: 32, message: t("username_length_check")},
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder={t("username")} />
                    </Item>
                    <Item
                        name='password'
                        rules={[
                            {required: true, message: t("please_enter_password")},
                        ]}>
                        <Input.Password prefix={<LockOutlined />} type='password' placeholder={t("password")} />
                    </Item>
                    <Item>
                        <Button type='primary' htmlType='submit' className='login-form-button'>
                            {t("login")}
                        </Button>
                    </Item>
                </Form>
            </Card>
        </div>
    );
};
export default Login;
