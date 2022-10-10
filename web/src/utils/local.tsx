import zhCN from "antd/lib/locale/zh_CN";
import enUS from "antd/lib/locale/en_US";

export function getLocal() {
    if (localStorage.getItem("i18nextLng") === "zh-CN") {
        return zhCN;
    }
    if (localStorage.getItem("i18nextLng") === "en-US") {
        return enUS;
    }
    return enUS;
}

export function getLocalString() {
    return localStorage.getItem("i18nextLng");
}

export function setLocal(local: string) {
    localStorage.setItem("i18nextLng", local);
}
