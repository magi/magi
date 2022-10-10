export interface AppListItem {
    id: number;
    name: string;
    code: string;
    project: string;
    label: string;
    target_type: string;
    env_type: string;
    env: string;
    env_set: string;
    var_set: string;
    description: string;
    image_registry: string;
    image_name: string;
    image_tag: string;
    link_config: number;
    config_code: string;
    use_patch: number;
    patch_content: string;
    create_time: string;
    update_time: string;
}

export interface AppCreateInfo {
    code: string;
    project: string;
    label: string;
    target_type: string;
    env_type: string;
    env?: string;
    env_set?: string;
    var_set: string;
    description: string;
    image_registry: string;
    image_name: string;
    link_config: number;
    config_code?: string;
    use_patch: number;
    patch_content?: string;
}

export interface AppUpdateInfo {
    name: string;
    description: string;
    add: Var[];
    update: Var[];
    delete: Var[];
}

export interface AppInfo {
    id: number;
    code: string;
    project: string;
    label: string;
    target_type: string;
    env_type: string;
    env: string;
    env_set: string;
    var_set: string;
    description: string;
    image_registry: string;
    image_name: string;
    image_tag: string;
    commit: string;
    create_time: string;
    update_time: string;
}

export interface Var {
    id: number;
    v_key: string;
    v_value: string;
}