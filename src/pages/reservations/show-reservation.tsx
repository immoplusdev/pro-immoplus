import React, {useState} from "react";
import { useShow, useTranslate, useOne } from "@refinedev/core";
import {
    Show,
    TagField,
    TextField,
    BooleanField,
    NumberField,
    DateField, List, useTable,
} from "@refinedev/antd";
import {Button, Form, Input, Typography} from "antd";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {FormItemWithButton} from "@/lib/ts-utilities";

const { Title } = Typography;

export const ShowReservation = () => {
  const translate = useTranslate();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
    const [componentDisabled, setComponentDisabled] = useState<boolean>(true);

  const record = data?.data;
  const {...tableProps} = useTable()
  const { data: residenceData, isLoading: residenceIsLoading } = useOne({
    resource: "residences",
    id: record?.residenceId || "",
    queryOptions: {
      enabled: !!record,
    },
  });

    const formFieldData = [
        { label: translate("fields.id"), content: record?.id },
        { label: translate("reservations.fields.status_reservation"), content: record?.statusReservation },
        { label: translate("reservations.fields.status_facture"), content: record?.statusFacture },
        { label: translate("reservations.fields.retrait_pro_effectue"), content: record?.retraitProEffectue },
        { label: translate("reservations.fields.montant_total_reservation"), content: record?.montantTotalReservation },
        { label: translate("reservations.fields.montant_reservation_sans_commission"), content: record?.montantReservationSansCommission },
        { label: translate("fields.notes"), content: record?.notes },
        { label: translate("fields.client_phone_number"), content: record?.clientPhoneNumber },
        { label: translate("fields.created_at"), content: record?.createdAt },
        { label: translate("fields.updated_at"), content: record?.updatedAt },
        { label: translate("residences.fields.residence_id"), content: residenceIsLoading ? <>Loading...</> : <>Cannot Render</> },
        { label: translate("fields.client"), content: `${record?.client?.firstName} ${record?.client?.lastName}` },
        { label: translate("reservations.fields.proprietaire"), content: `${record?.proprietaire?.firstName} ${record?.proprietaire?.lastName}` }
    ];

    return (
      <Show isLoading={isLoading}>
          <Form
              labelCol={{span: 200}}
              wrapperCol={{span: 130}}
              layout="vertical"
              style={{
                  maxWidth: 1000,
                  fontWeight: 700,
              }}
          >
              <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>

                  {formFieldData.map((data, index) =>(
                      <FormItemWithButton key={index} label={data.label} content={data.content} isLoading={data.label=== translate("residences.fields.residence_id") && isLoading}/>
                  ))}

              </ColList>

          </Form>
      </Show>
  );
};

