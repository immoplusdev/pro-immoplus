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
  buildReleaseFundsPayload,
} from "./wallet-operations";
import { useWalletAdminOperation } from "./use-wallet-admin-operation";
import { useParams } from "react-router-dom";

const { Option } = Select;

interface WalletReleaseFundsFormProps {
  translate: any;
  onSuccess?: () => void;
}

export const WalletReleaseFundsForm: React.FC<WalletReleaseFundsFormProps> = ({
  translate,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { id: userId } = useParams<{ id: string }>();
  const { run, isSubmitting } = useWalletAdminOperation<ReturnType<typeof buildReleaseFundsPayload>>({
    operation: "release-funds",
    translate,
    successKey: "wallet.messages.walletReleaseFundsSuccess",
    failedKey: "wallet.messages.walletReleaseFundsFailed",
    onRefresh: onSuccess,
  });

  const handleReleaseFunds = async (values: WalletOperationFormValues) => {
    if (!userId) return;
    const succeeded = await run(buildReleaseFundsPayload(userId, values));
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
              <span>{translate("wallet.sections.walletReleaseFunds")}</span>
            </Space>
          ),
          children: (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleReleaseFunds}
              onFinishFailed={(errorInfo) => {
                console.log("Failed:", errorInfo);
              }}
            >
              <Form.Item
                label={translate("wallet.fields.releaseAmount")}
                name="amount"
                rules={[
                  {
                    required: true,
                    message: translate(
                      "wallet.validation.releaseAmount.required"
                    ),
                  },
                  {
                    type: "number",
                    min: 1,
                    message: translate("wallet.validation.releaseAmount.min"),
                  },
                ]}
              >
                <InputNumber
                  placeholder={translate("wallet.placeholders.releaseAmount")}
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
                extra={translate("wallet.hints.releaseFundsSource")}
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
                  {translate("wallet.actions.releaseFunds")}
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