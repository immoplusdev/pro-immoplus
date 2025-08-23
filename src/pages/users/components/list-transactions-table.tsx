import React from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import { useTable, List, DeleteButton, BooleanField } from "@refinedev/antd";
import { Table, Space, Button, Tag } from "antd";
import { Link, useParams } from "react-router-dom";
import type { CrudFilter } from "@refinedev/core/src/contexts/data/types";
import { ArrowRightOutlined } from "@ant-design/icons";
import { SearchInput } from "@/components/filters";
import { DateDisplayField } from "@/components/table";
import { formatAmount } from "@/lib/helpers";

type Props = {
  filters?: {
    initial?: CrudFilter[];
    permanent?: CrudFilter[];
    mode?: "server" | "off";
  };
  activeMenu?:
    | "all_e"
    | "admin"
    | "pro_entreprise"
    | "pro_particulier"
    | "utilisateurs_valides"
    | "utilisateurs_non_valides"
    | "customer";
};
export const ListUserTransactionsTable = ({ filters, activeMenu }: Props) => {
  const translate = useTranslate();
  const { id: ownerId } = useParams<{ id: string }>();

  const {
    tableProps,
    filters: searchFilters,
    setFilters,
    tableQuery,
  } = useTable({
    syncWithLocation: true,
    resource: "wallet-transactions",
    meta: {
      ownerId: ownerId,
      action: "getList",
    },
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
    <List title={translate("walletTransactions.title")}>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="type"
          title={translate("walletTransactions.fields.type")}
          align="center"
          sorter={true}
        />
        <Table.Column
          dataIndex="amount"
          title={translate("walletTransactions.fields.amount")}
          render={(value: number) => <span>{formatAmount(value)}</span>}
          align="center"
          sorter={true}
        />

        <Table.Column
          dataIndex={"isRealeased"}
          title={translate("walletTransactions.fields.is_realeased")}
          render={(value: any) => <BooleanField value={value} />}
          align="center"
          sorter={true}
        />
        <Table.Column
          dataIndex="note"
          title={"walletTransactions.fields.note"}
          align="center"
        />
        <Table.Column
          dataIndex="createdAt"
          title={translate("fields.created_at")}
          render={(date: string) => <DateDisplayField value={date} />}
          align="center"
          sorter={true}
        />
      </Table>
    </List>
  );
};
