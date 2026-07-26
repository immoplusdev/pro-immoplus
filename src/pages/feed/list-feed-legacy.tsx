import React, { useState } from "react";
import { useTranslate, useDelete, useInvalidate } from "@refinedev/core";
import { List, useTable } from "@refinedev/antd";
import { Space, Button, Typography, message, Pagination } from "antd";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { FeedLegacyBentoGrid } from "./components/feed-legacy-bento-grid";
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

    const [migratingId, setMigratingId] = useState<string | null>(null);

    const {
        tableProps,
        filters,
        setFilters,
        current,
        setCurrent,
        pageSize,
        setPageSize,
        tableQueryResult,
    } = useTable({
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

    const handleMigrate = async (recordId: string) => {
        setMigratingId(recordId);
        try {
            await axiosInstance.post(`${API_URL}/feed/admin/legacy/${recordId}/migrate`);
            message.success(translate("feed.legacy.migrateSuccess"));
            invalidate({ resource: "feed-legacy", invalidates: ["list"] });
        } catch (error: any) {
            message.error(error?.response?.data?.message || translate("common.error"));
        } finally {
            setMigratingId(null);
        }
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

            <FeedLegacyBentoGrid
                dataSource={tableProps.dataSource}
                loading={!!tableProps.loading}
                onDelete={handleDelete}
                onMigrate={handleMigrate}
                migratingId={migratingId}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <Pagination
                    current={current}
                    pageSize={pageSize}
                    total={tableQueryResult?.data?.total ?? 0}
                    showSizeChanger
                    onChange={(page, newPageSize) => {
                        setCurrent(page);
                        setPageSize(newPageSize);
                    }}
                />
            </div>
        </List>
    );
};
