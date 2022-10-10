export interface EnvSetListItem {
    id: number;
    name: string;
    code: string;
    type: string;
    envs: EnvInfo[];
}

export interface EnvInfo {
    name: string;
    code: string;
}

export interface EnvSetCreateInfo {
    name: string;
    code: string;
    type: string;
    envs: string[];
}

export interface EnvSetUpdateInfo {
    name: string;
    code: string;
    envs: string[];
}