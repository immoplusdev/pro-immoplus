import React from "react";
import {BaseRecord, useTranslate} from "@refinedev/core";
import {
    useTable,
    List,
    DeleteButton,
} from "@refinedev/antd";
import {Table, Space, Button} from "antd";
import {Link, useLocation} from "react-router-dom";
import type {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {ArrowRightOutlined} from "@ant-design/icons";
import {SearchInput} from "@/components/filters";
import {DateDisplayField} from "@/components/table";
import {ExportUsersButton} from "./export-users-button";
import {UserRoleTabs} from "./user-role-tabs";
import {OutlineTag} from "./outline-tag";
import {VerificationBadge} from "./verification-badge";
import {UserMonogram} from "./user-monogram";
import {badgeLabel} from "@/pages/statistics/pro-performance/types";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

const ROLE_COLORS: Record<string, string> = {
    customer: "#3B6D11",
    admin: "#A32D2D",
    pro_entreprise: "#185FA5",
    pro_particulier: "#854F0B",
    financier: "#534AB7",
    commercial: TEXT_SECONDARY,
};

const STATUS_COLORS: Record<string, string> = {
    active: "#1F8A5B",
    blocked: "#C13838",
};

const CERTIFICATION_COLORS: Record<string, string> = {
    en_progression: "#B86B0A",
    eligible: "#185FA5",
    certifie: "#1F8A5B",
    suspendu: "#C13838",
    retire: TEXT_SECONDARY,
};

type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: "all_e" | "admin" | "pro_entreprise" | "pro_particulier" | "utilisateurs_valides" | "utilisateurs_non_valides" | "customer" | "financier" | "commercial"
}
export const ListUsersTable = ({filters, activeMenu}: Props) => {
    const location = useLocation();
    const translate = useTranslate();
    const {tableProps, filters: searchFilters, setFilters, tableQuery} = useTable({
        syncWithLocation: true,
        resource: "users",
        sorters: {
            initial: [{
                field: "createdAt",
                order: "desc"
            }]
        },
        filters,
    });

    // Merge permanent + initial filters to pass to the export button
    const allFilters = [
        ...(filters?.permanent ?? []),
        ...(filters?.initial ?? []),
        ...(searchFilters ?? []),
    ];

    return (
        <>
            <UserRoleTabs activeMenu={activeMenu} />
            <List title={translate("users.title")}
                  headerButtons={[
                      <SearchInput
                          setFilters={setFilters}
                          tableQuery={tableQuery}
                      />,
                      <ExportUsersButton
                          filters={allFilters}
                          filenamePrefix={activeMenu ? `utilisateurs_${activeMenu}` : "utilisateurs"}
                      />,
                  ]}
            >
                <Table {...tableProps} rowKey="id">
                    <Table.Column
                        dataIndex="lastName"
                        title={translate("users.title")}
                        sorter={true}
                        render={(_, record: BaseRecord) => (
                            <div style={{display: "flex", alignItems: "center", gap: 10, textAlign: "left"}}>
                                <UserMonogram
                                    firstName={record.firstName}
                                    lastName={record.lastName}
                                    color={ROLE_COLORS[record.role?.name] ?? TEXT_SECONDARY}
                                />
                                <span>{record.lastName} {record.firstName}</span>
                            </div>
                        )}
                    />
                    <Table.Column
                        dataIndex="phoneNumber"
                        title={translate("users.fields.phone_number")}
                        align="center"
                    />
                    <Table.Column
                        dataIndex={["identityVerified"]}
                        title={translate("users.fields.identity_verified")}
                        render={(value: boolean) => <VerificationBadge verified={!!value}/>}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex={["compteProValide"]}
                        title={translate("users.fields.compte_pro_valide")}
                        render={(value: boolean) => <VerificationBadge verified={!!value}/>}
                        align="center"
                        sorter={true}
                    />
                    {activeMenu == "all_e" && <Table.Column
                        dataIndex={["role", "name"]}
                        title={translate("users.fields.role")}
                        render={(value: string) => (
                            <OutlineTag color={ROLE_COLORS[value] ?? TEXT_SECONDARY}>
                                {translate(`users.tags.roles.${value}`)}
                            </OutlineTag>
                        )}
                        align="center"
                    />}
                    <Table.Column
                        dataIndex="status"
                        title={translate("users.fields.status")}
                        render={(value: string) => (
                            <OutlineTag color={STATUS_COLORS[value.toLowerCase()] ?? TEXT_SECONDARY}>
                                {translate(`users.tags.status.${value.toLowerCase()}`)}
                            </OutlineTag>
                        )}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex="certificationScore"
                        title={translate("users.fields.certification_score")}
                        align="center"
                        sorter={true}
                        render={(value: number | null) => value ?? "—"}
                    />
                    <Table.Column
                        dataIndex="certificationStatus"
                        title={translate("users.fields.certification_status")}
                        align="center"
                        render={(value: keyof typeof badgeLabel | null) =>
                            value ? (
                                <OutlineTag color={CERTIFICATION_COLORS[value] ?? TEXT_SECONDARY}>
                                    {badgeLabel[value] ?? value}
                                </OutlineTag>
                            ) : "—"
                        }
                    />
                    <Table.Column
                        dataIndex="createdAt"
                        title={translate("fields.created_at")}
                        render={(date: string) => <DateDisplayField value={date}/>}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        title={translate("table.actions")}
                        dataIndex="actions"
                        align="center"
                        render={(_, record: BaseRecord) => (
                            <Space>
                                <Link to={`/users/edit/${record.id}`} state={{ from: location.pathname + location.search }}>
                                    <Button
                                        size="small"
                                        icon={<ArrowRightOutlined/>}
                                        style={{background: "#FFFFFF", border: `1px solid ${BORDER_COLOR}`, color: TEXT_SECONDARY}}
                                    />
                                </Link>
                                <DeleteButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                    style={{background: "#FFFFFF", border: "1px solid #C13838", color: "#C13838"}}
                                />
                            </Space>
                        )}
                    />
                </Table>
            </List>
        </>
    );
};
