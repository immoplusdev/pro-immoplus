import React from "react";
import { useTranslate } from "@refinedev/core";
import { useTable, List } from "@refinedev/antd";
import { Table, Tag } from "antd";
import { DateDisplayField } from "@/components/table";
import { SearchInput } from "@/components/filters";
import type { UserPreference } from "@/core/domain/user-preferences";
import { formatAmount } from "@/lib/helpers";

export const ListUserPreferencesTable = () => {
  const translate = useTranslate();
  const { tableProps, setFilters, tableQuery } = useTable<UserPreference>({
    resource: "user-preferences",
    syncWithLocation: true,
    pagination: {
      pageSize: 10,
      mode: "server",
    },
    sorters: {
      initial: [{ field: "createdAt", order: "desc" }],
    },
  });

  return (
    <List
      title={translate("user_preferences.title")}
      headerButtons={[
        <SearchInput
          key="search"
          setFilters={setFilters}
          tableQuery={tableQuery}
        />,
      ]}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["user", "firstName"]}
          title={translate("user_preferences.fields.user_firstname")}
          align="center"
          render={(_, record: UserPreference) =>
            `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.trim()
          }
        />
        <Table.Column
          dataIndex={["user", "email"]}
          title={translate("user_preferences.fields.user_email")}
          align="center"
        />
        <Table.Column
          dataIndex={["user", "phoneNumber"]}
          title={translate("user_preferences.fields.user_phone")}
          align="center"
        />
        <Table.Column
          dataIndex={["intent", "name"]}
          title={translate("user_preferences.fields.intent")}
          align="center"
          render={(value: string) => value ? <Tag color="blue">{value}</Tag> : "-"}
        />
        <Table.Column
          dataIndex="propertyTypes"
          title={translate("user_preferences.fields.property_types")}
          align="center"
          render={(propertyTypes: UserPreference["propertyTypes"]) =>
            propertyTypes?.length
              ? propertyTypes.map((pt) => (
                  <Tag key={pt.id} color="green">{pt.name}</Tag>
                ))
              : "-"
          }
        />
        <Table.Column
          dataIndex="locations"
          title={translate("user_preferences.fields.locations")}
          align="center"
          render={(locations: UserPreference["locations"]) =>
            locations?.length
              ? locations.map((loc) => (
                  <Tag key={loc.id}>{loc.name}</Tag>
                ))
              : "-"
          }
        />
        <Table.Column
          dataIndex="budgetMin"
          title={translate("user_preferences.fields.budget_min")}
          align="center"
          sorter
          render={(value: string) =>
            value ? formatAmount(parseInt(value, 10)) : "-"
          }
        />
        <Table.Column
          dataIndex="budgetMax"
          title={translate("user_preferences.fields.budget_max")}
          align="center"
          sorter
          render={(value: string) =>
            value ? formatAmount(parseInt(value, 10)) : "-"
          }
        />
        <Table.Column
          dataIndex="createdAt"
          title={translate("fields.created_at")}
          align="center"
          sorter
          render={(date: string) => <DateDisplayField value={date} />}
        />
      </Table>
    </List>
  );
};
