import { del, get, post, put, ResponseData } from "../../../utils/request";
import { AppCreateInfo, AppInfo, AppListItem, AppUpdateInfo } from "./data";
import { DeployListItem } from "../deploy/data";

export async function appList(): Promise<ResponseData<AppListItem[]>> {
    return await get<AppListItem[]>("/api/v1/apps");
}

export async function createApp(app: AppCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/apps", app);
}

export async function updateApp(code: string, app: AppUpdateInfo): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/apps/" + code, app);
}

export async function deleteApp(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/apps/" + code);
}

export async function appInfo(code: string): Promise<ResponseData<AppInfo>> {
    return await get<AppInfo>("/api/v1/apps/" + code);
}

export async function appListByLabel(label: string): Promise<ResponseData<AppListItem[]>> {
    return await get<AppListItem[]>("/api/v1/apps?label=" + label);
}

export async function deployListByAppCode(appCode: string): Promise<ResponseData<DeployListItem[]>> {
    return await get<DeployListItem[]>("/api/v1/apps/" + appCode + "/deploys");
}