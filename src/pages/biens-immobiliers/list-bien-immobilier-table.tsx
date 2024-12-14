import {BaseRecord, useTranslate} from "@refinedev/core";
import {BooleanField, DateField, DeleteButton, List, useTable} from "@refinedev/antd";
import {Button, Space, Table, Tag} from "antd";
import {Thumbnail} from "@/components";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";
import {
    StatusValidationBiensImmobilersTag
} from "@/pages/biens-immobiliers/components/status-validation-biens-immobilers-tag";
import {Link} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import {CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";
import {SearchInput} from "@/components/filters";
import {DateDisplayField} from "@/components/table";


type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: "all_e" | "en_validation" | "valide" | "disponible" | "non_disponible";
}

export function ListBienImmobilierTable({filters, activeMenu}: Props) {
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

    return (
        <List
            headerButtons={[
                <SearchInput
                    setFilters={setFilters}
                    tableQuery={tableQuery}
                />,
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
                    render={(value: string) => <Thumbnail src={getApiFileUrl(value[0])}/>}
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
                            <Link to={`/biens-immobiliers/edit/${record.id}`}>
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
