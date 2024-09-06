import React from "react";
import { useShow, useTranslate } from "@refinedev/core";
import {
  Show,
  TagField,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  NumberField,
} from "@refinedev/antd";
import {Form, Tag, Typography} from "antd";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";
import {ColList} from "@/components/layout";
import {ReadOnlyFormField} from "@/lib/ts-utilities";

const { Title } = Typography;

export const ShowUser = () => {
  const translate = useTranslate();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const formPropName = [
    {label: translate("users.fields.firstname"), content: record?.firstName},
    {label: translate("users.fields.lastname"), content: record?.lastName},
    {label: translate("users.fields.email"), content: record?.email},
    {label: translate("users.fields.password"), content: record?.password},
    {label: translate("users.fields.phone_number"), content: record?.phoneNumber},
    {label: translate("users.fields.otp"), content: record?.otp},
    {label: translate("users.fields.otp_expiration"), content: record?.otpExpiration},
    {label: translate("users.fields.identity_verified"), content: record?.identityVerified},
    {label: translate("users.fields.email_verified"), content: record?.emailVerified},
    {label: translate("users.fields.phone_number_verified"), content: record?.phoneNumberVerified},
    {label: translate("users.fields.compte_pro_valide"), content: record?.compteProValide},
    {label: translate("users.fields.auth_login_attempts"), content: record?.authLoginAttempts ?? ""},
    {label: translate("users.fields.status"), content: record?.status},
    {label: translate("fields.created_at"), content: record?.createdAt},
    {label: translate("fields.updated_at"), content: record?.updatedAt},
    {label: translate("users.fields.role"), content: record?.role?.name}
  ]

  return (
      <Show isLoading={isLoading}>
        <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
            {formPropName.map((data, index) =>(
                  data.content === record?.statusValidation
                      ? (
                          <Form.Item label={data.label}>
                            <Tag color="warning" style={{width: 300, height: 30 , display: "flex", alignItems: "center", justifyContent: "center"}}>{data?.content}</Tag>
                          </Form.Item>
                      ) : data.content === record?.identityVerified ?
                          (
                              <Form.Item label={data.label}>
                                <BooleanField value={record?.fetesAutorises } />
                              </Form.Item>
                          )
                          :
                              <ReadOnlyFormField
                                  key={index}
                                  label={data.label}
                                  content={data.content}
                                  isLoading={isLoading}
                              />
              ))}
        </ColList>
      </Show>
  );
};
