import {BaseRecord, useTranslate} from "@refinedev/core";
import {BooleanField, DateField, DeleteButton, List, useTable} from "@refinedev/antd";
import {Button, Table} from "antd";
import {Thumbnail} from "@/components";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";
import {
    StatusValidationBiensImmobilersTag
} from "@/pages/biens-immobiliers/components/status-validation-biens-immobilers-tag";
import {BiensImmobiliersTabs} from "@/pages/biens-immobiliers/components/biens-immobiliers-tabs";
import {OutlineTag} from "@/pages/biens-immobiliers/components/outline-tag";
import {Link, useLocation} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
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
    activeMenu?: "all_e" | "en_attente_validation" | "valide" | "disponible" | "non_disponible" | "rejete";
}

const STATUS_BIEN_LABELS: Record<string, string> = {
    valide: "Validé",
    en_attente_validation: "En attente de validation",
    rejete: "Rejeté",
};

function mapBienToRow(r: any, i: number): Record<string, string> {
    return {
        "#": String(i + 1),
        "Nom": r.nom ?? "-",
        "Type": r.typeBienImmobilier ?? "-",
        "Statut validation": STATUS_BIEN_LABELS[r.statusValidation] ?? r.statusValidation ?? "-",
        "Prix": r.prix != null ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(Number(r.prix)) : "-",
        "Disponible": r.bienImmobilierDisponible ? "Oui" : "Non",
        "Score": r.score != null ? String(r.score) : "-",
        "Date de création": r.createdAt ? new Intl.DateTimeFormat("fr-FR").format(new Date(r.createdAt)) : "-",
    };
}

export function ListBienImmobilierTable({filters, activeMenu}: Props) {
    const location = useLocation();
    const translate = useTranslate();
    const {tableProps, filters: currentFilters, setFilters, tableQuery} = useTable({
        resource: "biens-immobiliers",
        syncWithLocation: true,
        sorters: {
            initial: [{
                field: "createdAt",
                order: "desc"
            }]
        },
        filters
    });

    const exportFilters = [
        ...(filters?.permanent ?? []),
        ...(currentFilters ?? []),
    ];

    return (
        <>
            <BiensImmobiliersTabs activeMenu={activeMenu} />
            <List
                title={translate("biens_immobiliers.title")}
                headerButtons={[
                    <SearchInput
                        setFilters={setFilters}
                        tableQuery={tableQuery}
                    />,
                    <ExportTableButton
                        resource="biens-immobiliers"
                        mapToRow={mapBienToRow}
                        pdfTitle="Liste des Biens Immobiliers"
                        filters={exportFilters}
                        filenamePrefix={`biens_immobiliers_${activeMenu ?? "tous"}`}
                    />,
                ]}
            >
                <Table {...tableProps} rowKey="id">
                    <Table.Column
                        dataIndex="images"
                        title={translate("fields.images")}
                        align="center"
                        render={(value: string) => <Thumbnail src={getApiFileUrl(value??"")}/>}
                    />
                    <Table.Column
                        dataIndex="nom"
                        title={translate("fields.nom")}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex="typeBienImmobilier"
                        title={translate(
                            "biens_immobiliers.fields.type_bien_immobilier",
                        )}
                        render={(value: string) => <OutlineTag color="#185FA5">{value}</OutlineTag>}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex="statusValidation"
                        title={translate("fields.status_validation")}
                        align="center"
                        render={(value: StatusValidationBiensImmobilers) => <StatusValidationBiensImmobilersTag
                            statusValidation={value}/>}
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex="prix"
                        align="center"
                        render={(value: number) => <span>{formatAmount(value)}</span>}
                        title={translate("biens_immobiliers.fields.prix")}
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex={["bienImmobilierDisponible"]}
                        title={translate(
                            "biens_immobiliers.fields.disponible",
                        )}
                        render={(value: any) => <BooleanField value={value}/>}
                        align="center"
                        sorter={true}
                    />
                    <Table.Column
                        dataIndex="score"
                        title="Score"
                        render={(value: number) => <OutlineTag color="#2744DE">{value ?? 0}</OutlineTag>}
                        align="center"
                        sorter={true}
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
                            <>
                                <Link to={`/biens-immobiliers/edit/${record.id}`} state={{ from: location.pathname + location.search }}>
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
