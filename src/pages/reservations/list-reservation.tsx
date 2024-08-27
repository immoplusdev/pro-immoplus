import React from "react";
import { BaseRecord, useTranslate, useMany } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  BooleanField,
  DateField, useModalForm,
} from "@refinedev/antd";
import { Table, Space } from "antd";

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
              dataIndex="id"
              title={translate("reservations.fields.id")}
          />
          <Table.Column
              dataIndex="statusReservation"
              title={translate("reservations.fields.statusReservation")}
          />

          <Table.Column
              dataIndex="statusFacture"
              title={translate("reservations.fields.statusFacture")}
          />
          <Table.Column
              dataIndex={["retraitProEffectue"]}
              title={translate("reservations.fields.retraitProEffectue")}
              render={(value: any) => <BooleanField value={value} />}
          />
          <Table.Column
              dataIndex="montantTotalReservation"
              title={translate(
                  "reservations.fields.montantTotalReservation",
              )}
          />
          <Table.Column
              dataIndex="montantReservationSansCommission"
              title={translate(
                  "reservations.fields.montantReservationSansCommission",
              )}
          />
          <Table.Column
              dataIndex="notes"
              title={translate("reservations.fields.notes")}
          />
          <Table.Column
              dataIndex="clientPhoneNumber"
              title={translate("reservations.fields.clientPhoneNumber")}
          />
          <Table.Column
              dataIndex={["createdAt"]}
              title={translate("reservations.fields.createdAt")}
              render={(value: any) => <DateField value={value} />}
          />
          <Table.Column
              dataIndex={["updatedAt"]}
              title={translate("reservations.fields.updatedAt")}
              render={(value: any) => <DateField value={value} />}
          />
          <Table.Column
              dataIndex={["residenceId"]}
              title={translate("reservations.fields.residenceId")}
              render={(value) => (
                  <span title="Inferencer failed to render this field (Cannot find key)">
                            Cannot Render
                        </span>
              )}
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
