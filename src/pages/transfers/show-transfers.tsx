import React from "react";
import { useTranslate, useShow } from "@refinedev/core";
import {
  Show,
  EditButton,
  DeleteButton,
  ListButton,
} from "@refinedev/antd";
import { Button, Card, Row, Col, Tag, Typography, Divider, Space } from "antd";
import { UserOutlined, EyeOutlined } from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { formatAmount } from "@/lib/helpers";
import { DateDisplayField } from "@/components/table";
import { SpinLoader } from "@/components/loading";

const { Text } = Typography;

export const ShowTransfer = () => {
  const translate = useTranslate();
  const { id } = useParams<{ id: string }>();

  const { query } = useShow({
    resource: "transfers",
    id,
  });

  const transferData = query?.data?.data;
  const isLoading = query?.isLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "PROCESSING":
        return "blue";
      case "COMPLETED":
        return "green";
      case "FAILED":
        return "red";
      case "CANCELLED":
        return "default";
      default:
        return "default";
    }
  };

  const getTransferTypeColor = (type: string) => {
    switch (type) {
      case "BANK_TRANSFER":
        return "blue";
      case "MOBILE_MONEY":
        return "green";
      case "CASH":
        return "gold";
      case "WIRE_TRANSFER":
        return "purple";
      case "DIGITAL_WALLET":
        return "cyan";
      default:
        return "default";
    }
  };

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
            title={translate("transfers.sections.transferInfo")}
            size="small"
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>{translate("transfers.fields.customer")}: </Text>
                {transferData?.customer ? (
                  <Link to={`/users/edit/${transferData.customer.id}`}>
                    <Button type="link" icon={<UserOutlined />} style={{ padding: 0 }}>
                      {`${transferData.customer.firstName} ${transferData.customer.lastName}`}
                    </Button>
                  </Link>
                ) : (
                  <Text>{translate("common.notAvailable")}</Text>
                )}
              </div>

              <div>
                <Text strong>{translate("transfers.fields.amount")}: </Text>
                <Text style={{ fontSize: "16px", color: "#1890ff" }}>
                  {transferData
                    ? `${formatAmount(transferData.amount)}`
                    : translate("common.notAvailable")}
                </Text>
              </div>

              <div>
                <Text strong>{translate("transfers.fields.fees")}: </Text>
                <Text>
                  {transferData?.fees
                    ? `${formatAmount(transferData.fees)}`
                    : translate("common.notAvailable")}
                </Text>
              </div>

              <div>
                <Text strong>{translate("transfers.fields.status")}: </Text>
                {transferData?.transfetStatus ? (
                  <Tag color={getStatusColor(transferData.transfetStatus)}>
                    {translate(`transfers.status.${transferData.transfetStatus.toLowerCase()}`)}
                  </Tag>
                ) : (
                  <Text>{translate("common.notAvailable")}</Text>
                )}
              </div>

              <div>
                <Text strong>{translate("transfers.fields.transferType")}: </Text>
                {transferData?.transferType ? (
                  <Tag color={getTransferTypeColor(transferData.transferType)}>
                    {translate(`transfers.transferType.${transferData.transferType.toLowerCase()}`)}
                  </Tag>
                ) : (
                  <Text>{translate("common.notAvailable")}</Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={translate("transfers.sections.recipientInfo")}
            size="small"
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>{translate("transfers.fields.recipientName")}: </Text>
                <Text>{transferData?.recipientName || translate("common.notAvailable")}</Text>
              </div>

              <div>
                <Text strong>{translate("transfers.fields.accountNumber")}: </Text>
                <Text>{transferData?.accountNumber || translate("common.notAvailable")}</Text>
              </div>

              <div>
                <Text strong>{translate("transfers.fields.country")}: </Text>
                <Text>{transferData?.country || translate("common.notAvailable")}</Text>
              </div>

              <div>
                <Text strong>{translate("transfers.fields.transferProvider")}: </Text>
                {transferData?.transferProvider ? (
                  <Tag>
                    {translate(`transfers.paymentMethod.${transferData.transferProvider.toUpperCase()}`)}
                  </Tag>
                ) : (
                  <Text>{translate("common.notAvailable")}</Text>
                )}
              </div>
            </Space>
          </Card>

          <Card
            title={translate("transfers.sections.timestamps")}
            size="small"
            style={{ marginTop: 16 }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>{translate("fields.created_at")}: </Text>
                <DateDisplayField value={transferData?.createdAt} />
              </div>

              <div>
                <Text strong>{translate("fields.updated_at")}: </Text>
                <DateDisplayField value={transferData?.updatedAt} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {transferData?.itemType && (
        <>
          <Divider />
          <Card
            title={translate("transfers.sections.itemDetails")}
            size="small"
          >
            <Row gutter={16}>
              <Col span={8}>
                <div>
                  <Text strong>{translate("transfers.fields.itemType")}: </Text>
                  <Tag>{translate(`transfers.itemType.${transferData.itemType.toLowerCase()}`)}</Tag>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <Text strong>{translate("transfers.fields.itemId")}: </Text>
                  <Link to={`/withdrawal-requests/show/${transferData.itemId}`}>
                    <Button type="link" icon={<EyeOutlined />} style={{ padding: 0 }}>
                      {transferData.itemId}
                    </Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </Show>
  );
};

export default ShowTransfer;