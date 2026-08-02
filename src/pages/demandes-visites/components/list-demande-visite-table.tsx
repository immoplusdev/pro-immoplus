import {BaseRecord, useTranslate} from "@refinedev/core";
import {BooleanField, DeleteButton, List, useTable} from "@refinedev/antd";
import {Button, Table} from "antd";
import {
    StatusValidationDemandeVisiteTag
} from "@/pages/demandes-visites/components/status-validation-demande-visite-tag";
import {DemandeVisiteTabs} from "@/pages/demandes-visites/components/demande-visite-tabs";
import {OutlineTag} from "@/pages/demandes-visites/components/outline-tag";
import {Link, useLocation} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import React from "react";
import type {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {SearchInput} from "@/components/filters";
import {DateDisplayField} from "@/components/table";
import {ExportTableButton} from "@/components/export/export-table-button";


const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: "all_e" | "en_validation" | "valide"
}

const STATUS_VISITE_LABELS: Record<string, string> = {
    valide: "Validée",
    rejete: "Rejetée",
    en_cours: "En cours",
    en_cours_validation_user: "En cours validation client",
    en_cours_validation_admin: "En cours validation admin",
};

function mapDemandeVisiteToRow(r: any, i: number): Record<string, string> {
    return {
        "#": String(i + 1),
        "Tél. client": r.clientPhoneNumber ?? "-",
        "Type de visite": r.typeDemandeVisite ?? "-",
        "Statut": STATUS_VISITE_LABELS[r.statusDemandeVisite] ?? r.statusDemandeVisite ?? "-",
        "Date de création": r.createdAt ? new Intl.DateTimeFormat("fr-FR").format(new Date(r.createdAt)) : "-",
    };
}

export function ListDemandeVisiteTable({filters, activeMenu}: Props) {
    const location = useLocation();
    const translate = useTranslate();
    const {tableProps, filters: currentFilters, setFilters, tableQuery} = useTable({
        resource: "demandes-visites",
        syncWithLocation: true,
        sorters: {
            initial: [{
                field: "createdAt",
                order: "desc"
            }]
        },
    });

    const exportFilters = [
        ...(filters?.permanent ?? []),
        ...(currentFilters ?? []),
    ];

    return (
        <>
            <DemandeVisiteTabs activeMenu={activeMenu} />
            <List
                title={translate("demandes_visites.fields.demandes_visites")}
                headerButtons={[
                    <SearchInput
                        setFilters={setFilters}
                        tableQuery={tableQuery}
                    />,
                    <ExportTableButton
                        resource="demandes-visites"
                        mapToRow={mapDemandeVisiteToRow}
                        pdfTitle="Liste des Demandes de Visite"
                        filters={exportFilters}
                        filenamePrefix={`demandes_visites_${activeMenu ?? "tous"}`}
                    />,
                ]}
            >
                <Table {...tableProps} rowKey="id">
                    <Table.Column
                        dataIndex="clientPhoneNumber"
                        title={translate(
                            "demandes_visites.fields.client_phone_number",
                        )}
                        align="center"
                    />
                    <Table.Column
                        dataIndex="typeDemandeVisite"
                        title={translate(
                            "demandes_visites.fields.type_demande_visite",
                        )}
                        render={(value) => <OutlineTag color="#185FA5">{translate(`demandes_visites.fields.${value}`)}</OutlineTag>}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex="statusDemandeVisite"
                        title={translate(
                            "demandes_visites.fields.status_demande_visite",
                        )}
                        render={(value) => <StatusValidationDemandeVisiteTag statusValidation={value}/>}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex="statusFacture"
                        title={translate("demandes_visites.fields.status_facture")}
                        align="center"
                        render={(value) => <OutlineTag color="#494C57">{translate(`demandes_visites.fields.${value}`)}</OutlineTag>}
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex={["retraitProEffectue"]}
                        title={translate(
                            "demandes_visites.fields.retrait_pro_effectue",
                        )}
                        render={(value: any) => <BooleanField value={value}/>}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex={["createdAt"]}
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
                            <>
                                <Link to={`/demandes-visites/edit/${record.id}`} state={{ from: location.pathname + location.search }}>
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
                            </>
                        )}
                    />
                </Table>
            </List>
        </>
    );
}
