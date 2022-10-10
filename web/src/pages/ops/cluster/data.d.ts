export interface ClusterListItem {
    id: number;
    name: string;
    code: string;
    k8s_cluster_version: string;
    k8s_cluster_nodes_number: number;
    k8s_cluster_nodes_ready_number: number;
    k8s_cluster_status: string;
    status: string;
}

export interface ClusterCreateInfo {
    name: string;
    code: string;
    kube_config: string;
}

export interface ClusterUpdateInfo {
    name: string;
}
