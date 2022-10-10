import { del, get, post, ResponseData } from "../../../utils/request";
import { ProjectCreateInfo, ProjectListItem } from "./data";
import { ConfigListItem } from "../../deploy/config/data";

export async function projectList(): Promise<ResponseData<ProjectListItem[]>> {
    return await get<ProjectListItem[]>("/api/v1/projects");
}

export async function createProject(project: ProjectCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/projects", project);
}

export async function deleteProject(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/projects/" + code);
}

export async function projectConfigListByLabel(code: string, label: string): Promise<ResponseData<ConfigListItem[]>> {
    return await get<ConfigListItem[]>("/api/v1/projects/" + code + "/configs?label=" + label + "&linked=false");
}