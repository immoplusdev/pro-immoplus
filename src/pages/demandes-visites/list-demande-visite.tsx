import React from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  BooleanField,
} from "@refinedev/antd";
import {Table, Space, Button} from "antd";
import {Link} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import {
    StatusValidationDemandeVisiteTag
} from "@/pages/demandes-visites/components/status-validation-demande-visite-tag";
import {ListDemandeVisiteTable} from "@/pages/demandes-visites/components/list-demande-visite-table";

export const ListDemandeVisites = () => {
    return(
            <ListDemandeVisiteTable activeMenu={"all_e"}/>
        )

};
