import React, { useState } from "react";
import { useTranslate, useShow, useApiUrl, useInvalidate } from "@refinedev/core";
import { Show, ListButton } from "@refinedev/antd";
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Button,
    Input,
    Divider,
    message,
    Form,
    Tag,
} from "antd";
import { CheckOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { StatusDemandeProParticulierTag } from "./components/status-demande-pro-particulier-tag";
import { DateDisplayField } from "@/components/table";
import { SpinLoader } from "@/components/loading";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";
import { FilePreviewModal } from "@/pages/users/components/file-preview";
import { getImageUrl } from "@/lib/helpers/url.helper";
import axios from "axios";

const { Text } = Typography;

export const ShowDemandeProParticulier = () => {
    const translate = useTranslate();
    const { id } = useParams<{ id: string }>();
    const apiUrl = useApiUrl();
    const invalidate = useInvalidate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectForm] = Form.useForm();

    const authStorageManager = getLocalStorageProvider();
    const authData = authStorageManager.getAuthData();
    const token = authData?.access_token;

    const { query } = useShow({
        resource: "demandes-pro-particulier",
        id,
    });

    const data = query?.data?.data;
    const isLoading = query?.isLoading;

    const { query: userQuery } = useShow({
        resource: "users",
        id: data?.userId,
        queryOptions: { enabled: !!data?.userId },
    });
    const user = userQuery?.data?.data;

    const handleApprove = async () => {
        try {
            setIsProcessing(true);
            await axios.patch(
                `${apiUrl}/demandes-pro-particulier/${id}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success(translate("demandes_pro_particulier.messages.approveSuccess"));
            invalidate({ resource: "demandes-pro-particulier", invalidates: ["all"] });
        } catch (error: unknown) {
            const errorMessage =
                (error as any)?.response?.data?.message ||
                translate("demandes_pro_particulier.messages.approveError");
            message.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (values: { rejectionReason: string }) => {
        try {
            setIsProcessing(true);
            await axios.patch(
                `${apiUrl}/demandes-pro-particulier/${id}/reject`,
                { rejectionReason: values.rejectionReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success(translate("demandes_pro_particulier.messages.rejectSuccess"));
            rejectForm.resetFields();
            invalidate({ resource: "demandes-pro-particulier", invalidates: ["all"] });
        } catch (error: unknown) {
            const errorMessage =
                (error as any)?.response?.data?.message ||
                translate("demandes_pro_particulier.messages.rejectError");
            message.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <SpinLoader />;
    }

    return (
        <Show
            isLoading={isLoading}
            headerButtons={[<ListButton key="list" />]}
        >
            {/* Statut de la demande */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card
                        title={translate("demandes_pro_particulier.sections.requestInfo")}
                        size="small"
                    >
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            <div>
                                <Text strong>{translate("demandes_pro_particulier.fields.status")}: </Text>
                                {data?.status ? (
                                    <StatusDemandeProParticulierTag status={data.status} />
                                ) : (
                                    <Text>{translate("common.notAvailable")}</Text>
                                )}
                            </div>
                            {data?.rejectionReason && (
                                <div>
                                    <Text strong>{translate("demandes_pro_particulier.fields.rejectionReason")}: </Text>
                                    <Text type="danger">{data.rejectionReason}</Text>
                                </div>
                            )}
                            <div>
                                <Text strong>{translate("fields.created_at")}: </Text>
                                <DateDisplayField value={data?.createdAt} />
                            </div>
                            <div>
                                <Text strong>{translate("fields.updated_at")}: </Text>
                                <DateDisplayField value={data?.updatedAt} />
                            </div>
                        </Space>
                    </Card>
                </Col>

                {/* Informations du demandeur */}
                <Col xs={24} md={12}>
                    <Card
                        title={translate("demandes_pro_particulier.sections.userInfo")}
                        size="small"
                        loading={userQuery?.isLoading}
                    >
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            <div>
                                <Text strong>{translate("users.fields.firstname")}: </Text>
                                <Text>{user?.firstName || translate("common.notAvailable")}</Text>
                            </div>
                            <div>
                                <Text strong>{translate("users.fields.lastname")}: </Text>
                                <Text>{user?.lastName || translate("common.notAvailable")}</Text>
                            </div>
                            <div>
                                <Text strong>{translate("users.fields.email")}: </Text>
                                <Text>{user?.email || translate("common.notAvailable")}</Text>
                            </div>
                            <div>
                                <Text strong>{translate("users.fields.phone_number")}: </Text>
                                <Text>{user?.phoneNumber || translate("common.notAvailable")}</Text>
                            </div>
                            <div>
                                <Text strong>{translate("users.fields.status")}: </Text>
                                {user?.status ? (
                                    <Tag color={user.status === "Active" ? "green" : "red"}>
                                        {translate(`users.fields.${user.status.toLowerCase()}`)}
                                    </Tag>
                                ) : (
                                    <Text>{translate("common.notAvailable")}</Text>
                                )}
                            </div>
                            {user && (
                                <div>
                                    <Link to={`/users/show/${user.id}`}>
                                        <Button type="link" icon={<UserOutlined />} style={{ padding: 0 }}>
                                            {translate("users.common.see_user")}
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Activité et documents */}
            <Divider />
            <Row gutter={[16, 16]}>
                <Col xs={24} md={24}>
                    <Card
                        title={translate("demandes_pro_particulier.sections.documents")}
                        size="small"
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                                <Space direction="vertical" size="small">
                                    <Text strong>{translate("demandes_pro_particulier.fields.activite")}</Text>
                                    <Text>{data?.activite || translate("common.notAvailable")}</Text>
                                </Space>
                            </Col>
                            <Col xs={24} md={8}>
                                <Space direction="vertical" size="small">
                                    <Text strong>{translate("demandes_pro_particulier.fields.photoIdentite")}</Text>
                                    {data?.photoIdentiteId ? (
                                        <FilePreviewModal
                                            fileUrl={getImageUrl(data.photoIdentiteId)}
                                            label={translate("demandes_pro_particulier.fields.viewPhoto")}
                                        />
                                    ) : (
                                        <Text type="secondary">{translate("common.notAvailable")}</Text>
                                    )}
                                </Space>
                            </Col>
                            <Col xs={24} md={8}>
                                <Space direction="vertical" size="small">
                                    <Text strong>{translate("demandes_pro_particulier.fields.pieceIdentite")}</Text>
                                    {data?.pieceIdentiteId ? (
                                        <FilePreviewModal
                                            fileUrl={getImageUrl(data.pieceIdentiteId)}
                                            label={translate("demandes_pro_particulier.fields.viewPiece")}
                                        />
                                    ) : (
                                        <Text type="secondary">{translate("common.notAvailable")}</Text>
                                    )}
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {data?.status === "pending" && (
                <>
                    <Divider />
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Card
                                title={translate("demandes_pro_particulier.sections.approve")}
                                size="small"
                            >
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    loading={isProcessing}
                                    onClick={handleApprove}
                                    style={{ width: "100%" }}
                                >
                                    {translate("demandes_pro_particulier.actions.approve")}
                                </Button>
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card
                                title={translate("demandes_pro_particulier.sections.reject")}
                                size="small"
                            >
                                <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
                                    <Form.Item
                                        name="rejectionReason"
                                        label={translate("demandes_pro_particulier.fields.rejectionReason")}
                                        rules={[{ required: true, message: translate("demandes_pro_particulier.validation.rejectionReason") }]}
                                    >
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                    <Button
                                        danger
                                        htmlType="submit"
                                        icon={<CloseOutlined />}
                                        loading={isProcessing}
                                        style={{ width: "100%" }}
                                    >
                                        {translate("demandes_pro_particulier.actions.reject")}
                                    </Button>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Show>
    );
};
