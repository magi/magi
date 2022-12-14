export interface UserListItem {
    id: number;
    username: string;
    full_name: string;
    email: string;
    group_id: number;
    group_name: string;
    role_id: number;
    role_name: string;
    status: number;
}

export interface UserCreateInfo {
    username: string;
    full_name: string;
    email: string;
    group_id: number;
    role_id: number;
}

export interface UserUpdateInfo {
    id?: number;
    username?: string;
    full_name?: string;
    email?: string;
    group_id?: number;
    role_id?: number;
    status?: number;
}

export interface UserResetPassword {
    password: string;
}