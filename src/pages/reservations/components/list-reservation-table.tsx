import { CrudFilter } from "@refinedev/core/src/contexts/data/types";
import { BaseRecord, useTranslate } from "@refinedev/core";
import {
  BooleanField,
  DateField,
  DeleteButton,
  List,
  useTable,
} from "@refinedev/antd";
import { Button, Space, Table, Tag } from "antd";
import { StatusValidationReservation } from "@/core/domain/reservations";
import { StatusValidationReservationTag } from "@/pages/reservations/components/status-validation-reservation-tag";
import { formatAmount } from "@/lib/helpers";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import React from "react";
import { SearchInput } from "@/components/filters";

type Props = {
  activeMenu: "all_e" | "en_validation" | "valide";
  filters?: {
    initial?: CrudFilter[];
    permanent?: CrudFilter[];
    mode?: "server" | "off";
  };
};

export function ListReservationTable({ activeMenu, filters }: Props) {
  const translate = useTranslate();
  const {
    tableProps,
    filters: searchFilters,
    setFilters,
    tableQuery,
  } = useTable({
    resource: "reservations",
    syncWithLocation: true,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    filters,
  });

  return (
    <List
      title={translate("pages.reservation.reservations")}
      headerButtons={[
        <SearchInput
          filters={searchFilters}
          setFilters={setFilters}
          tableQuery={tableQuery}
        />,
        <Link to="/reservations">
          <Button type={activeMenu == "all_e" ? "primary" : "default"}>
            {translate("tags.all_e")}
          </Button>
        </Link>,
        <Link to="/reservations/en-validation">
          <Button type={activeMenu == "en_validation" ? "primary" : "default"}>
            {translate("reservations.fields.en_validation")}
          </Button>
        </Link>,
        <Link to="/reservations/validé">
          <Button type={activeMenu == "valide" ? "primary" : "default"}>
            {translate("reservations.fields.valide")}
          </Button>
        </Link>,
      ]}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="clientPhoneNumber"
          title={translate("fields.client_phone_number")}
          align="center"
        />
        <Table.Column
          dataIndex="statusReservation"
          title={translate("reservations.fields.status_reservation")}
          render={(value) => (
            <Tag>{translate(`reservations.fields.${value}`)}</Tag>
          )}
          align="center"
          sorter={true}
        />
        <Table.Column
          dataIndex="statusFacture"
          title={translate("reservations.fields.status_facture")}
          render={(value: StatusValidationReservation) => (
            <StatusValidationReservationTag statusValidation={value} />
          )}
          align="center"
          sorter={true}
        />
        <Table.Column
          dataIndex="montantTotalReservation"
          title={translate("reservations.fields.montant_total_reservation")}
          render={(value: number) => <span>{formatAmount(value)}</span>}
          align="center"
          sorter={true}
        />
        <Table.Column
          dataIndex="montantReservationSansCommission"
          title={translate(
            "reservations.fields.montant_reservation_sans_commission",
          )}
          render={(value: string) => <span>{formatAmount(value)}</span>}
          align="center"
          sorter={true}
        />
        <Table.Column
          dataIndex={["retraitProEffectue"]}
          title={translate("reservations.fields.retrait_pro_effectue")}
          render={(value: any) => <BooleanField value={value} />}
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
              <Link to={`/reservations/edit/${record.id}`}>
                <Button size="small" icon={<ArrowRightOutlined />} />
              </Link>
              {/*<ShowButton*/}
              {/*    hideText*/}
              {/*    size="small"*/}
              {/*    recordItemId={record.id}*/}
              {/*/>*/}
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
