import React from "react";
import { ListUserPreferencesTable } from "./components/list-user-preferences-table";
import { UserPreferencesTabs } from "./components/user-preferences-tabs";

export const ListUserPreferences = () => {
  return (
    <>
      <UserPreferencesTabs activeMenu="all" />
      <ListUserPreferencesTable />
    </>
  );
};
