export interface ConfigListItem {
    id: number;
    name: string;
    code: string;
    description: string;
    create_time: string;
    update_time: string;
}

export interface ConfigCreateInfo {
    name: string;
    code: string;
    description: string;
}

export interface ConfigUpdateInfo {
    name: string;
    description: string;
}

export interface ConfigInfo {
    name: string;
    code: string;
    description: string;
}

export interface EditConfigFile {
    label: string;
    files: ConfigFile[];
}

export interface ConfigFile {
    filename: string;
    content: string;
}

export interface ConfigHistoryListItem {
    id: number;
    version: string;
    status: number;
    creator: string;
    create_time: string;
}

export interface ConfigFileListItem {
    config_history_id: number;
    filename: string;
    content: string;
}