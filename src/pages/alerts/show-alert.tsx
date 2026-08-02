import React, { useState } from "react";
import { useTranslate, useApiUrl, useInvalidate, useShow, useOne } from "@refinedev/core";
import { Show, ListButton } from "@refinedev/antd";
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Button,
    Form,
    Input,
    Select,
    Divider,
    message,
    Popconfirm,
    Empty,
    Descriptions,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseOutlined,
    UserOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { AlertStatusTag } from "./components/alert-status-tag";
import { DateDisplayField, OutlineTag } from "@/components/table";
import { SpinLoader } from "@/components/loading";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";
import axios from "axios";

const { Text, Title } = Typography;
const { TextArea } = Input;

interface ConciergeNote {
    id: string;
    alertId: string;
    message: string;
    proposedItemId?: string;
    entityType?: string;
    authorId: string;
    createdAt: string;
}

interface AlertData {
    id: string;
    userId: string;
    title: string;
    targetType: string;
    descriptionClient?: string;
    criteria?: Record<string, unknown>;
    status: string;
    matchCount: number;
    unreadMatchCount: number;
    notesAdminConcierge?: ConciergeNote[];
    lastViewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const ShowAlert = () => {
    const translate = useTranslate();
    const { id } = useParams<{ id: string }>();
    const apiUrl = useApiUrl();
    const invalidate = useInvalidate();

    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const authStorageManager = getLocalStorageProvider();
    const authData = authStorageManager.getAuthData();
    const token = authData?.access_token;

    const authHeaders = { Authorization: `Bearer ${token}` };

    const { query } = useShow<AlertData>({
        resource: "alerts",
        id,
    });

    const data = query?.data?.data as AlertData | undefined;
    const isLoading = query?.isLoading;

    const { data: userData, isLoading: userLoading } = useOne<any>({
        resource: "users",
        id: data?.userId ?? "",
        queryOptions: { enabled: !!data?.userId },
    });

    const refreshAlert = () => {
        invalidate({ resource: "alerts", invalidates: ["all"] });
    };

    const handleAddNote = async (values: {
        message: string;
        proposed_item_id?: string;
        entity_type?: string;
    }) => {
        try {
            setIsSubmitting(true);
            await axios.post(
                `${apiUrl}/alerts/${id}/concierge-notes`,
                {
                    message: values.message,
                    proposed_item_id: values.proposed_item_id || undefined,
                    entity_type: values.entity_type || "bien_immobilier",
                },
                { headers: authHeaders }
            );
            message.success(translate("alerts.messages.noteAdded"));
            addForm.resetFields();
            refreshAlert();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err?.response?.data?.message || translate("alerts.messages.noteError")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditNote = async (
        noteId: string,
        values: { message?: string; proposed_item_id?: string }
    ) => {
        try {
            setIsSubmitting(true);
            await axios.patch(
                `${apiUrl}/alerts/${id}/concierge-notes/${noteId}`,
                {
                    message: values.message,
                    proposed_item_id: values.proposed_item_id || undefined,
                },
                { headers: authHeaders }
            );
            message.success(translate("alerts.messages.noteUpdated"));
            setEditingNoteId(null);
            editForm.resetFields();
            refreshAlert();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err?.response?.data?.message || translate("alerts.messages.noteError")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            setIsSubmitting(true);
            await axios.delete(
                `${apiUrl}/alerts/${id}/concierge-notes/${noteId}`,
                { headers: authHeaders }
            );
            message.success(translate("alerts.messages.noteDeleted"));
            refreshAlert();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            message.error(
                err?.response?.data?.message || translate("alerts.messages.noteError")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (note: ConciergeNote) => {
        setEditingNoteId(note.id);
        editForm.setFieldsValue({
            message: note.message,
            proposed_item_id: note.proposedItemId,
        });
    };

    const cancelEditing = () => {
        setEditingNoteId(null);
        editForm.resetFields();
    };

    const renderCriteria = (criteria: Record<string, unknown>) => {
        return Object.entries(criteria).map(([key, value]) => (
            <Descriptions.Item key={key} label={key}>
                {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value ?? "-")}
            </Descriptions.Item>
        ));
    };

    if (isLoading) {
        return <SpinLoader />;
    }

    const notes: ConciergeNote[] = data?.notesAdminConcierge ?? [];

    return (
        <Show isLoading={isLoading} headerButtons={[<ListButton key="list" />]}>
            <Row gutter={[16, 16]}>
                {/* Informations générales */}
                <Col xs={24} md={12}>
                    <Card
                        title={translate("alerts.sections.alertInfo")}
                        size="small"
                    >
                        <Space direction="vertical" size="small" style={{ width: "100%" }}>
                            <div>
                                <Text strong>{translate("alerts.fields.title")}: </Text>
                                <Text>{data?.title || "-"}</Text>
                            </div>
                            <div>
                                <Text strong>{translate("alerts.fields.targetType")}: </Text>
                                <Text>
                                    {data?.targetType
                                        ? translate(`alerts.targetType.${data.targetType}`)
                                        : "-"}
                                </Text>
                            </div>
                            <div>
                                <Text strong>{translate("alerts.fields.status")}: </Text>
                                {data?.status ? (
                                    <AlertStatusTag status={data.status} />
                                ) : (
                                    <Text>-</Text>
                                )}
                            </div>
                            <div>
                                <Text strong>{translate("alerts.fields.matchCount")}: </Text>
                                <OutlineTag color="#185FA5">{data?.matchCount ?? 0}</OutlineTag>
                            </div>
                            <div>
                                <Text strong>
                                    {translate("alerts.fields.unreadMatchCount")}:{" "}
                                </Text>
                                <OutlineTag color={data?.unreadMatchCount ? "#C13838" : "#5F5E5A"}>
                                    {data?.unreadMatchCount ?? 0}
                                </OutlineTag>
                            </div>
                            <div>
                                <Text strong>{translate("fields.created_at")}: </Text>
                                <DateDisplayField value={data?.createdAt ?? ""} />
                            </div>
                            <div>
                                <Text strong>{translate("fields.updated_at")}: </Text>
                                <DateDisplayField value={data?.updatedAt ?? ""} />
                            </div>
                        </Space>
                    </Card>
                </Col>

                {/* Description client */}
                <Col xs={24} md={12}>
                    <Card
                        title={translate("alerts.sections.clientDescription")}
                        size="small"
                        style={{ height: "100%" }}
                    >
                        <Text type="secondary">
                            {data?.descriptionClient || translate("common.notAvailable")}
                        </Text>
                    </Card>
                </Col>

                {/* Client */}
                {data?.userId && (
                    <Col xs={24} md={12}>
                        <Card
                            size="small"
                            title={
                                <Space>
                                    <UserOutlined />
                                    <span>Client</span>
                                </Space>
                            }
                            extra={
                                <Link to={`/users/edit/${data.userId}`}>
                                    <Button size="small" icon={<ArrowRightOutlined />}>
                                        Détails
                                    </Button>
                                </Link>
                            }
                            loading={userLoading}
                        >
                            <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Nom complet</Text>
                                    <br />
                                    <Text strong>
                                        {userData?.data?.fullName
                                            || userData?.data?.name
                                            || [userData?.data?.firstName, userData?.data?.lastName].filter(Boolean).join(" ")
                                            || "-"}
                                    </Text>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>E-mail</Text>
                                    <br />
                                    <Text>{userData?.data?.email || "-"}</Text>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Numéro de téléphone</Text>
                                    <br />
                                    <Text>{userData?.data?.phone || userData?.data?.phoneNumber || "-"}</Text>
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Adresse</Text>
                                    <br />
                                    <Text>{userData?.data?.address || "-"}</Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* Critères */}
            {data?.criteria && Object.keys(data.criteria).length > 0 && (
                <>
                    <Divider />
                    <Card
                        title={translate("alerts.sections.criteria")}
                        size="small"
                    >
                        <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
                            {renderCriteria(data.criteria)}
                        </Descriptions>
                    </Card>
                </>
            )}

            {/* Notes Concierge */}
            <Divider />
            <Card
                title={
                    <Space>
                        <Title level={5} style={{ margin: 0 }}>
                            {translate("alerts.sections.conciergeNotes")}
                        </Title>
                        <OutlineTag color="#185FA5">{notes.length}</OutlineTag>
                    </Space>
                }
                size="small"
            >
                {notes.length === 0 ? (
                    <Empty description={translate("alerts.messages.noNotes")} />
                ) : (
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                        {notes.map((note) => (
                            <Card
                                key={note.id}
                                size="small"
                                style={{ background: "#fafafa", borderRadius: 8 }}
                                extra={
                                    <Space>
                                        {editingNoteId !== note.id && (
                                            <>
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => startEditing(note)}
                                                />
                                                <Popconfirm
                                                    title={translate("alerts.messages.confirmDeleteNote")}
                                                    onConfirm={() => handleDeleteNote(note.id)}
                                                    okText={translate("common.yes")}
                                                    cancelText={translate("buttons.cancel")}
                                                >
                                                    <Button
                                                        size="small"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        loading={isSubmitting}
                                                    />
                                                </Popconfirm>
                                            </>
                                        )}
                                    </Space>
                                }
                            >
                                {editingNoteId === note.id ? (
                                    <Form
                                        form={editForm}
                                        layout="vertical"
                                        onFinish={(values) => handleEditNote(note.id, values)}
                                    >
                                        <Form.Item
                                            name="message"
                                            label={translate("alerts.fields.noteMessage")}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: translate("alerts.validation.message"),
                                                },
                                            ]}
                                        >
                                            <TextArea rows={3} />
                                        </Form.Item>
                                        <Form.Item
                                            name="proposed_item_id"
                                            label={translate("alerts.fields.proposedItemId")}
                                        >
                                            <Input
                                                placeholder={translate(
                                                    "alerts.fields.proposedItemIdPlaceholder"
                                                )}
                                            />
                                        </Form.Item>
                                        <Space>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                                loading={isSubmitting}
                                                size="small"
                                            >
                                                {translate("buttons.save")}
                                            </Button>
                                            <Button
                                                icon={<CloseOutlined />}
                                                onClick={cancelEditing}
                                                size="small"
                                            >
                                                {translate("buttons.cancel")}
                                            </Button>
                                        </Space>
                                    </Form>
                                ) : (
                                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                        <Text>{note.message}</Text>
                                        {note.proposedItemId && (
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {translate("alerts.fields.proposedItemId")}:{" "}
                                                    <code>{note.proposedItemId}</code>
                                                </Text>
                                            </div>
                                        )}
                                        {note.entityType && (
                                            <OutlineTag color="#5F5E5A">
                                                {translate(`alerts.entityType.${note.entityType}`)}
                                            </OutlineTag>
                                        )}
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            <DateDisplayField value={note.createdAt} />
                                        </Text>
                                    </Space>
                                )}
                            </Card>
                        ))}
                    </Space>
                )}
            </Card>

            {/* Ajouter une note */}
            <Divider />
            <Card
                title={translate("alerts.sections.addNote")}
                size="small"
            >
                <Form form={addForm} layout="vertical" onFinish={handleAddNote}>
                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                name="message"
                                label={translate("alerts.fields.noteMessage")}
                                rules={[
                                    {
                                        required: true,
                                        message: translate("alerts.validation.message"),
                                    },
                                ]}
                            >
                                <TextArea
                                    rows={3}
                                    placeholder={translate("alerts.fields.noteMessagePlaceholder")}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="proposed_item_id"
                                label={translate("alerts.fields.proposedItemId")}
                            >
                                <Input
                                    placeholder={translate(
                                        "alerts.fields.proposedItemIdPlaceholder"
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="entity_type"
                                label={translate("alerts.fields.entityType")}
                                initialValue="bien_immobilier"
                            >
                                <Select>
                                    <Select.Option value="bien_immobilier">
                                        {translate("alerts.entityType.bien_immobilier")}
                                    </Select.Option>
                                    <Select.Option value="residence">
                                        {translate("alerts.entityType.residence")}
                                    </Select.Option>
                                    <Select.Option value="furniture">
                                        {translate("alerts.entityType.furniture")}
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        loading={isSubmitting}
                    >
                        {translate("alerts.actions.addNote")}
                    </Button>
                </Form>
            </Card>
        </Show>
    );
};
