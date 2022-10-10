import { del, get, post, put, ResponseData } from "../../../utils/request";
import { EnvCreateInfo, EnvListItem, EnvUpdateInfo } from "./data";

export async function envList(): Promise<ResponseData<EnvListItem[]>> {
    return await get<EnvListItem[]>("/api/v1/envs");
}

export async function createEnv(env: EnvCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/envs", env);
}

export async function updateEnv(code: string, env: EnvUpdateInfo): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/envs/" + code, env);
}

export async function deleteEnv(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/envs/" + code);
}

export async function envListByLabel(label: string): Promise<ResponseData<EnvListItem[]>> {
    return await get<EnvListItem[]>("/api/v1/envs?label=" + label);
}

export async function envListByLabelAndType(label: string, type: string): Promise<ResponseData<EnvListItem[]>> {
    return await get<EnvListItem[]>("/api/v1/envs?label=" + label + "&type=" + type);
}