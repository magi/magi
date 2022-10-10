export interface EnvListItem {
    id: number;
    name: string;
    code: string;
    type: string;
    cluster: string;
    namespace: string;
    label: string;
}

export interface EnvCreateInfo {
    name: string;
    code: string;
    type: string;
    cluster_code: string;
    label_code: string;
    namespace: string;
}

export interface EnvUpdateInfo {
    name: string;
}

