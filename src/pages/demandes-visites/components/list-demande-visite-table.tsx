import {BaseRecord, useTranslate} from "@refinedev/core";
import {BooleanField, DeleteButton, List, useTable} from "@refinedev/antd";
import {Button, Space, Table, Tag} from "antd";
import {
    StatusValidationDemandeVisiteTag
} from "@/pages/demandes-visites/components/status-validation-demande-visite-tag";
import {Link} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import React from "react";
import type {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {SearchInput} from "@/components/filters";
import {DateDisplayField} from "@/components/table";


type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: "all_e" | "en_validation" | "valide"
}

export function ListDemandeVisiteTable({filters, activeMenu}: Props) {
    const translate = useTranslate();
    const {tableProps, setFilters, tableQuery} = useTable({
        resource: "demandes-visites",
        syncWithLocation: true,
        sorters: {
            initial: [{
                field: "createdAt",
                order: "desc"
            }]
        },
        filters
    });

    return (
        <List
            title={translate("demandes_visites.fields.demandes_visites")}
            headerButtons={[
                <SearchInput
                    setFilters={setFilters}
                    tableQuery={tableQuery}
                />,
                <Link to="/demandes-visites">
                    <Button
                        type={activeMenu == "all_e" ? "primary" : "default"}
                    >
                        {translate("tags.all_e")}
                    </Button>
                </Link>,
                <Link to="/demandes-visites/en-validation">
                    <Button
                        type={activeMenu == "en_validation" ? "primary" : "default"}
                    >
                        {translate("demandes_visites.fields.en_validation")}
                    </Button>
                </Link>,
                <Link to="/demandes-visites/validé">
                    <Button
                        type={activeMenu == "valide" ? "primary" : "default"}
                    >
                        {translate("demandes_visites.fields.valide")}
                    </Button>
                </Link>
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
                    render={(value) => <Tag>{translate(`demandes_visites.fields.${value}`)}</Tag>}
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
                    render={(value) => <Tag>{translate(`demandes_visites.fields.${value}`)}</Tag>}
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
                        <Space>
                            <Link to={`/demandes-visites/edit/${record.id}`}>
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
