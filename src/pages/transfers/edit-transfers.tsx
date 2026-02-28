import React from "react";
import { useTranslate, BaseRecord } from "@refinedev/core";
import {
  Edit,
  useForm,
  SaveButton,
  DeleteButton,
} from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Card, InputNumber } from "antd";
import { useParams } from "react-router-dom";
import { ReadOnlyFormField } from "@/lib/ts-utilities/common";
import { formatAmount } from "@/lib/helpers";
import { TransferStatus, TransferType, PaymentMethod } from "@/core/domain/transfers";

const { Option } = Select;

export const EditTransfer = () => {
  const translate = useTranslate();
  const { id } = useParams<{ id: string }>();

  const { formProps, saveButtonProps, query } = useForm<BaseRecord>({
    resource: "transfers",
    action: "edit",
    id,
    redirect: "list",
  });

  const transferData = query?.data?.data;

  return (
    <Edit
      headerButtons={[
        <SaveButton key="save" {...saveButtonProps} />,
        <DeleteButton key="delete" recordItemId={id} />,
      ]}
    >
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Card title={translate("transfers.sections.transferInfo")} size="small">
              <ReadOnlyFormField
                label="transfers.fields.customer"
                content={transferData?.customer?.id || ""}
                isLoading={query?.isLoading}
              />

              <ReadOnlyFormField
                label="transfers.fields.amount"
                content={
                  transferData
                    ? `${formatAmount(transferData.amount)}`
                    : ""
                }
                isLoading={query?.isLoading}
              />

              <ReadOnlyFormField
                label="transfers.fields.itemType"
                content={translate(`transfers.transferItemType.${transferData?.itemType}`)}
                isLoading={query?.isLoading}
              />

              <ReadOnlyFormField
                label="transfers.fields.itemId"
                content={transferData?.itemId}
                isLoading={query?.isLoading}
              />

              <ReadOnlyFormField
                label="fields.created_at"
                content={
                  transferData?.createdAt
                    ? new Date(transferData.createdAt).toLocaleDateString()
                    : ""
                }
                isLoading={query?.isLoading}
              />
            </Card>
          </Col>

          <Col span={12}>
            <Card title={translate("transfers.sections.adminActions")} size="small">
               <Form.Item
                    label={translate("transfers.fields.amount")}
                    name="amount"
                    rules={[
                      {
                        required: true,
                        message: translate("transfers.validation.amount.required"),
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder={translate("transfers.placeholders.amount")}
                      min={0}
                    />
              </Form.Item>
              <Form.Item
                label={translate("transfers.fields.status")}
                name="transfetStatus"
                rules={[
                  {
                    required: true,
                    message: translate("transfers.validation.status.required"),
                  },
                ]}
              >
                <Select
                  placeholder={translate("transfers.placeholders.status")}
                  size="large"
                >
                  {Object.values(TransferStatus).map((status) => (
                    <Option key={status} value={status}>
                      {translate(`transfers.status.${status.toLowerCase()}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                    label={translate("transfers.fields.currency")}
                    name="currency"
                    initialValue="XOF"
                    rules={[
                      {
                        required: true,
                        message: translate("transfers.validation.currency.required"),
                      },
                    ]}
                  >
                    <Select placeholder={translate("transfers.placeholders.currency")}>
                      <Option value="XOF">XOF</Option>
                      <Option value="EUR">EUR</Option>
                      <Option value="USD">USD</Option>
                    </Select>
              </Form.Item>

              <Form.Item
                label={translate("transfers.fields.recipientName")}
                name="recipientName"
              >
                <Input
                  placeholder={translate("transfers.placeholders.recipientName")}
                />
              </Form.Item>

              <Form.Item
                label={translate("transfers.fields.accountNumber")}
                name="accountNumber"
              >
                <Input
                  placeholder={translate("transfers.placeholders.accountNumber")}
                />
              </Form.Item>

              <Form.Item
                label={translate("transfers.fields.transferProvider")}
                name="transferProvider"
              >
                <Select
                  placeholder={translate("transfers.placeholders.transferProvider")}
                  allowClear
                >
                  {Object.values(PaymentMethod).map((method) => (
                    <Option key={method} value={method}>
                      {translate(`transfers.transferType.${method.toLowerCase()}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};

export default EditTransfer;