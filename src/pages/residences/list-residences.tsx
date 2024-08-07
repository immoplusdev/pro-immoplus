import React from "react";
import {BaseRecord, useTranslate} from "@refinedev/core";
import {
    useTable,
    List,
    EditButton,
    ShowButton,
    DeleteButton,
    BooleanField,
    DateField,
} from "@refinedev/antd";
import {Table, Space} from "antd";
import {StatusValidationResidenceTag} from "@/pages/residences/components";
import {StatusValidationResidence} from "@/core/domain/residences";
import {Thumbnail} from "@/components";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";

export const ListResidences = () => {
    const translate = useTranslate();
    const {tableProps} = useTable({
        syncWithLocation: true,
    });

    return (
        <List title={translate("pages.residence.residences")}>
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="miniature"
                    title={translate("fields.miniature")}
                    render={(value: string) => <Thumbnail src={getApiFileUrl(value)}/>}
                />
                <Table.Column
                    dataIndex="nom"
                    title={translate("fields.nom")}
                />
                <Table.Column
                    dataIndex="typeResidence"
                    title={translate("residences.fields.type_residence")}
                />

                <Table.Column
                    dataIndex="adresse"
                    title={translate("fields.adresse")}
                />

                <Table.Column
                    dataIndex="statusValidation"
                    title={translate("fields.status_validation")}
                    render={(value: StatusValidationResidence) => <StatusValidationResidenceTag
                        statusValidation={value}/>}
                />
                <Table.Column
                    dataIndex="prixReservation"
                    title={translate("fields.prix_reservation")}
                    render={(value: number) => <span>{formatAmount(value)}</span>}
                />
                <Table.Column
                    dataIndex="nombreMaxOccupants"
                    title={translate("residences.fields.nombre_max_occupants")}
                    render={(value: boolean) => <BooleanField value={value}/>}
                />
                <Table.Column
                    dataIndex={["animauxAutorises"]}
                    title={translate("residences.fields.animaux_autorises")}
                    render={(value: any) => <BooleanField value={value}/>}
                />
                <Table.Column
                    dataIndex={["fetesAutorises"]}
                    title={translate("residences.fields.fetes_autorises")}
                    render={(value: any) => <BooleanField value={value}/>}
                />
                <Table.Column
                    dataIndex={["createdAt"]}
                    title={translate("fields.created_at")}
                    render={(value: any) => <DateField value={value}/>}
                />
                <Table.Column
                    title={translate("table.actions")}
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <EditButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                            <ShowButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
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
};
