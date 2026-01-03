import {Button, Space, Table, Tag} from "antd";
import {Thumbnail} from "@/components";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";
import {StatusValidationResidence} from "@/core/domain/residences";
import {StatusValidationResidenceTag} from "@/pages/residences/components";
import {DeleteButton, EditButton, List, ShowButton, useTable} from "@refinedev/antd";
import {BaseRecord, useTranslate} from "@refinedev/core";
import React from "react";
import {type CrudFilter} from "@refinedev/core/src/contexts/data/types";
import {TypeResidenceTag} from "@/pages/residences/components/type-residence-tag";
import {Link} from "react-router-dom";
import {ArrowRightOutlined, EditOutlined, EyeOutlined} from "@ant-design/icons";
import {
    StatusValidationBiensImmobilersTag
} from "@/pages/biens-immobiliers/components/status-validation-biens-immobilers-tag";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";
import {SearchInput} from "@/components/filters";

type Props = {
    filters?: {
        initial?: CrudFilter[];
        permanent?: CrudFilter[];
        mode?: "server" | "off";
    };
    activeMenu?: "all_e" | "en_validation" | "valide"
}

export function ListResidenceTable({filters, activeMenu}: Props) {
    const translate = useTranslate();
    const {tableProps, setFilters, filters: searchFilters, tableQuery} = useTable(
        {
            resource: "residences",
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
            title={translate("pages.residence.residences")}
            headerButtons={[
                <SearchInput
                    filters={searchFilters}
                    setFilters={setFilters}
                    tableQuery={tableQuery}
                />,
                <Link to="/residences">
                    <Button
                        type={activeMenu == "all_e" ? "primary" : "default"}
                    >
                        {translate("tags.all_e")}
                    </Button>
                </Link>,
                <Link to="/residences/en-validation">
                    <Button
                        type={activeMenu == "en_validation" ? "primary" : "default"}
                    >
                        {translate("tags.en_validation")}
                    </Button>
                </Link>,
                <Link to="/residences/validé">
                    <Button
                        type={activeMenu == "valide" ? "primary" : "default"}
                    >
                        {translate("residences.status_validation.valide")}
                    </Button>
                </Link>
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
                    title={translate("table.actions")}
                    dataIndex="actions"
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <Link to={`/residences/edit/${record.id}`}>
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
