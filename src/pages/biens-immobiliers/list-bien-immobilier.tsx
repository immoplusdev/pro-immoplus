import React from "react";
import {BaseRecord, useTranslate} from "@refinedev/core";
import {
    useTable,
    List,
    DeleteButton,
    BooleanField,
} from "@refinedev/antd";
import {Table, Space, Tag, Button} from "antd";
import {formatAmount, getApiFileUrl} from "@/lib/helpers";
import {Thumbnail} from "@/components";
import {Link} from "react-router-dom";
import {ArrowRightOutlined} from "@ant-design/icons";
import {
    StatusValidationBiensImmobilersTag
} from "@/pages/biens-immobiliers/components/status-validation-biens-immobilers-tag";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";
import {ListBienImmobilierTable} from "@/pages/biens-immobiliers/list-bien-immobilier-table";

export const ListBienImmobiliers = () => {
  return (
      <ListBienImmobilierTable activeMenu={"all_e"}/>
  )
};
