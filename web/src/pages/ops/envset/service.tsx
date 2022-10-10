import { del, get, post, put, ResponseData } from "../../../utils/request";
import { EnvSetCreateInfo, EnvSetListItem, EnvSetUpdateInfo } from "./data";

export async function envSetList(): Promise<ResponseData<EnvSetListItem[]>> {
    return await get<EnvSetListItem[]>("/api/v1/env_sets");
}

export async function createEnvSet(envSet: EnvSetCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/env_sets", envSet);
}

export async function updateEnvSet(code: string, envSet: EnvSetUpdateInfo): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/env_sets/" + code, envSet);
}

export async function deleteEnvSet(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/env_sets/" + code);
}

export async function envSetListByLabel(label: string): Promise<ResponseData<EnvSetListItem[]>> {
    return await get<EnvSetListItem[]>("/api/v1/env_sets?label=" + label);
}
