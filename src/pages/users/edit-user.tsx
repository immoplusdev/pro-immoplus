import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, DatePicker, Checkbox } from "antd";
import { useTranslate } from "@refinedev/core";
import dayjs from "dayjs";
import {ColList} from "@/components/layout";
import {defaultFormColListColProps, defaultFormColListRowProps} from "@/configs";

export const EditUser = () => {
  const translate = useTranslate();
  const { formProps, saveButtonProps, queryResult } = useForm();

  const usersData = queryResult?.data?.data;

  return (
      <Edit saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
            <ColList rowProps={defaultFormColListRowProps} colProps={defaultFormColListColProps}>
            <Form.Item
              label={translate("users.fields.firstname")}
              name={["firstName"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.lastname")}
              name={["lastName"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.email")}
              name={["email"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.password")}
              name={["password"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.phone_number")}
              name={["phoneNumber"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.otp")}
              name={["otp"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.otp_expiration")}
              name={["otpExpiration"]}
              rules={[
                {
                  required: true,
                },
              ]}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : undefined,
              })}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.identity_verified")}
              valuePropName="checked"
              name={["identityVerified"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Checkbox>Identity Verified</Checkbox>
          </Form.Item>
          <Form.Item
              label={translate("users.fields.email_verified")}
              valuePropName="checked"
              name={["emailVerified"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Checkbox>Email Verified</Checkbox>
          </Form.Item>
          <Form.Item
              label={translate("users.fields.phone_number_verified")}
              valuePropName="checked"
              name={["phoneNumberVerified"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Checkbox>Phone Number Verified</Checkbox>
          </Form.Item>
          <Form.Item
              label={translate("users.fields.compte_pro_valide")}
              valuePropName="checked"
              name={["compteProValide"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Checkbox>Compte Pro Valide</Checkbox>
          </Form.Item>
          <Form.Item
              label={translate("users.fields.auth_login_attempts")}
              name={["authLoginAttempts"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.status")}
              name={["status"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              label={translate("fields.created_at")}
              name={["createdAt"]}
              rules={[
                {
                  required: true,
                },
              ]}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : undefined,
              })}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
              label={translate("fields.updated_at")}
              name={["updatedAt"]}
              rules={[
                {
                  required: true,
                },
              ]}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : undefined,
              })}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
              label={translate("users.fields.role")}
              name={["role", "id"]}
              rules={[
                {
                  required: true,
                },
              ]}
          >
            <Input />
          </Form.Item>
            </ColList>
        </Form>
      </Edit>
  );
};
