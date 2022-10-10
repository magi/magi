import { del, get, post, put, ResponseData } from "../../../utils/request";
import { VarSetCreateInfo, VarSetInfo, VarSetListItem, VarSetUpdateInfo } from "./data";

export async function varSetList(): Promise<ResponseData<VarSetListItem[]>> {
    return await get<VarSetListItem[]>("/api/v1/var_sets");
}

export async function createVarSet(var_set: VarSetCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/var_sets", var_set);
}

export async function updateVarSet(code: string, var_set: VarSetUpdateInfo): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/var_sets/" + code, var_set);
}

export async function deleteVarSet(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/var_sets/" + code);
}

export async function varSetInfo(code: string): Promise<ResponseData<VarSetInfo>> {
    return await get<VarSetInfo>("/api/v1/var_sets/" + code);
}

export async function varSetListByLabel(label: string): Promise<ResponseData<VarSetListItem[]>> {
    return await get<VarSetListItem[]>("/api/v1/var_sets?label=" + label);
}