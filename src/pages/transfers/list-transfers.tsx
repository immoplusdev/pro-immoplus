import React from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Tag, Space } from "antd";
import { useTranslate } from "@refinedev/core";
import { formatAmount } from "@/lib/helpers";

export const ListTransfers: React.FC = () => {
  const translate = useTranslate();

  const { tableProps } = useTable({
    resource: "transfers",
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "blue";
      case "pending":
        return "blue";
      case "successful":
        return "green";
      case "failed":
        return "red";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getTransferTypeColor = (type: string) => {
    switch (type) {
      case "BANK_TRANSFER":
        return "blue";
      case "MOBILE_MONEY":
        return "green";
      case "CASH":
        return "gold";
      case "WIRE_TRANSFER":
        return "purple";
      case "DIGITAL_WALLET":
        return "cyan";
      default:
        return "default";
    }
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="id"
          title="ID"
          render={(value) => value?.substring(0, 8) + "..."}
        />
        <Table.Column
          dataIndex="amount"
          title={translate("transfers.fields.amount")}
          render={(value, record) =>
            `${formatAmount(value)}`
          }
        />
        <Table.Column
          dataIndex="customer"
          title={translate("transfers.fields.customer")}
          render={(value) => ((value?.firstName??"") + " " + (value?.lastName??"")).trim() || translate("common.notAvailable")}
        />
        <Table.Column
          dataIndex="transfetStatus"
          title={translate("transfers.fields.status")}
          render={(value) => (
            <Tag color={getStatusColor(value)}>
              {translate(`transfers.status.${value?.toLowerCase()}`)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="transferType"
          title={translate("transfers.fields.transferType")}
          render={(value) => (
            <Tag color={getTransferTypeColor(value)}>
              {translate(`transfers.transferType.${value?.toLowerCase()}`)}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="recipientName"
          title={translate("transfers.fields.recipientName")}
          render={(value) => value || translate("common.notAvailable")}
        />
        <Table.Column
          dataIndex="country"
          title={translate("transfers.fields.country")}
        />
        <Table.Column
          dataIndex="createdAt"
          title={translate("fields.created_at")}
          render={(value) => <DateField value={value} />}
        />
        <Table.Column
          title={translate("table.actions")}
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export default ListTransfers;