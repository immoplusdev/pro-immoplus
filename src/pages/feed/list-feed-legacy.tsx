import React from "react";
import { BaseRecord, useTranslate, useDelete, useInvalidate } from "@refinedev/core";
import { List, useTable } from "@refinedev/antd";
import { Table, Space, Button, Typography, Popconfirm, message, Tag } from "antd";
import { Link } from "react-router-dom";
import { ArrowRightOutlined, EyeOutlined, LikeOutlined, HomeOutlined, DeleteOutlined } from "@ant-design/icons";
import { DateDisplayField } from "@/components/table";
import { FeedEntityTag } from "./components/feed-entity-tag";
import { FeedVideoStatusTag } from "./components/feed-video-status-tag";
import type { CrudFilter } from "@refinedev/core/src/contexts/data/types";

const { Text } = Typography;

const STATUS_OPTIONS = [
    { label: "🟢 Ready", value: "ready" },
    { label: "⏳ Processing", value: "processing" },
    { label: "❌ Failed", value: "failed" },
    { label: "🗑️ Deleted", value: "deleted" },
];

export const ListFeedLegacy = () => {
    const translate = useTranslate();
    const invalidate = useInvalidate();
    const { mutate: deleteVideo } = useDelete();

    const { tableProps, filters, setFilters } = useTable({
        resource: "feed-legacy",
        syncWithLocation: true,
        sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    });

    const selectedStatus =
        (filters as CrudFilter[])?.find(
            (f) => "field" in f && f.field === "status"
        ) as { value?: string } | undefined;
    const activeStatus = selectedStatus?.value ?? null;

    const handleStatusFilter = (status: string | null) => {
        if (status) {
            setFilters([{ field: "status", operator: "eq" as const, value: status }]);
        } else {
            setFilters([]);
        }
    };

    const handleDelete = (recordId: string) => {
        deleteVideo(
            { resource: "feed/videos", id: recordId },
            {
                onSuccess: () => {
                    message.success(translate("common.deleteSuccess"));
                    invalidate({ resource: "feed-legacy", invalidates: ["list"] });
                },
                onError: () => {
                    message.error(translate("common.error"));
                },
            }
        );
    };

    return (
        <List
            title={translate("feed.sections.legacyFlow")}
            headerButtons={[
                <Link key="home" to="/feed">
                    <Button icon={<HomeOutlined />}>
                        {translate("feed.actions.backToHome")}
                    </Button>
                </Link>,
            ]}
        >
            {/* Filtres Status */}
            <div style={{ marginBottom: 16 }}>
                <Space wrap>
                    <Text strong>{translate("feed.filters.status") || "Status:"}</Text>
                    <Button
                        type={activeStatus === null ? "primary" : "default"}
                        onClick={() => handleStatusFilter(null)}
                    >
                        {translate("feed.filters.all") || "All"}
                    </Button>
                    {STATUS_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            type={activeStatus === option.value ? "primary" : "default"}
                            onClick={() => handleStatusFilter(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </Space>
            </div>

            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex={["content", "title"]}
                    title={translate("feed.fields.title")}
                    render={(value, record: BaseRecord) => (
                        <Space direction="vertical" size={0}>
                            <Text strong>{value}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.shortCode}
                            </Text>
                        </Space>
                    )}
                />
                <Table.Column
                    dataIndex={["author", "name"]}
                    title={translate("feed.fields.author")}
                />
                <Table.Column
                    dataIndex={["relatedTo", "entity"]}
                    title={translate("feed.fields.entity")}
                    align="center"
                    render={(value) =>
                        value ? (
                            <FeedEntityTag entity={value} />
                        ) : (
                            <Text type="secondary">-</Text>
                        )
                    }
                />
                <Table.Column
                    dataIndex={["content", "price"]}
                    title={translate("feed.fields.price")}
                    align="center"
                />
                <Table.Column
                    dataIndex={["content", "location"]}
                    title={translate("feed.fields.location")}
                    ellipsis
                />
                <Table.Column
                    dataIndex="status"
                    title={translate("feed.fields.status")}
                    align="center"
                    render={(value) =>
                        value ? <FeedVideoStatusTag status={value} /> : null
                    }
                />
                <Table.Column
                    dataIndex="stats"
                    title={translate("feed.fields.stats")}
                    align="center"
                    render={(stats) => (
                        <Space size={12}>
                            <Space size={4}>
                                <LikeOutlined />
                                <Text>{stats?.likes ?? 0}</Text>
                            </Space>
                            <Space size={4}>
                                <EyeOutlined />
                                <Text>{stats?.views ?? 0}</Text>
                            </Space>
                        </Space>
                    )}
                />
                <Table.Column
                    dataIndex="migratedAt"
                    title={translate("feed.legacy.migratedLabel")}
                    align="center"
                    render={(value: string | null) =>
                        value ? (
                            <Tag color="success">{translate("feed.legacy.migratedYes")}</Tag>
                        ) : (
                            <Tag>{translate("feed.legacy.migratedNo")}</Tag>
                        )
                    }
                />
                <Table.Column
                    dataIndex="createdAt"
                    title={translate("fields.created_at")}
                    align="center"
                    sorter={true}
                    render={(date: string) => <DateDisplayField value={date} />}
                />
                <Table.Column
                    title={translate("table.actions")}
                    dataIndex="actions"
                    align="center"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <Link to={`/feed/legacy/show/${record.id}`}>
                                <Button size="small" icon={<ArrowRightOutlined />} />
                            </Link>
                            <Popconfirm
                                title={translate("common.deleteTitle")}
                                description={translate("common.deleteConfirm")}
                                onConfirm={() => handleDelete(record.id as string)}
                                okText={translate("common.yes")}
                                cancelText={translate("common.no")}
                            >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
