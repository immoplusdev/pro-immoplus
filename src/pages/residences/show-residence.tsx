import React from "react";
import { useShow, useTranslate } from "@refinedev/core";
import {
  Show,
  TextField,
  BooleanField,
  NumberField,
  DateField,
} from "@refinedev/antd";
import { Typography } from "antd";

const { Title } = Typography;

export const ShowResidence = () => {
  const translate = useTranslate();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
      <Show isLoading={isLoading}>
        <Title level={5}>{translate("residences.fields.id")}</Title>
        <TextField value={record?.id} />
        <Title level={5}>{translate("residences.fields.nom")}</Title>
        <TextField value={record?.nom} />
        <Title level={5}>
          {translate("residences.fields.typeResidence")}
        </Title>
        <TextField value={record?.typeResidence} />
        <Title level={5}>
          {translate("residences.fields.description")}
        </Title>
        <TextField value={record?.description} />
        <Title level={5}>{translate("residences.fields.adresse")}</Title>
        <TextField value={record?.adresse} />
        <Title level={5}>
          {translate("residences.fields.residenceDisponible")}
        </Title>
        <BooleanField value={record?.residenceDisponible} />
        <Title level={5}>
          {translate("residences.fields.statusValidation")}
        </Title>
        <TextField value={record?.statusValidation} />
        <Title level={5}>
          {translate("residences.fields.prixReservation")}
        </Title>
        <NumberField value={record?.prixReservation ?? ""} />
        <Title level={5}>
          {translate("residences.fields.nombreMaxOccupants")}
        </Title>
        <NumberField value={record?.nombreMaxOccupants ?? ""} />
        <Title level={5}>
          {translate("residences.fields.animauxAutorises")}
        </Title>
        <BooleanField value={record?.animauxAutorises} />
        <Title level={5}>
          {translate("residences.fields.fetesAutorises")}
        </Title>
        <BooleanField value={record?.fetesAutorises} />
        <Title level={5}>{translate("residences.fields.createdAt")}</Title>
        <DateField value={record?.createdAt} />
        <Title level={5}>{translate("residences.fields.updatedAt")}</Title>
        <DateField value={record?.updatedAt} />
      </Show>
  );
};
