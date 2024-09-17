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
import {EditOutlined, EyeOutlined} from "@ant-design/icons";

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
    const {tableProps} = useTable(
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
                    title={translate("fields.miniature")}
                    render={(value: string) => <Thumbnail src={getApiFileUrl(value)}/>}
                    align="center"
                />
                <Table.Column
                    dataIndex="nom"
                    title={translate("fields.nom")}
                    align="center"
                />
                <Table.Column
                    dataIndex="typeResidence"
                    title={translate("residences.fields.type_residence")}
                    render={(value: string) => <TypeResidenceTag typeResidence={value}/>}
                    align="center"
                />

                {/*<Table.Column*/}
                {/*    dataIndex="adresse"*/}
                {/*    title={translate("fields.adresse")}*/}
                {/*/>*/}


                <Table.Column
                    dataIndex="prixReservation"
                    title={translate("fields.prix_reservation")}
                    render={(value: number) => <span>{formatAmount(value)}</span>}
                    align="center"
                />
                {/*<Table.Column*/}
                {/*    dataIndex="nombreMaxOccupants"*/}
                {/*    title={translate("residences.fields.nombre_max_occupants")}*/}
                {/*    render={(value: boolean) => <BooleanField value={value}/>}*/}
                {/*/>*/}
                {/*<Table.Column*/}
                {/*    dataIndex={["animauxAutorises"]}*/}
                {/*    title={translate("residences.fields.animaux_autorises")}*/}
                {/*    render={(value: any) => <BooleanField value={value}/>}*/}
                {/*/>*/}
                {/*<Table.Column*/}
                {/*    dataIndex={["fetesAutorises"]}*/}
                {/*    title={translate("residences.fields.fetes_autorises")}*/}
                {/*    render={(value: any) => <BooleanField value={value}/>}*/}
                {/*/>*/}
                <Table.Column
                    dataIndex="statusValidation"
                    title={translate("fields.status_validation")}
                    render={(value: StatusValidationResidence) => <StatusValidationResidenceTag
                        statusValidation={value}/>}
                    align="center"
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
                                    icon={<EditOutlined/>}

                                />
                            </Link>
                            <Link to={`/residences/show/${record.id}`}>
                                <Button
                                    size="small"
                                    icon={<EyeOutlined/>}/>
                            </Link>
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