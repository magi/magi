import { get, ResponseData } from "../../../utils/request";
import { MenuListItem } from "./data";

export async function menuList(): Promise<ResponseData<MenuListItem[]>> {
    return await get<MenuListItem[]>("/api/v1/menus?type=tree");
}
