import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  message,
  Collapse,
} from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { useApiUrl } from "@refinedev/core";
import axios from "axios";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";
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
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = useApiUrl();
  const { id: userId } = useParams<{ id: string }>();
  const authStorageManager = getLocalStorageProvider();

  const handleTransfer = async (values: any) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const authData = authStorageManager.getAuthData();
      const token = authData?.access_token;

      if (!token) {
        message.error(translate("auth.messages.tokenNotFound"));
        return;
      }

      const payload = {
        fromOwnerId: userId,
        toOwnerId: values.toOwnerId,
        amount: values.amount,
        currency: values.currency,
        note: values.note,
      };

      await axios.post(`${apiUrl}/wallet/admin/transfer`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      message.success(translate("wallet.messages.walletTransferSuccess"));
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        translate("wallet.messages.walletTransferFailed");
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
                    message: translate("wallet.validation.toOwnerId.required"),
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
                    min: 1,
                    message: translate("wallet.validation.transferAmount.min"),
                  },
                ]}
              >
                <InputNumber
                  placeholder={translate("wallet.placeholders.transferAmount")}
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

              <Form.Item label={translate("wallet.fields.note")} name="note">
                <Input.TextArea
                  rows={3}
                  placeholder={translate("wallet.placeholders.note")}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={isLoading}
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
