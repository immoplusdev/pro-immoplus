import React, {useState} from "react";
import {useTranslate, useMany, BaseRecord} from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  BooleanField,
  DateField, useModalForm,
} from "@refinedev/antd";
import {Table, Space, Tag, Modal} from "antd";
import {StatusValidationReservation, statusValidationReservation} from "@/core/domain/reservations";
import {StatusValidationReservationTag} from "@/pages/reservations/components";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";

export const ListReservations = () => {
  const translate = useTranslate();
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

    return (
      <List
        title={translate("pages.reservation.reservations")}>
        <Table {...tableProps} rowKey="id">
              <Table.Column
                  dataIndex="datesReservation"
                  title={translate("reservations.fields.date")}
                  render={(dateObjects: Record<string, any>[])=> {
                    return (
                        <div>
                          {
                            dateObjects.map((dateObject)=>(
                                <Tag>{new Date(dateObject.date).toLocaleDateString()}</Tag>
                            ))
                          }
                        </div>
                    );
                  }}
                  align="center"
              />
              <Table.Column
                  dataIndex="statusReservation"
                  title={translate("reservations.fields.status_reservation")}
                  align="center"
              />
              <Table.Column
                  dataIndex="statusFacture"
                  title={translate("reservations.fields.status_facture")}
                  render={(value: StatusValidationReservation) => <StatusValidationReservationTag
                      statusValidation={value}/>}
                  align="center"
              />
              <Table.Column
                  dataIndex={["retraitProEffectue"]}
                  title={translate("reservations.fields.retrait_pro_effectue")}
                  render={(value: any) => <BooleanField value={value} />}
                  align="center"
              />
              <Table.Column
                  dataIndex="montantTotalReservation"
                  title={translate(
                      "reservations.fields.montant_total_reservation",
                  )}
                  align="center"
              />
              <Table.Column
                  dataIndex="montantReservationSansCommission"
                  title={translate(
                      "reservations.fields.montant_reservation_sans_commission",
                  )}
                  align="center"
              />
              <Table.Column
                  dataIndex="notes"
                  title={translate("fields.notes")}
                  align="center"
              />
              <Table.Column
                  dataIndex="clientPhoneNumber"
                  title={translate("fields.client_phone_number")}
                  align="center"
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
