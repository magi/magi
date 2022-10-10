import React, { FC, useEffect, useState } from "react";
import { Checkbox, Modal, Table } from "antd";
import { MenuListItem } from "../../menu/data";
import { RoleListItem } from "../data";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { roleMenus } from "../service";
import { useTranslation } from "react-i18next";

interface PermissionFormProps {
    open: boolean;
    role: RoleListItem;
    menus: MenuListItem[];
    onOk: (id: number, checkedList: number[]) => void;
    onCancel: () => void;
}

const PermissionForm: FC<PermissionFormProps> = (props) => {
    const {t} = useTranslation();
    const {open, role, menus, onOk, onCancel} = props;
    const [menusTree, setMenusTree] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [firstIn, setFirstIn] = useState(true);
    const [checkedList, setCheckedList] = React.useState<number[]>([]);
    const [indeterminateList, setIndeterminateList] = React.useState<number[]>([]);
    const [fMap, setFMap] = useState<Map<number, Array<number>>>(new Map());
    const [sMap, setSMap] = useState<Map<number, Array<number>>>(new Map());
    let fatherMap = new Map();
    let sonMap = new Map();

    const getRoleMenus = async (id: number) => {
        const result = await roleMenus(id);
        if (result.code === 0) {
            setCheckedList(result.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        setMenusTree(makeMenus(menus));
        makeList([], menus);
        setFMap(fatherMap);
        setSMap(sonMap);
    }, [menus]);

    useEffect(() => {
        setLoading(true);
        getRoleMenus(role.id).then();
    }, [role]);

    useEffect(() => {
        updateIndeterminate();
    }, [checkedList]);


    const ok = () => {
        onOk(role.id, checkedList);
    };

    const onChangeCheckbox = (e: CheckboxChangeEvent) => {
        updateChecked(e.target.value.id, e.target.checked, e.target.value.parent_id);
    };

    const makeMenus = (menus: MenuListItem[]): any => {
        return menus.map(({children, ...item}) => ({
            ...item,
            children: children.length === 0 ? null : makeMenus(children),
        }));
    };

    const makeList = (fids: number[], menus: MenuListItem[]) => {
        for (const menu of menus) {
            if (menu.children.length !== 0) {
                const cg: number[] = [];
                for (const child of menu.children) {
                    cg.push(child.id);
                }
                fatherMap.set(menu.id, cg);
                makeList([menu.id].concat(fids), menu.children);
            }
            if (menu.parent_id !== 0) {
                sonMap.set(menu.id, fids);
            }
            if (menu.funs.length !== 0) {
                const cg: number[] = [];
                for (const fun of menu.funs) {
                    cg.push(fun.id);
                    sonMap.set(fun.id, [menu.id].concat(fids));
                }
                fatherMap.set(menu.id, cg);
            }

        }
    };

    const updateChecked = (id: number, checked: boolean, fid: number) => {
        if (!checked) {
            checked = !checked && indeterminateList.includes(id);
        }
        let gcl = new Set<number>(checkedList);
        let gil = new Set<number>(indeterminateList);
        checked ? gcl.add(id) : gcl.delete(id);
        gil.delete(id);
        if (fMap.has(id)) {
            updateChildren(gcl, gil, id, checked);
        }
        if (fid !== 0) {
            updateFather(gcl, gil, id, checked);
        }
        setCheckedList(Array.from(gcl));
        setIndeterminateList(Array.from(gil));
    };

    const updateChildren = (gcl: Set<number>, gil: Set<number>, id: number, checked: boolean) => {
        if (fMap.has(id)) {
            // @ts-ignore
            for (let child of fMap.get(id)) {
                checked ? gcl.add(child) : gcl.delete(child);
                gil.delete(child);
                updateChildren(gcl, gil, child, checked);
            }
        }

    };

    const updateFather = (gcl: Set<number>, gil: Set<number>, id: number, checked: boolean) => {
        if (sMap.has(id)) {
            // @ts-ignore
            for (let fid of sMap.get(id)) {
                const fcl = intersection(new Set(fMap.get(fid)), gcl);
                const fil = intersection(new Set(fMap.get(fid)), gil);

                if (checked) {
                    gcl.add(fid);
                    // @ts-ignore
                    if (fcl.size === fMap.get(fid).length && fil.size === 0) {
                        gil.delete(fid);
                    }
                } else {
                    gil.add(fid);
                    if (fcl.size === 0) {
                        gcl.delete(fid);
                        gil.delete(fid);
                    }
                }
            }
        }
    };

    const updateIndeterminate = () => {
        const i: number[] = [];
        for (let [id, sonIds] of Array.from(fMap)) {
            const ccl = intersection(new Set(sonIds), new Set(checkedList));
            if (firstIn) {
                if (sonIds.length !== ccl.size && ccl.size > 0) {
                    i.push(id);
                    setFirstIn(false);
                }
            } else {
                const cil = intersection(new Set(sonIds), new Set(indeterminateList));
                if ((sonIds.length === ccl.size && cil.size > 0) || (sonIds.length !== ccl.size && ccl.size > 0)) {
                    i.push(id);
                }
            }
        }
        setIndeterminateList(i);
    };

    function intersection(setA: Set<number>, setB: Set<number>) {
        let _intersection = new Set();
        for (let elem of Array.from(setB)) {
            if (setA.has(elem)) {
                _intersection.add(elem);
            }
        }
        return _intersection;
    }

    const columns: any = [
        {
            title: t("menu"),
            dataIndex: "id",
            align: "left",
            width: 200,
            render: (text: any, record: MenuListItem) => {
                return (
                    <Checkbox
                        id={record.id as any}
                        value={record}
                        checked={checkedList.includes(record.id)}
                        indeterminate={indeterminateList.includes(record.id)}
                        onChange={onChangeCheckbox}>
                        {t(record.locale)}
                    </Checkbox>
                );
            },
        },
        {
            title: t("function"),
            dataIndex: "id",
            align: "left",
            render: (text: any, record: MenuListItem) => {
                return (
                    <div>{
                        record.funs.map(value => {
                            return <Checkbox
                                style={{margin: "0 4px"}}
                                id={value.id as any}
                                key={value.id}
                                value={value}
                                checked={checkedList.includes(value.id)}
                                onChange={onChangeCheckbox}>
                                {t(value.locale)}
                            </Checkbox>;
                        })}
                    </div>
                );
            },
        },
    ];

    return (
        <Modal
            title={t("permission")}
            open={open}
            onOk={ok}
            onCancel={onCancel}
            destroyOnClose={true}
            width={720}>
            <Table
                columns={columns}
                dataSource={menusTree}
                rowKey={data => data.id}
                pagination={false}
                loading={loading}
                size={"small"}
                bordered
                scroll={{y: 360}}
            />
        </Modal>
    );
};
export default PermissionForm;
