import { IResourceComponentsProps } from "@refinedev/core";
import { AntdShowInferencer } from "@refinedev/inferencer/antd";

import React from "react";
import { useShow, useTranslate, useOne } from "@refinedev/core";
import {
  Show,
  TagField,
  TextField,
  BooleanField,
  NumberField,
  DateField,
} from "@refinedev/antd";
import { Typography } from "antd";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";

const { Title } = Typography;

export const ShowReservation = () => {
  const translate = useTranslate();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const { data: residenceData, isLoading: residenceIsLoading } = useOne({
    resource: "residences",
    id: record?.residenceId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  return (
      <Show isLoading={isLoading}>
         <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
             <>
                 <Title level={5}>{translate("fields.id")}</Title>
                 <TextField value={record?.id} />
             </>
             <>
             <Title level={5}>
                 {translate("reservations.fields.status_reservation")}
             </Title>
             </>

             <>
             <TextField value={record?.statusReservation} />
             <Title level={5}>
                 {translate("reservations.fields.status_facture")}
             </Title>
             </>

             <>
             <TextField value={record?.statusFacture} />
             <Title level={5}>
                 {translate("reservations.fields.retrait_pro_effectue")}
             </Title>
             </>

             <>
             <BooleanField value={record?.retraitProEffectue} />
             <Title level={5}>
                 {translate("reservations.fields.montant_total_reservation")}
             </Title>
             </>

             <NumberField value={record?.montantTotalReservation ?? ""} />
             <Title level={5}>
                 {translate(
                     "reservations.fields.montant_reservation_sans_commission",
                 )}
             </Title>
             <NumberField
                 value={record?.montantReservationSansCommission ?? ""}
             />
             <Title level={5}>{translate("fields.notes")}</Title>
             <TextField value={record?.notes} />
             <Title level={5}>
                 {translate("fields.client_phone_number")}
             </Title>
             <NumberField value={record?.clientPhoneNumber ?? ""} />
             <Title level={5}>
                 {translate("fields.created_at")}
             </Title>
             <DateField value={record?.createdAt} />
             <Title level={5}>
                 {translate("fields.updated_at")}
             </Title>
             <DateField value={record?.updatedAt} />
             <Title level={5}>
                 {translate("residences.fields.residence_id")}
             </Title>
             {residenceIsLoading ? (
                 <>Loading...</>
             ) : (
                 <>
                        <span title="Inferencer failed to render this field. (Cannot find key)">
                            Cannot Render
                        </span>
                 </>
             )}
             <Title level={5}>{translate("fields.client")}</Title>
             <TextField
                 value={
                     record?.client?.firstName + " " + record?.client?.lastName
                 }
             />
             <Title level={5}>
                 {translate("reservations.fields.proprietaire")}
             </Title>
             <TextField
                 value={
                     record?.proprietaire?.firstName +
                     " " +
                     record?.proprietaire?.lastName
                 }
             />
         </ColList>
      </Show>
  );
};

