export interface VarSetListItem {
    id: number;
    name: string;
    code: string;
    label: string;
    description: string;
    create_time: string;
    update_time: string;
}

export interface VarSetCreateInfo {
    name: string;
    code: string;
    label_code: string;
    description: string;
}

export interface VarSetUpdateInfo {
    name: string;
    description: string;
    add: Var[];
    update: Var[];
    delete: Var[];
}

export interface VarSetInfo {
    name: string;
    code: string;
    label_code: string;
    description: string;
    vars: Var[];
}

export interface Var {
    id: number;
    v_key: string;
    v_value: string;
    commit: string;
    editor: string;
    update_time: string;
}