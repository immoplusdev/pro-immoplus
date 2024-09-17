import React, {useState} from "react";
import { useShow, useTranslate, useOne } from "@refinedev/core";
import {
    BooleanField,
    Show,
    useTable,
} from "@refinedev/antd";
import {Button, Form, Input, Typography} from "antd";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {ReadOnlyFormField} from "@/lib/ts-utilities";

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

                  <ReadOnlyFormField label={translate("fields.id")} content={record?.id} isLoading={isLoading} />

                  <ReadOnlyFormField label={translate("reservations.fields.status_reservation")} content={record?.statusReservation} isLoading={isLoading} />

                  <ReadOnlyFormField label={translate("reservations.fields.status_facture")} content={record?.statusFacture} isLoading={isLoading} />

                  <>
                      <Title level={5}>{translate("reservations.fields.retrait_pro_effectue")}</Title>
                      <BooleanField value={record?.retraitProEffectue}/>
                  </>

                  <ReadOnlyFormField label={translate("reservations.fields.montant_total_reservation")} content={record?.montantTotalReservation} isLoading={isLoading} />

                  <ReadOnlyFormField label={translate("reservations.fields.montant_reservation_sans_commission")} content={record?.montantReservationSansCommission} isLoading={isLoading} />

                  <ReadOnlyFormField label={translate("fields.notes")} content={record?.notes} isLoading={isLoading} />

                  <ReadOnlyFormField label={translate("fields.client_phone_number")} content={record?.clientPhoneNumber} isLoading={isLoading} />

                  <ReadOnlyFormField label={translate("fields.created_at")} content={record?.createdAt} isLoading={isLoading} />

                  <ReadOnlyFormField label={translate("fields.updated_at")} content={record?.updatedAt} isLoading={isLoading} />

                  <ReadOnlyFormField
                      label={translate("residences.fields.residence_id")}
                      content={residenceIsLoading ? "Loading...": "Cannot Render"}
                      isLoading={residenceIsLoading}
                  />

                  <ReadOnlyFormField label={translate("fields.client")} content={`${record?.client?.firstName} ${record?.client?.lastName}`} isLoading={isLoading} />

                  <ReadOnlyFormField label={translate("reservations.fields.proprietaire")} content={`${record?.proprietaire?.firstName} ${record?.proprietaire?.lastName}`} isLoading={isLoading} />

              </ColList>

          </Form>
      </Show>
  );
};

