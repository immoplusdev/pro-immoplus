import React from "react";
import {
  List,
  useTable,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import { useTranslate } from "@refinedev/core";
import type { CrudFilter } from "@refinedev/core/src/contexts/data/types";
import { formatAmount } from "@/lib/helpers";
import { TransferTabs } from "./transfer-tabs";
import { OutlineTag } from "@/components/table";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type Props = {
  activeMenu?: "all" | "successful" | "pending" | "failed";
  filters?: {
    permanent?: CrudFilter[];
  };
};

export const ListTransfers: React.FC<Props> = ({ activeMenu = "all", filters }) => {
  const translate = useTranslate();

  const { tableProps } = useTable({
    resource: "transfers",
    filters: { permanent: filters?.permanent },
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
        return "#185FA5";
      case "pending":
        return "#B86B0A";
      case "successful":
        return "#1F8A5B";
      case "failed":
        return "#C13838";
      case "cancelled":
        return TEXT_SECONDARY;
      default:
        return TEXT_SECONDARY;
    }
  };

  const getTransferTypeColor = () => TEXT_SECONDARY;

  return (
    <>
      <TransferTabs activeMenu={activeMenu} />
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
            <OutlineTag color={getStatusColor(value)}>
              {translate(`transfers.status.${value?.toLowerCase()}`)}
            </OutlineTag>
          )}
        />
        <Table.Column
          dataIndex="transferType"
          title={translate("transfers.fields.transferType")}
          render={(value) => (
            <OutlineTag color={getTransferTypeColor()}>
              {translate(`transfers.transferType.${value?.toLowerCase()}`)}
            </OutlineTag>
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
              <EditButton
                hideText
                size="small"
                recordItemId={record.id}
                style={{background: "#FFFFFF", border: `1px solid ${BORDER_COLOR}`, color: TEXT_SECONDARY}}
              />
              <ShowButton
                hideText
                size="small"
                recordItemId={record.id}
                style={{background: "#FFFFFF", border: `1px solid ${BORDER_COLOR}`, color: TEXT_SECONDARY}}
              />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.id}
                style={{background: "#FFFFFF", border: "1px solid #C13838", color: "#C13838"}}
              />
            </Space>
          )}
        />
      </Table>
      </List>
    </>
  );
};

export default ListTransfers;