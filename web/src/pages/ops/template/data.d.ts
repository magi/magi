export interface TemplateListItem {
    id: number;
    name: string;
    creator: string;
    create_time: string;
    update_time: string;
}

export interface TemplateCreateInfo {
    name: string;
}

export interface TemplateFile {
    filename: string;
    content: string;
}

export interface TemplateFileEdit {
    add: TemplateFile[];
    update: TemplateFile[];
    delete: TemplateFile[];
}

export interface CodeErrorAlert {
    filename: string;
    visible: boolean;
    errors: string;
}