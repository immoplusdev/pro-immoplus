import {BaseRecord, useTranslate} from "@refinedev/core";
import {DeleteButton, List, useTable} from "@refinedev/antd";
import {Button, Space, Table} from "antd";
import {Thumbnail} from "@/components";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";
import {Link, useLocation} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import React from "react";
import {SearchInput} from "@/components/filters";
import {DateDisplayField, OutlineTag} from "@/components/table";
import {ExportTableButton} from "@/components/export/export-table-button";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

function mapFurnitureToRow(r: any, i: number): Record<string, string> {
    return {
        "#": String(i + 1),
        "Titre": r.titre ?? "-",
        "Type": r.type ?? "-",
        "Catégorie": r.category ?? "-",
        "État": r.etat ?? "-",
        "Prix": r.prix != null ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(Number(r.prix)) : "-",
        "Statut": r.status ?? "-",
        "Score": r.score != null ? String(r.score) : "-",
        "Adresse": r.adresse ?? "-",
        "Date de création": r.createdAt ? new Intl.DateTimeFormat("fr-FR").format(new Date(r.createdAt)) : "-",
    };
}

export function ListFurnituresTable() {
    const translate = useTranslate();
    const location = useLocation();
    const {tableProps, filters: currentFilters, setFilters, tableQuery} = useTable({
        resource: "furnitures",
        syncWithLocation: true,
        sorters: {
            initial: [{
                field: "createdAt",
                order: "desc"
            }]
        },
    });

    const getEtatColor = (etat: string) => {
        switch (etat?.toLowerCase()) {
            case "neuf":
                return "#1F8A5B";
            case "occasion":
                return "#B86B0A";
            default:
                return TEXT_SECONDARY;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "#1F8A5B";
            default:
                return TEXT_SECONDARY;
        }
    };

    return (
        <List
            headerButtons={[
                <SearchInput
                    key="search"
                    setFilters={setFilters}
                    tableQuery={tableQuery}
                />,
                <ExportTableButton
                    key="export"
                    resource="furnitures"
                    mapToRow={mapFurnitureToRow}
                    pdfTitle="Liste des Meubles"
                    filters={currentFilters ?? []}
                    filenamePrefix="meubles"
                />,
            ]}
        >
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="images"
                    title={translate("fields.miniature")}
                    align="center"
                    render={(value: string | string[]) => {
                        const imageId = Array.isArray(value) ? value[0] : value;
                        return <Thumbnail src={getApiFileUrl(imageId ?? "")}/>;
                    }}
                />
                <Table.Column
                    dataIndex="titre"
                    title={translate("furnitures.fields.titre")}
                    align="center"
                    sorter={true}
                />
                <Table.Column
                    dataIndex="type"
                    title={translate("furnitures.fields.type")}
                    align="center"
                    render={(value: string) => <OutlineTag color={TEXT_SECONDARY}>{value}</OutlineTag>}
                    sorter={true}
                />
                <Table.Column
                    dataIndex="category"
                    title={translate("furnitures.fields.category")}
                    align="center"
                    render={(value: string) => <OutlineTag color={TEXT_SECONDARY}>{value}</OutlineTag>}
                    sorter={true}
                />
                <Table.Column
                    dataIndex="etat"
                    title={translate("furnitures.fields.etat")}
                    align="center"
                    render={(value: string) => <OutlineTag color={getEtatColor(value)}>{value}</OutlineTag>}
                    sorter={true}
                />
                <Table.Column
                    dataIndex="prix"
                    title={translate("furnitures.fields.prix")}
                    align="center"
                    render={(value: number) => <span>{formatAmount(value)}</span>}
                    sorter={true}
                />
                <Table.Column
                    dataIndex="status"
                    title={translate("furnitures.fields.status")}
                    align="center"
                    render={(value: string) => <OutlineTag color={getStatusColor(value)}>{value}</OutlineTag>}
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
                    dataIndex="adresse"
                    title={translate("furnitures.fields.adresse")}
                    align="center"
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
                            <Link to={`/furnitures/edit/${record.id}`} state={{ from: location.pathname + location.search }}>
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
    );
}
