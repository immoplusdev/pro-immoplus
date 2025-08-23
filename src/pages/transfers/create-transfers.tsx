import React from "react";
import { useTranslate } from "@refinedev/core";
import { Create, useForm, SaveButton } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Card, InputNumber } from "antd";
import { 
  TransferItemType, 
  TransferType, 
  PaymentMethod 
} from "@/core/domain/transfers";

const { Option } = Select;

export const CreateTransfer = () => {
  const translate = useTranslate();

  const { formProps, saveButtonProps } = useForm({
    resource: "transfers",
    action: "create",
    redirect: "list",
  });

  return (
    <Create
      headerButtons={[
        <SaveButton key="save" {...saveButtonProps} />
      ]}
    >
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Card title={translate("transfers.sections.transferInfo")} size="small">
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
                label={translate("transfers.fields.fees")}
                name="fees"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder={translate("transfers.placeholders.fees")}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label={translate("transfers.fields.transferType")}
                name="transferType"
                rules={[
                  {
                    required: true,
                    message: translate("transfers.validation.transferType.required"),
                  },
                ]}
              >
                <Select placeholder={translate("transfers.placeholders.transferType")}>
                  {Object.values(TransferType).map((type) => (
                    <Option key={type} value={type}>
                      {translate(`transfers.transferType.${type.toLowerCase()}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={translate("transfers.fields.itemType")}
                name="itemType"
                rules={[
                  {
                    required: true,
                    message: translate("transfers.validation.itemType.required"),
                  },
                ]}
              >
                <Select placeholder={translate("transfers.placeholders.itemType")}>
                  {Object.values(TransferItemType).map((type) => (
                    <Option key={type} value={type}>
                      {translate(`transfers.transferItemType.${type.toLowerCase()}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={translate("transfers.fields.itemId")}
                name="itemId"
              >
                <Input placeholder={translate("transfers.placeholders.itemId")} />
              </Form.Item>
            </Card>
          </Col>

          <Col span={12}>
            <Card title={translate("transfers.sections.recipientInfo")} size="small">
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
                label={translate("transfers.fields.country")}
                name="country"
                rules={[
                  {
                    required: true,
                    message: translate("transfers.validation.country.required"),
                  },
                ]}
              >
                <Select placeholder={translate("transfers.placeholders.country")}>
                  <Option value="CI">Côte d'Ivoire</Option>
                  <Option value="FR">France</Option>
                  <Option value="SN">Sénégal</Option>
                  <Option value="ML">Mali</Option>
                </Select>
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
    </Create>
  );
};

export default CreateTransfer;