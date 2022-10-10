import { del, get, post, put, ResponseData } from "../../../utils/request";
import { DeployCreateInfo, DeployInfo, DeployListItem } from "./data";

export async function deployList(): Promise<ResponseData<DeployListItem[]>> {
    return await get<DeployListItem[]>("/api/v1/deploys");
}

export async function createDeploy(deploy: DeployCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/deploys", deploy);
}

export async function deployDo(version: string): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/deploys/" + version);
}

export async function deleteDeploy(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/deploys/" + code);
}

export async function deployInfo(code: string): Promise<ResponseData<DeployInfo>> {
    return await get<DeployInfo>("/api/v1/deploys/" + code);
}

