export interface DeployListItem {
    id: number;
    code: string;
    project: string;
    status: number;
    version: string;
    label: string;
    env_type: string;
    env: string;
    env_set: string;
    var_set: string;
    description: string;
    image_registry: string;
    image_name: string;
    create_time: string;
    update_time: string;
}

export interface DeployCreateInfo {
    app_code: string;
    image_tag?: string;
    config_version?: string;
    patch_content?: string;
}

export interface DeployUpdateInfo {
    name: string;
    description: string;
}

export interface DeployInfo {
    id: number;
    code: string;
    project: string;
    label: string;
    env_type: string;
    env: string;
    env_set: string;
    var_set: string;
    description: string;
    image_registry: string;
    image_name: string;
    commit: string;
    create_time: string;
    update_time: string;
}

