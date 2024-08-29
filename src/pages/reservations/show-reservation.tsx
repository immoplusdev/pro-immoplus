import { IResourceComponentsProps } from "@refinedev/core";
import { AntdShowInferencer } from "@refinedev/inferencer/antd";

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
                  <Form.Item label={translate("fields.id")}>
                      <Button>
                          {record?.id}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("reservations.fields.status_reservation")}>
                      <Button>
                          {record?.statusReservation}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("reservations.fields.status_facture")}>
                      <Button>
                          {record?.statusFacture}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("reservations.fields.retrait_pro_effectue")}>
                      <Button>
                          {record?.retraitProEffectue}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("reservations.fields.montant_total_reservation")}>
                      <Button>
                          {record?.montantTotalReservation}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("reservations.fields.montant_reservation_sans_commission")}>
                      <Button>
                          {record?.montantReservationSansCommission}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("fields.notes")}>
                      <Button>
                          {record?.notes}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("fields.client_phone_number")}>
                      <Button>
                          {record?.clientPhoneNumber}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("fields.created_at")}>
                      <Button>
                          {record?.createdAt}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("fields.updated_at")}>
                      <Button>
                          {record?.updatedAt}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("residences.fields.residence_id")}>
                      <Button>
                          {residenceIsLoading ? (
                              <>Loading...</>
                          ) : (
                              <>
                        <span title="Inferencer failed to render this field. (Cannot find key)">
                            Cannot Render
                        </span>
                              </>
                          )}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("fields.client")}>
                      <Button>
                          { record?.client?.firstName + " " + record?.client?.lastName}
                      </Button>
                  </Form.Item>
                  <Form.Item label={translate("reservations.fields.proprietaire")}>
                      <Button>
                          {  record?.proprietaire?.firstName +
                              " " +
                              record?.proprietaire?.lastName}
                      </Button>
                  </Form.Item>
              </ColList>

              {/*<Title level={5}>*/}
              {/*    {translate("reservations.fields.status_reservation")}*/}
              {/*</Title>*/}
              {/*<TextField value={record?.statusReservation}/>*/}

          {/*<Title level={5}>*/}
          {/*    {translate("reservations.fields.status_facture")}*/}
          {/*</Title>*/}
          {/*<TextField value={record?.statusFacture}/>*/}

          {/*<Title level={5}>*/}
          {/*    {translate("reservations.fields.retrait_pro_effectue")}*/}
          {/*</Title>*/}
          {/*<BooleanField value={record?.retraitProEffectue}/>*/}

          {/*<Title level={5}>*/}
          {/*    {translate("reservations.fields.montant_total_reservation")}*/}
          {/*</Title>*/}

          {/*<NumberField value={record?.montantTotalReservation ?? ""}/>*/}
          {/*<Title level={5}>*/}
          {/*    {translate(*/}
          {/*        "reservations.fields.montant_reservation_sans_commission",*/}
          {/*    )}*/}
          {/*</Title>*/}
          {/*<NumberField*/}
          {/*    value={record?.montantReservationSansCommission ?? ""}*/}
          {/*/>*/}
          {/*<Title level={5}>{translate("fields.notes")}</Title>*/}
          {/*<TextField value={record?.notes}/>*/}
          {/*<Title level={5}>*/}
          {/*    {translate("fields.client_phone_number")}*/}
          {/*</Title>*/}
          {/*<NumberField value={record?.clientPhoneNumber ?? ""}/>*/}
          {/*<Title level={5}>*/}
          {/*    {translate("fields.created_at")}*/}
          {/*</Title>*/}
          {/*<DateField value={record?.createdAt}/>*/}
          {/*<Title level={5}>*/}
          {/*    {translate("fields.updated_at")}*/}
          {/*</Title>*/}
          {/*<DateField value={record?.updatedAt}/>*/}
          {/*<Title level={5}>*/}
          {/*    {translate("residences.fields.residence_id")}*/}
          {/*</Title>*/}
          {/*{residenceIsLoading ? (*/}
          {/*    <>Loading...</>*/}
          {/*) : (*/}
          {/*    <>*/}
          {/*              <span title="Inferencer failed to render this field. (Cannot find key)">*/}
          {/*                  Cannot Render*/}
          {/*              </span>*/}
          {/*    </>*/}
          {/*)}*/}
          {/*<Title level={5}>{translate("fields.client")}</Title>*/}
          {/*<TextField*/}
          {/*    value={*/}
          {/*        record?.client?.firstName + " " + record?.client?.lastName*/}
          {/*    }*/}
          {/*/>*/}
          {/*<Title level={5}>*/}
          {/*    {translate("reservations.fields.proprietaire")}*/}
          {/*</Title>*/}
          {/*<TextField*/}
          {/*    value={*/}
          {/*        record?.proprietaire?.firstName +*/}
          {/*        " " +*/}
          {/*        record?.proprietaire?.lastName*/}
          {/*    }*/}
          {/*/>*/}
          </Form>
      </Show>
  );
};

