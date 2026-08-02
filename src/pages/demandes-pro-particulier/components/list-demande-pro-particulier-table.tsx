import React from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import { List, useTable } from "@refinedev/antd";
import { Table, Space, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { StatusDemandeProParticulierTag } from "./status-demande-pro-particulier-tag";
import { DateDisplayField } from "@/components/table";
import type { CrudFilter } from "@refinedev/core/src/contexts/data/types";
import { Link } from "react-router-dom";

type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
    };
    activeMenu?: "all" | "pending" | "approved" | "rejected";
};

export function ListDemandeProParticulierTable({ filters, activeMenu }: Props) {
    const translate = useTranslate();

    const { tableProps } = useTable({
        resource: "demandes-pro-particulier",
        syncWithLocation: true,
        filters: {
            permanent: filters?.permanent,
            initial: filters?.initial,
        },
        sorters: {
            initial: [{ field: "createdAt", order: "desc" }],
        },
    });

    return (
        <List
            title={translate("demandes_pro_particulier.title")}
        >
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="activite"
                    title={translate("demandes_pro_particulier.fields.activite")}
                    align="center"
                />
                <Table.Column
                    dataIndex="status"
                    title={translate("demandes_pro_particulier.fields.status")}
                    align="center"
                    sorter={true}
                    render={(value) => (
                        <StatusDemandeProParticulierTag status={value} />
                    )}
                />
                <Table.Column
                    dataIndex="createdAt"
                    title={translate("fields.created_at")}
                    align="center"
                    sorter={true}
                    render={(date: string) => <DateDisplayField value={date} />}
                />
                <Table.Column
                    dataIndex="updatedAt"
                    title={translate("fields.updated_at")}
                    align="center"
                    sorter={true}
                    render={(date: string) => <DateDisplayField value={date} />}
                />
                <Table.Column
                    title={translate("table.actions")}
                    dataIndex="actions"
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <Link to={`/demandes-pro-particulier/show/${record.id}`}>
                                <Button size="small" icon={<ArrowRightOutlined />} />
                            </Link>
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
