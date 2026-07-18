import {Button, Divider, Space, Table, Tag} from "antd";
import {Thumbnail} from "@/components";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";
import {StatusValidationResidence} from "@/core/domain/residences";
import {StatusValidationResidenceTag} from "@/pages/residences/components";
import {DeleteButton, EditButton, List, ShowButton, useTable} from "@refinedev/antd";
import {BaseRecord, useTranslate} from "@refinedev/core";
import React from "react";
import {type CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {TypeResidenceTag} from "@/pages/residences/components/type-residence-tag";
import {Link, useLocation} from "react-router-dom";
import {ArrowRightOutlined, EditOutlined, EyeOutlined} from "@ant-design/icons";
import {
    StatusValidationBiensImmobilersTag
} from "@/pages/biens-immobiliers/components/status-validation-biens-immobilers-tag";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";
import {SearchInput} from "@/components/filters";
import {ExportTableButton} from "@/components/export/export-table-button";
import {ResidenceTabKey, ResidenceTabsNav} from "@/pages/residences/components/residence-tabs-nav";

const STATUS_RESIDENCE_LABELS: Record<string, string> = {
    valide: "Validée",
    en_attente_validation: "En attente de validation",
    rejete: "Rejetée",
};

function mapResidenceToRow(r: any, i: number): Record<string, string> {
    return {
        "#": String(i + 1),
        "Nom": r.nom ?? "-",
        "Type": r.typeResidence ?? "-",
        "Prix réservation": r.prixReservation != null
            ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(Number(r.prixReservation))
            : "-",
        "Réduction": r.reduction ? `${r.reduction}%` : "-",
        "Score": r.score != null ? String(r.score) : "-",
        "Statut validation": STATUS_RESIDENCE_LABELS[r.statusValidation] ?? r.statusValidation ?? "-",
        "Date de création": r.createdAt ? new Intl.DateTimeFormat("fr-FR").format(new Date(r.createdAt)) : "-",
        "Dernière mise à jour": r.updatedAt ? new Intl.DateTimeFormat("fr-FR").format(new Date(r.updatedAt)) : "-",
    };
}

type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: ResidenceTabKey
}

export function ListResidenceTable({filters, activeMenu}: Props) {
    const translate = useTranslate();
    const location = useLocation();
    const {tableProps, setFilters, filters: searchFilters, tableQuery} = useTable(
        {
            resource: "residences",
            syncWithLocation: true,
            sorters: {
                initial: [{
                    field: "updatedAt",
                    order: "desc"
                }]
            },
            filters
        });

    const exportFilters = [
        ...(filters?.permanent ?? []),
        ...(searchFilters ?? []),
    ];

    return (
        <List
            title={translate("pages.residence.residences")}
            headerButtons={[
                <SearchInput
                    setFilters={setFilters}
                    tableQuery={tableQuery}
                />,
                <ExportTableButton
                    resource="residences"
                    mapToRow={mapResidenceToRow}
                    pdfTitle="Liste des Résidences"
                    filters={exportFilters}
                    filenamePrefix={`residences_${activeMenu ?? "tous"}`}
                />,
                <Divider type="vertical" style={{ height: 24, margin: "0 4px" }} />,
                <ResidenceTabsNav activeMenu={activeMenu} />
            ]}
        >
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="miniatureId"
                    title={translate("fields.images")}
                    render={(value: string) => <Thumbnail src={getApiFileUrl(value)}/>}
                    align="center"
                />
                <Table.Column
                    dataIndex="nom"
                    title={translate("fields.nom")}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="typeResidence"
                    title={translate("residences.fields.type_residence")}
                    render={(value: string) => <TypeResidenceTag typeResidence={value}/>}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="prixReservation"
                    title={translate("fields.prix_reservation")}
                    render={(value: number) => <span>{formatAmount(value)}</span>}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="reduction"
                    title={translate("tags.reduction")}
                    render={(value: number) => value ? <Tag color="gold">{value}%</Tag> : "-"}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="score"
                    title="Score"
                    render={(value: number) => <Tag color="blue">{value ?? 0}</Tag>}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="statusValidation"
                    title={translate("fields.status_validation")}
                    render={(value: StatusValidationBiensImmobilers) => <StatusValidationBiensImmobilersTag
                        statusValidation={value}/>}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex={["createdAt"]}
                    title={translate("fields.created_at")}
                    render={(date: string) => {
                        return (
                            <div>
                                <Tag>{new Date(date).toLocaleDateString()}</Tag>
                            </div>
                        );
                    }}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex={["updatedAt"]}
                    title={translate("fields.updated_at")}
                    render={(date: string) => {
                        return (
                            <div>
                                <Tag>{new Date(date).toLocaleDateString()}</Tag>
                            </div>
                        );
                    }}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    title={translate("table.actions")}
                    dataIndex="actions"
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <Link to={`/residences/edit/${record.id}`} state={{ from: location.pathname + location.search }}>
                                <Button
                                    size="small"
                                    icon={<ArrowRightOutlined/>}

                                />
                            </Link>
                            {/*<Link to={`/residences/show/${record.id}`}>*/}
                            {/*    <Button*/}
                            {/*        size="small"*/}
                            {/*        icon={<EyeOutlined/>}/>*/}
                            {/*</Link>*/}
                            <DeleteButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                        </Space>
                    )}
                />
            </Table>
        </List>
    )
}
