import React from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import { List, useTable } from "@refinedev/antd";
import { Table, Space, Button, Badge } from "antd";
import { Link } from "react-router-dom";
import { ArrowRightOutlined, BellOutlined } from "@ant-design/icons";
import { AlertStatusTag } from "./alert-status-tag";
import { DateDisplayField } from "@/components/table";
import type { CrudFilter } from "@refinedev/core/src/contexts/data/types";

export type AlertStatusTab = "toutes" | "en_attente" | "propositions" | "cloturees";

type Props = {
    activeTab: AlertStatusTab;
};

export function ListAlertsTable({ activeTab }: Props) {
    const translate = useTranslate();

    const permanentFilters: CrudFilter[] =
        activeTab !== "toutes"
            ? [{ field: "status", operator: "eq" as const, value: activeTab }]
            : [];

    const { tableProps } = useTable({
        resource: "alerts",
        syncWithLocation: true,
        filters: { permanent: permanentFilters },
        sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    });

    return (
        <List
            title={
                <Space>
                    <BellOutlined />
                    {translate("alerts.title")}
                </Space>
            }
            headerButtons={[
                <Link key="toutes" to="/alerts">
                    <Button type={activeTab === "toutes" ? "primary" : "default"}>
                        {translate("tags.all_e")}
                    </Button>
                </Link>,
                <Link key="en_attente" to="/alerts/en-attente">
                    <Button type={activeTab === "en_attente" ? "primary" : "default"}>
                        {translate("alerts.tabs.en_attente")}
                    </Button>
                </Link>,
                <Link key="propositions" to="/alerts/propositions">
                    <Button type={activeTab === "propositions" ? "primary" : "default"}>
                        {translate("alerts.tabs.propositions")}
                    </Button>
                </Link>,
                <Link key="cloturees" to="/alerts/clôturées">
                    <Button type={activeTab === "cloturees" ? "primary" : "default"}>
                        {translate("alerts.tabs.cloturees")}
                    </Button>
                </Link>,
            ]}
        >
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="title"
                    title={translate("alerts.fields.title")}
                    align="center"
                />
                <Table.Column
                    dataIndex="targetType"
                    title={translate("alerts.fields.targetType")}
                    align="center"
                    render={(value: string) =>
                        value ? translate(`alerts.targetType.${value}`) : "-"
                    }
                />
                <Table.Column
                    dataIndex="status"
                    title={translate("alerts.fields.status")}
                    align="center"
                    sorter={true}
                    render={(value: string) => <AlertStatusTag status={value} />}
                />
                <Table.Column
                    dataIndex="matchCount"
                    title={translate("alerts.fields.matchCount")}
                    align="center"
                    render={(value: number) => value ?? 0}
                />
                <Table.Column
                    dataIndex="unreadMatchCount"
                    title={translate("alerts.fields.unreadMatchCount")}
                    align="center"
                    render={(value: number) =>
                        value > 0 ? (
                            <Badge count={value} overflowCount={99} />
                        ) : (
                            <span style={{ color: "#bbb" }}>0</span>
                        )
                    }
                />
                <Table.Column
                    dataIndex="createdAt"
                    title={translate("fields.created_at")}
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
                            <Link to={`/alerts/show/${record.id}`}>
                                <Button size="small" icon={<ArrowRightOutlined />} />
                            </Link>
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
