import React from "react";
import { useTranslate } from "@refinedev/core";
import { useTable, List } from "@refinedev/antd";
import { Table } from "antd";
import { DateDisplayField, OutlineTag } from "@/components/table";
import { SearchInput } from "@/components/filters";
import type { UserPreference } from "@/core/domain/user-preferences";
import { formatAmount } from "@/lib/helpers";

const TEXT_SECONDARY = "#5F5E5A";

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
          render={(value: string) => value ? <OutlineTag color="#185FA5">{value}</OutlineTag> : "-"}
        />
        <Table.Column
          dataIndex="propertyTypes"
          title={translate("user_preferences.fields.property_types")}
          align="center"
          render={(propertyTypes: UserPreference["propertyTypes"]) =>
            propertyTypes?.length
              ? propertyTypes.map((pt) => (
                  <OutlineTag key={pt.id} color={TEXT_SECONDARY}>{pt.name}</OutlineTag>
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
                  <OutlineTag key={loc.id} color={TEXT_SECONDARY}>{loc.name}</OutlineTag>
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
