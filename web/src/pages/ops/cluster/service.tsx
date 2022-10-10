import { del, get, post, put, ResponseData } from "../../../utils/request";
import { ClusterCreateInfo, ClusterListItem, ClusterUpdateInfo } from "./data";

export async function clusterList(): Promise<ResponseData<ClusterListItem[]>> {
    return await get<ClusterListItem[]>("/api/v1/clusters");
}

export async function createCluster(cluster: ClusterCreateInfo): Promise<ResponseData<{}>> {
    return await post<{}>("/api/v1/clusters", cluster);
}

export async function updateCluster(code: string, cluster: ClusterUpdateInfo): Promise<ResponseData<{}>> {
    return await put<{}>("/api/v1/clusters/" + code, cluster);
}

export async function deleteCluster(code: string): Promise<ResponseData<{}>> {
    return await del<{}>("/api/v1/clusters/" + code);
}
