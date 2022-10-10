import { del, get, post, put, ResponseData } from "../../../utils/request";
import { LabelCreateInfo, LabelListItem, LabelUpdateInfo } from "./data";

export async function labelList(): Promise<ResponseData<LabelListItem[]>> {
    return await get<LabelListItem[]>("/api/v1/labels");
}

export async function createLabel(label: LabelCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/labels", label);
}

export async function updateLabel(code: string, label: LabelUpdateInfo): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/labels/" + code, label);
}

export async function deleteLabel(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/labels/" + code);
}

