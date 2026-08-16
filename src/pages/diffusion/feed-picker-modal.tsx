import React, { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { Modal, Spin, Empty, Pagination, Button, Space, Typography, Checkbox } from "antd";
import { PlayCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { FeedVideoStatusTag } from "@/pages/feed/components/feed-video-status-tag";
import { T } from "./tokens";

const { Text } = Typography;

export interface FeedVideoPick {
    id: string;
    videoUrl: string;
    title: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (items: FeedVideoPick[]) => void;
    multiple?: boolean;
}

const PAGE_SIZE = 12;

const STATUS_OPTIONS = [
    { label: "🟢 Ready", value: "ready" },
    { label: "⏳ Processing", value: "processing" },
    { label: "❌ Failed", value: "failed" },
    { label: "🗑️ Deleted", value: "deleted" },
];

export function FeedPickerModal({ open, onClose, onConfirm, multiple = true }: Props) {
    const [current, setCurrent] = useState(1);
    const [status, setStatus] = useState<string | null>("ready");
    const [selected, setSelected] = useState<Map<string, FeedVideoPick>>(new Map());

    useEffect(() => {
        if (open) {
            setCurrent(1);
            setStatus("ready");
            setSelected(new Map());
        }
    }, [open]);

    const { data, isLoading } = useList({
        resource: "feed",
        pagination: { current, pageSize: PAGE_SIZE },
        filters: status ? [{ field: "status", operator: "eq", value: status }] : [],
        sorters: [{ field: "createdAt", order: "desc" }],
        queryOptions: { enabled: open },
    });

    const items = data?.data ?? [];
    const total = data?.total ?? 0;

    const toggle = (record: any) => {
        setSelected((prev) => {
            const alreadyPicked = prev.has(record.id);
            if (!multiple) {
                return alreadyPicked
                    ? new Map()
                    : new Map([[record.id, {
                        id: record.id,
                        videoUrl: record.videoUrl,
                        title: record?.content?.title ?? "",
                    }]]);
            }
            const next = new Map(prev);
            if (alreadyPicked) {
                next.delete(record.id);
            } else {
                next.set(record.id, {
                    id: record.id,
                    videoUrl: record.videoUrl,
                    title: record?.content?.title ?? "",
                });
            }
            return next;
        });
    };

    const handleStatusFilter = (value: string | null) => {
        setStatus(value);
        setCurrent(1);
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selected.values()));
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={multiple ? "Sélectionner des vidéos du flux" : "Sélectionner une vidéo du flux"}
            width={840}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Annuler
                </Button>,
                <Button key="confirm" type="primary" disabled={selected.size === 0} onClick={handleConfirm}>
                    {multiple ? `Ajouter${selected.size > 0 ? ` (${selected.size})` : ""}` : "Choisir"}
                </Button>,
            ]}
        >
            <Space wrap style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 13 }}>Statut :</Text>
                <Button size="small" type={status === null ? "primary" : "default"} onClick={() => handleStatusFilter(null)}>
                    Tous
                </Button>
                {STATUS_OPTIONS.map((option) => (
                    <Button
                        key={option.value}
                        size="small"
                        type={status === option.value ? "primary" : "default"}
                        onClick={() => handleStatusFilter(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </Space>

            <Spin spinning={isLoading}>
                {items.length === 0 && !isLoading ? (
                    <Empty description="Aucune vidéo disponible" />
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                            gap: 10,
                            minHeight: 200,
                        }}
                    >
                        {items.map((record: any) => {
                            const isChecked = selected.has(record.id);
                            const title = record?.content?.title || "Sans titre";
                            const location = record?.content?.location;
                            return (
                                <div
                                    key={record.id}
                                    onClick={() => toggle(record)}
                                    style={{
                                        position: "relative",
                                        border: `1.5px solid ${isChecked ? T.primary : T.ink12}`,
                                        borderRadius: 10,
                                        padding: 8,
                                        cursor: "pointer",
                                        background: isChecked ? `${T.primary}0D` : "#FFFFFF",
                                    }}
                                >
                                    <Checkbox
                                        checked={isChecked}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={() => toggle(record)}
                                        style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
                                    />
                                    <div
                                        style={{
                                            position: "relative",
                                            width: "100%",
                                            aspectRatio: "9 / 12",
                                            borderRadius: 6,
                                            background: "#141414",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: 6,
                                        }}
                                    >
                                        <PlayCircleOutlined style={{ color: "#FFFFFF", fontSize: 26, opacity: 0.85 }} />
                                        {record.status && (
                                            <div style={{ position: "absolute", top: 6, left: 6 }}>
                                                <FeedVideoStatusTag status={record.status} />
                                            </div>
                                        )}
                                    </div>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            display: "block",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {title}
                                    </Text>
                                    {location && (
                                        <Text style={{ fontSize: 11, color: T.ink60, display: "flex", alignItems: "center", gap: 4 }}>
                                            <EnvironmentOutlined /> {location}
                                        </Text>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Spin>

            {total > PAGE_SIZE && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                    <Pagination
                        size="small"
                        current={current}
                        pageSize={PAGE_SIZE}
                        total={total}
                        showSizeChanger={false}
                        onChange={setCurrent}
                    />
                </div>
            )}
        </Modal>
    );
}
