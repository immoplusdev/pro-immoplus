import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Collapse,
} from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
import {
  UUID_PATTERN,
  WALLET_NOTE_MAX_LENGTH,
  WalletOperationFormValues,
  buildDebitPayload,
} from "./wallet-operations";
import { useWalletAdminOperation } from "./use-wallet-admin-operation";
import { useParams } from "react-router-dom";

const { Option } = Select;

interface WalletDebitFormProps {
  translate: any;
  onSuccess?: () => void;
}

export const WalletDebitForm: React.FC<WalletDebitFormProps> = ({
  translate,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { id: userId } = useParams<{ id: string }>();
  const { run, isSubmitting } = useWalletAdminOperation<ReturnType<typeof buildDebitPayload>>({
    operation: "debit",
    translate,
    successKey: "wallet.messages.walletDebitSuccess",
    failedKey: "wallet.messages.walletDebitFailed",
    onRefresh: onSuccess,
  });

  const handleDebitWallet = async (values: WalletOperationFormValues) => {
    if (!userId) return;
    const succeeded = await run(buildDebitPayload(userId, values));
    if (succeeded) form.resetFields();
  };

  return (
    <Collapse
      items={[
        {
          key: "1",
          label: (
            <Space>
              <MinusCircleOutlined />
              <span>{translate("wallet.sections.walletDebit")}</span>
            </Space>
          ),
          children: (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleDebitWallet}
              onFinishFailed={(errorInfo) => {
                console.log("Failed:", errorInfo);
              }}
            >
              <Form.Item
                label={translate("wallet.fields.debitAmount")}
                name="amount"
                rules={[
                  {
                    required: true,
                    message: translate(
                      "wallet.validation.debitAmount.required"
                    ),
                  },
                  {
                    type: "number",
                    min: 1,
                    message: translate("wallet.validation.debitAmount.min"),
                  },
                ]}
              >
                <InputNumber
                  placeholder={translate("wallet.placeholders.debitAmount")}
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

              <Form.Item>
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={{ width: "100%" }}
                  size="large"
                  danger
                >
                  {translate("wallet.actions.debitWallet")}
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