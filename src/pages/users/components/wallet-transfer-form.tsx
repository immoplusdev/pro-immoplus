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
import { SwapOutlined } from "@ant-design/icons";
import {
  UUID_PATTERN,
  WALLET_NOTE_MAX_LENGTH,
  WalletOperationFormValues,
  buildTransferPayload,
} from "./wallet-operations";
import { useWalletAdminOperation } from "./use-wallet-admin-operation";
import { useParams } from "react-router-dom";

const { Option } = Select;

interface WalletTransferFormProps {
  translate: any;
  onSuccess?: () => void;
}

export const WalletTransferForm: React.FC<WalletTransferFormProps> = ({
  translate,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { id: userId } = useParams<{ id: string }>();
  const { run, isSubmitting } = useWalletAdminOperation<ReturnType<typeof buildTransferPayload>>({
    operation: "transfer",
    translate,
    successKey: "wallet.messages.walletTransferSuccess",
    failedKey: "wallet.messages.walletTransferFailed",
    onRefresh: onSuccess,
  });

  const handleTransfer = async (values: WalletOperationFormValues) => {
    if (!userId) return;
    const succeeded = await run(buildTransferPayload(userId, values));
    if (succeeded) form.resetFields();
  };

  return (
    <Collapse
      items={[
        {
          key: "1",
          label: (
            <Space>
              <SwapOutlined />
              <span>{translate("wallet.sections.walletTransfer")}</span>
            </Space>
          ),
          children: (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleTransfer}
              onFinishFailed={(errorInfo) => {
                console.log("Failed:", errorInfo);
              }}
            >
              <Form.Item
                label={translate("wallet.fields.toOwnerId")}
                name="toOwnerId"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: translate("wallet.validation.toOwnerId.required"),
                  },
                  {
                    pattern: UUID_PATTERN,
                    message: translate("wallet.validation.toOwnerId.uuid"),
                  },
                ]}
              >
                <Input
                  placeholder={translate("wallet.placeholders.toOwnerId")}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={translate("wallet.fields.transferAmount")}
                name="amount"
                rules={[
                  {
                    required: true,
                    message: translate(
                      "wallet.validation.transferAmount.required"
                    ),
                  },
                  {
                    type: "number",
                    min: 100,
                    message: translate("wallet.validation.transferAmount.min"),
                  },
                ]}
              >
                <InputNumber
                  placeholder={translate("wallet.placeholders.transferAmount")}
                  style={{ width: "100%" }}
                  size="large"
                  min={100}
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
                >
                  {translate("wallet.actions.transfer")}
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
