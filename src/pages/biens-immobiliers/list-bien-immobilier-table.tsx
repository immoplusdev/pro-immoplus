import {BaseRecord, useTranslate} from "@refinedev/core";
import {BooleanField, DateField, DeleteButton, List, useTable} from "@refinedev/antd";
import {Button, Divider, Space, Table, Tag} from "antd";
import {Thumbnail} from "@/components";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";
import {
    StatusValidationBiensImmobilersTag
} from "@/pages/biens-immobiliers/components/status-validation-biens-immobilers-tag";
import {Link, useLocation} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import {SearchInput} from "@/components/filters";
import {DateDisplayField} from "@/components/table";
import {ExportTableButton} from "@/components/export/export-table-button";


type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: "all_e" | "en_validation" | "valide" | "disponible" | "non_disponible";
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
        <List
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
                <Divider type="vertical" style={{ height: 24, margin: "0 4px" }} />,
                <Link to="/biens-immobiliers">

                    <Button
                        type={activeMenu == "all_e" ? "primary" : "default"}
                    >
                        {translate("tags.all_e")}
                    </Button>
                </Link>,
                <Link to="/biens-immobiliers/en-validation">
                    <Button type={activeMenu == "en_validation" ? "primary" : "default"}>
                        {translate("biens_immobiliers.fields.en_validation")}
                    </Button>
                </Link>,
                <Link
                    to="/biens-immobiliers/validé"
                >
                    <Button
                        type={activeMenu == "valide" ? "primary" : "default"}
                    >
                        {translate("biens_immobiliers.fields.valide")}
                    </Button>
                </Link>,
                <Link
                    to="/biens-immobiliers/non-disponible"
                >
                    <Button
                        type={activeMenu == "non_disponible" ? "primary" : "default"}
                    >
                        {translate("biens_immobiliers.fields.non_disponible")}
                    </Button>
                </Link>,
                <Link
                    to="/biens-immobiliers/disponible"
                >
                    <Button
                        type={activeMenu == "disponible" ? "primary" : "default"}
                    >
                        {translate("biens_immobiliers.fields.disponible")}
                    </Button>
                </Link>
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
                    render={(value: string) => <Tag>{value}</Tag>}
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
                    render={(value: number) => <Tag color="blue">{value ?? 0}</Tag>}
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
                        <Space>
                            <Link to={`/biens-immobiliers/edit/${record.id}`} state={{ from: location.pathname + location.search }}>
                                <Button
                                    size="small"
                                    icon={<ArrowRightOutlined/>}

                                />
                            </Link>
                            {/*<ShowButton*/}
                            {/*    hideText*/}
                            {/*    size="small"*/}
                            {/*    recordItemId={record.id}*/}
                            {/*/>*/}
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
    );
}
