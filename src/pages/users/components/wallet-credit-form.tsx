import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  DatePicker,
  Space,
  Collapse,
} from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import {
  UUID_PATTERN,
  WALLET_NOTE_MAX_LENGTH,
  WalletOperationFormValues,
  buildCreditPayload,
} from "./wallet-operations";
import { useWalletAdminOperation } from "./use-wallet-admin-operation";
import { useParams } from "react-router-dom";

const { Option } = Select;

interface WalletCreditFormProps {
  translate: any;
  onSuccess?: () => void;
}

export const WalletCreditForm: React.FC<WalletCreditFormProps> = ({
  translate,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { id: userId } = useParams<{ id: string }>();
  const { run, isSubmitting } = useWalletAdminOperation<ReturnType<typeof buildCreditPayload>>({
    operation: "credit",
    translate,
    successKey: "wallet.messages.walletCreditSuccess",
    failedKey: "wallet.messages.walletCreditFailed",
    onRefresh: onSuccess,
  });

  const handleCreditWallet = async (values: WalletOperationFormValues) => {
    if (!userId) return;
    const succeeded = await run(buildCreditPayload(userId, values));
    if (succeeded) form.resetFields();
  };

  return (
    <Collapse
      items={[
        {
          key: "1",
          label: (
            <Space>
              <CreditCardOutlined />
              <span>{translate("wallet.sections.walletCredit")}</span>
            </Space>
          ),
          children: (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreditWallet}
              onFinishFailed={(errorInfo) => {
                console.log("Failed:", errorInfo);
              }}
            >
              <Form.Item
                label={translate("wallet.fields.creditAmount")}
                name="amount"
                rules={[
                  {
                    required: true,
                    message: translate(
                      "wallet.validation.creditAmount.required"
                    ),
                  },
                  {
                    type: "number",
                    min: 100,
                    message: translate("wallet.validation.creditAmount.min"),
                  },
                ]}
              >
                <InputNumber
                  placeholder={translate("wallet.placeholders.creditAmount")}
                  style={{ width: "100%" }}
                  size="large"
                  min={1}
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label={translate("wallet.fields.currency")}
                name="currency"
                initialValue="XOF"
                rules={[
                  {
                    required: true,
                    message: translate("wallet.validation.currency.required"),
                  },
                ]}
              >
                <Select
                  placeholder={translate("wallet.placeholders.currency")}
                  size="large"
                >
                  <Option value="XOF">XOF (Franc CFA)</Option>
                  <Option value="EUR">EUR (Euro)</Option>
                  <Option value="USD">USD (Dollar)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={translate("wallet.fields.source")}
                name="source"
                initialValue="RESERVATION"
                rules={[
                  {
                    required: true,
                    message: translate("wallet.validation.source.required"),
                  },
                ]}
              >
                <Select
                  placeholder={translate("wallet.placeholders.source")}
                  size="large"
                >
                  <Option value="RESERVATION">RESERVATION</Option>
                  <Option value="DEMANDE_VISITE">DEMANDE VISITE</Option>
                  <Option value="DEMANDE_RETRAIT">DEMANDE RETRAIT</Option>
                  <Option value="DEMANDE_RETRAIT_ADMIN">
                    DEMANDE RETRAIT ADMIN
                  </Option>
                  <Option value="AUTRE">AUTRE</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={translate("wallet.fields.sourceId")}
                name="sourceId"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: translate("wallet.validation.sourceId.required"),
                  },
                  {
                    pattern: UUID_PATTERN,
                    message: translate("wallet.validation.sourceId.uuid"),
                  },
                ]}
              >
                <Input
                  placeholder={translate("wallet.placeholders.sourceId")}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={translate("wallet.fields.operator")}
                name="operator"
                initialValue="moov"
                rules={[
                  {
                    required: true,
                    message: translate("wallet.validation.operator.required"),
                  },
                ]}
              >
                <Select
                  placeholder={translate("wallet.placeholders.operator")}
                  size="large"
                >
                  <Option value="orange">Orange Money</Option>
                  <Option value="mtn">MTN Money</Option>
                  <Option value="moov">Moov Money</Option>
                  <Option value="wave">Wave</Option>
                  <Option value="ecobank">Ecobank</Option>
                  <Option value="cash">Cash</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={translate("wallet.fields.reason")}
                name="note"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: translate("wallet.validation.reason.required"),
                  },
                  {
                    max: WALLET_NOTE_MAX_LENGTH,
                    message: translate("wallet.validation.reason.max"),
                  },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  maxLength={WALLET_NOTE_MAX_LENGTH}
                  showCount
                  placeholder={translate("wallet.placeholders.reason")}
                />
              </Form.Item>

              <Form.Item
                label={translate("wallet.fields.refundDate")}
                name="refundDate"
              >
                <DatePicker
                  showTime
                  placeholder={translate("wallet.placeholders.refundDate")}
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={{ width: "100%" }}
                  size="large"
                >
                  {translate("wallet.actions.creditWallet")}
                </Button>
              </Form.Item>
            </Form>
          ),
        },
      ]}
      size="small"
    />
  );
};
