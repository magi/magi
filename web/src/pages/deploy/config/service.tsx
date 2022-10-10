import { del, get, post, put, ResponseData } from "../../../utils/request";
import {
    ConfigCreateInfo,
    ConfigFileListItem,
    ConfigHistoryListItem,
    ConfigInfo,
    ConfigListItem,
    ConfigUpdateInfo,
    EditConfigFile
} from "./data";

export async function configList(): Promise<ResponseData<ConfigListItem[]>> {
    return await get<ConfigListItem[]>("/api/v1/configs");
}

export async function createConfig(config: ConfigCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/configs", config);
}

export async function updateConfig(code: string, config: ConfigUpdateInfo): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/configs/" + code, config);
}

export async function deleteConfig(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/configs/" + code);
}

export async function configInfo(code: string): Promise<ResponseData<ConfigInfo>> {
    return await get<ConfigInfo>("/api/v1/configs/" + code);
}

export async function configListByLabel(label: string): Promise<ResponseData<ConfigListItem[]>> {
    return await get<ConfigListItem[]>("/api/v1/configs?label=" + label);
}

export async function configHistoryList(code: string): Promise<ResponseData<ConfigHistoryListItem[]>> {
    return await get<ConfigHistoryListItem[]>("/api/v1/configs/" + code + "/histories");
}

export async function configFileList(code: string, version: string): Promise<ResponseData<ConfigFileListItem[]>> {
    return await get<ConfigFileListItem[]>("/api/v1/configs/" + code + "/histories/" + version + "/files");
}

export async function editConfigFiles(code: string, configs: EditConfigFile): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/configs/" + code + "/histories", configs);
}