import axios, { AxiosRequestConfig } from "axios";

import { deleteToken, getToken } from "./auth";
import { message, Modal } from "antd";
import i18next from "i18next";

export interface ResponseData<T> {
    code: number;
    data: T;
    message: string;
}

const key = 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || undefined
});

instance.interceptors.request.use(
    function (config: AxiosRequestConfig) {
        // @ts-ignore
        config.headers["token"] = getToken();
        return config;
    },
    function (error: any) {
        return Promise.reject(error);
    });

instance.interceptors.response.use(
    response => {
        if (response.data.code === -2) {
            Modal.warning({
                title: i18next.t("token_error"),
                onOk() {
                    window.location.href = "/login";
                    deleteToken();
                },
                okText: i18next.t("ok"),
            });
        }
        return Promise.resolve(response.data);
    },
    error => {
        if (error.response.status) {
            message.error({
                content: error.response.status + i18next.t("colon") + error.response.statusText,
                key
            }).then();
        } else {
            message.error({content: i18next.t("server_error") + i18next.t("colon") + error.message, key}).then();
        }
        return Promise.reject(error);
    });

export function get<T>(url: string, params?: any): Promise<ResponseData<T>> {
    return instance.get(url, {params});
}

export function post<T>(url: string, data?: any, params?: any): Promise<ResponseData<T>> {
    return instance.post(url, data, {params});
}

export function put<T>(url: string, data?: any, params?: any): Promise<ResponseData<T>> {
    return instance.put(url, data, {params});
}

export function del<T>(url: string, params?: any): Promise<ResponseData<T>> {
    return instance.delete(url, {params});
}
