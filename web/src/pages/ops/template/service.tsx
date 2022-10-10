import { del, get, post, put, ResponseData } from "../../../utils/request";
import { TemplateCreateInfo, TemplateFile, TemplateFileEdit, TemplateListItem } from "./data";

export async function templateList(): Promise<ResponseData<TemplateListItem[]>> {
    return await get<TemplateListItem[]>("/api/v1/templates");
}

export async function createTemplate(template: TemplateCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/templates", template);
}

export async function deleteTemplate(id: number): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/templates/" + id);
}

export async function editTemplateFiles(id: number, files: TemplateFileEdit): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/templates/" + id + "/files", files);
}

export async function templateFileList(id: number): Promise<ResponseData<TemplateFile[]>> {
    return await get<TemplateFile[]>("/api/v1/templates/" + id + "/files");
}