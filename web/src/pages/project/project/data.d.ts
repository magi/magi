export interface ProjectListItem {
    id: number;
    name: string;
    code: string;
    template: string;
    commit: string;
    description: string;
    create_time: string;
    update_time: string;
}

export interface ProjectCreateInfo {
    name: string;
    description: string;
}
