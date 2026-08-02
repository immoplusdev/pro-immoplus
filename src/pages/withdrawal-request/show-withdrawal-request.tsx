import {
  useTranslate,
  BaseRecord,
  useShow,
  useApiUrl,
  HttpError,
} from "@refinedev/core";
import { Show, EditButton, DeleteButton, ListButton } from "@refinedev/antd";
import { VerificationBadge, OutlineTag, DateDisplayField } from "@/components/table";
import {
  Card,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  Button,
  Form,
  Input,
  message,
} from "antd";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";
import { Link, useParams } from "react-router-dom";
import { formatAmount } from "@/lib/helpers";
import { SpinLoader } from "@/components/loading";
import { useState } from "react";
import axios from "axios";
import { EyeOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const ShowWithdrawalRequest = () => {
  const translate = useTranslate();
  const { id } = useParams<{ id: string }>();
  const apiUrl = useApiUrl();
  const [isValidating, setIsValidating] = useState(false);
  const [form] = Form.useForm();
  const authStorageManager = getLocalStorageProvider();
  // Récupérer le token depuis le localStorage
  const authData = authStorageManager.getAuthData();
  const token = authData?.access_token;

  const { query } = useShow({
    resource: "withdrawal-requests",
    id,
  });

  const withdrawalData = query?.data?.data;
  const isLoading = query?.isLoading;

  const { query: userQuery } = useShow({
    resource: "users",
    id: withdrawalData?.owner,
    queryOptions: {
      enabled: !!withdrawalData?.owner,
    },
  });

  const userData = userQuery?.data?.data;
  const isUserLoading = userQuery?.isLoading;

  const handleTransferValidation = async (values: { description: string }) => {
    try {
      setIsValidating(true);
      await axios.post(
        `${apiUrl}/gateway/hu2/transfer`,
        {
          walletWithDrawalRequestId: id,
          description: values.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success(
        translate("withdrawalRequests.messages.transferValidated")
      );
      form.resetFields();
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        translate("withdrawalRequests.messages.transferValidationFailed");
      message.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#B86B0A";
      case "APPROVED":
        return "#1F8A5B";
      case "REJECTED":
        return "#C13838";
      case "PROCESSING":
        return "#185FA5";
      default:
        return "#5F5E5A";
    }
  };

  const getOperatorColor = () => "#5F5E5A";

  if (isLoading) {
    return <SpinLoader />;
  }

  return (
    <Show
      isLoading={isLoading}
      headerButtons={[
        <ListButton key="list" />,
        <EditButton key="edit" recordItemId={id} />,
        <DeleteButton key="delete" recordItemId={id} />,
      ]}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title={translate("withdrawalRequests.sections.requestInfo")}
            size="small"
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>
                  {translate("withdrawalRequests.fields.owner")}:{" "}
                </Text>
                <Link to={`/users/edit/${userData?.id}`}>
                  <Button type="link" icon={<UserOutlined />} style={{ padding: 0 }}>
                    {userData
                      ? `${userData.firstName} ${userData.lastName} (${userData.email})`
                      : withdrawalData?.owner || translate("common.notAvailable")}
                  </Button>
                </Link>
              </div>

              <div>
                <Text strong>
                  {translate("withdrawalRequests.fields.amount")}:{" "}
                </Text>
                <Text style={{ fontSize: "16px", color: "#1890ff" }}>
                  {withdrawalData
                    ? `${formatAmount(withdrawalData.amount)}`
                    : translate("common.notAvailable")}
                </Text>
              </div>

              <div>
                <Text strong>
                  {translate("withdrawalRequests.fields.phoneNumber")}:{" "}
                </Text>
                <Text>
                  {withdrawalData?.phoneNumber ||
                    translate("common.notAvailable")}
                </Text>
              </div>

              <div>
                <Text strong>
                  {translate("withdrawalRequests.fields.operator")}:{" "}
                </Text>
                {withdrawalData?.operator ? (
                  <OutlineTag color={getOperatorColor()}>
                    {withdrawalData.operator}
                  </OutlineTag>
                ) : (
                  <Text>{translate("common.notAvailable")}</Text>
                )}
              </div>

              <div>
                <Text strong>
                  {translate("withdrawalRequests.fields.status")}:{" "}
                </Text>
                {withdrawalData?.status ? (
                  <OutlineTag color={getStatusColor(withdrawalData.status)}>
                    {translate(
                      `withdrawalRequests.status.${withdrawalData.status.toLowerCase()}`
                    )}
                  </OutlineTag>
                ) : (
                  <Text>{translate("common.notAvailable")}</Text>
                )}
              </div>

              <div>
                <Text strong>
                  {translate("withdrawalRequests.fields.retraitQr")}:{" "}
                </Text>
                <VerificationBadge verified={!!withdrawalData?.retraitQr} />
              </div>

              <div>
                <Text strong>
                  {translate("withdrawalRequests.fields.qrAutoApproved")}:{" "}
                </Text>
                <VerificationBadge verified={!!withdrawalData?.qrAutoApproved} />
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={translate("withdrawalRequests.sections.timestamps")}
            size="small"
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>{translate("fields.created_at")}: </Text>
                <DateDisplayField value={withdrawalData?.createdAt} />
              </div>

              <div>
                <Text strong>{translate("fields.updated_at")}: </Text>
                <DateDisplayField value={withdrawalData?.updatedAt} />
              </div>
            </Space>
          </Card>

          {withdrawalData?.note && (
            <Card
              title={translate("withdrawalRequests.fields.note")}
              size="small"
              style={{ marginTop: 16 }}
            >
              <Text>{withdrawalData.note}</Text>
            </Card>
          )}
        </Col>
      </Row>

      {userData && (
        <>
          <Divider />
          <Card
            title={translate("withdrawalRequests.sections.ownerDetails")}
            size="small"
            loading={isUserLoading}
          >
            <Row gutter={16}>
              <Col span={8}>
                <div>
                  <Text strong>{translate("users.fields.firstname")}: </Text>
                  <Text>
                    {userData.firstName || translate("common.notAvailable")}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>{translate("users.fields.lastname")}: </Text>
                  <Text>
                    {userData.lastName || translate("common.notAvailable")}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>{translate("users.fields.email")}: </Text>
                  <Text>
                    {userData.email || translate("common.notAvailable")}
                  </Text>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <div>
                  <Text strong>{translate("users.fields.phone_number")}: </Text>
                  <Text>
                    {userData.phoneNumber || translate("common.notAvailable")}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>{translate("users.fields.role")}: </Text>
                  {userData.role ? (
                    <OutlineTag color="#5F5E5A">
                      {translate(`users.tags.roles.${userData.role.name}`)}
                    </OutlineTag>
                  ) : (
                    <Text>{translate("common.notAvailable")}</Text>
                  )}
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>{translate("users.fields.status")}: </Text>
                  {userData.status ? (
                    <OutlineTag color={userData.status === "active" ? "#1F8A5B" : "#C13838"}>
                      {translate(
                        `users.fields.${userData.status.toLowerCase()}`
                      )}
                    </OutlineTag>
                  ) : (
                    <Text>{translate("common.notAvailable")}</Text>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}

      {withdrawalData?.status === "PENDING" && (
        <>
          <Divider />
          <Card
            title={translate("withdrawalRequests.sections.transferValidation")}
            size="small"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleTransferValidation}
            >
              <Row gutter={16}>
                <Col span={18}>
                  <Form.Item
                    label={translate(
                      "withdrawalRequests.fields.transferDescription"
                    )}
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: translate(
                          "withdrawalRequests.validation.transferDescription.required"
                        ),
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder={translate(
                        "withdrawalRequests.placeholders.transferDescription"
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col
                  span={6}
                  style={{
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "24px",
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isValidating}
                    style={{ width: "100%" }}
                  >
                    {translate("withdrawalRequests.actions.validateTransfer")}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </>
      )}
    </Show>
  );
};

export default ShowWithdrawalRequest;
