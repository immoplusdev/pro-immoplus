import React from "react";
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
import {Table, Space, Tag} from "antd";
import {StatusValidationReservation, statusValidationReservation} from "@/core/domain/reservations";
import {StatusValidationReservationTag} from "@/pages/reservations/components";

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
          />
          <Table.Column
              dataIndex="statusReservation"
              title={translate("reservations.fields.status_reservation")}
          />

          <Table.Column
              dataIndex="statusFacture"
              title={translate("reservations.fields.status_facture")}
              render={(value: StatusValidationReservation) => <StatusValidationReservationTag
                  statusValidation={value}/>}
          />
          <Table.Column
              dataIndex={["retraitProEffectue"]}
              title={translate("reservations.fields.retrait_pro_effectue")}
              render={(value: any) => <BooleanField value={value} />}
          />
          <Table.Column
              dataIndex="montantTotalReservation"
              title={translate(
                  "reservations.fields.montant_total_reservation",
              )}
          />
          <Table.Column
              dataIndex="montantReservationSansCommission"
              title={translate(
                  "reservations.fields.montant_reservation_sans_commission",
              )}
          />
          <Table.Column
              dataIndex="notes"
              title={translate("fields.notes")}
          />0
          <Table.Column
              dataIndex="clientPhoneNumber"
              title={translate("fields.client_phone_number")}
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
