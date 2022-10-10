export interface MenuListItem {
    id: number;
    locale: string;
    path: string;
    type: number;
    method: string;
    icon: string;
    parent_id: number;
    order_id: number;
    children: MenuListItem[];
    funs: MenuListItem[];
}
