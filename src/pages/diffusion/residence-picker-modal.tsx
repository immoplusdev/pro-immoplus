import React, { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { Modal, Spin, Empty, Pagination, Button, Space, Typography, Checkbox } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { StatusValidationResidenceTag } from "@/pages/residences/components";
import { StatusValidationResidence } from "@/core/domain/residences";
import { getApiFileUrl } from "@/lib/helpers";
import { T } from "./tokens";

const { Text } = Typography;

export interface ResidencePick {
    id: string;
    imageId: string | null;
    imageUrl: string | null;
    nom: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (items: ResidencePick[]) => void;
}

const PAGE_SIZE = 12;

function firstImageId(record: any): string | null {
    return record?.images?.[0] ?? null;
}

function firstImageUrl(record: any): string | null {
    const id = firstImageId(record);
    return id ? getApiFileUrl(id) : null;
}

const STATUS_OPTIONS = [
    { label: "✅ Validées", value: StatusValidationResidence.Valide },
    { label: "⏳ En attente", value: StatusValidationResidence.EnAttenteValidation },
    { label: "❌ Rejetées", value: StatusValidationResidence.Rejete },
];

export function ResidencePickerModal({ open, onClose, onConfirm }: Props) {
    const [current, setCurrent] = useState(1);
    const [status, setStatus] = useState<string | null>(StatusValidationResidence.Valide);
    const [selected, setSelected] = useState<Map<string, ResidencePick>>(new Map());

    useEffect(() => {
        if (open) {
            setCurrent(1);
            setStatus(StatusValidationResidence.Valide);
            setSelected(new Map());
        }
    }, [open]);

    const { data, isLoading } = useList({
        resource: "residences",
        pagination: { current, pageSize: PAGE_SIZE },
        filters: status ? [{ field: "statusValidation", operator: "eq", value: status }] : [],
        sorters: [{ field: "createdAt", order: "desc" }],
        queryOptions: { enabled: open },
    });

    const items = data?.data ?? [];
    const total = data?.total ?? 0;

    const toggle = (record: any) => {
        setSelected((prev) => {
            const next = new Map(prev);
            if (next.has(record.id)) {
                next.delete(record.id);
            } else {
                next.set(record.id, {
                    id: record.id,
                    imageId: firstImageId(record),
                    imageUrl: firstImageUrl(record),
                    nom: record?.nom ?? "",
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
            title="Sélectionner des résidences"
            width={840}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Annuler
                </Button>,
                <Button key="confirm" type="primary" disabled={selected.size === 0} onClick={handleConfirm}>
                    Ajouter{selected.size > 0 ? ` (${selected.size})` : ""}
                </Button>,
            ]}
        >
            <Space wrap style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 13 }}>Statut :</Text>
                <Button size="small" type={status === null ? "primary" : "default"} onClick={() => handleStatusFilter(null)}>
                    Toutes
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
                    <Empty description="Aucune résidence disponible" />
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
                            const imageUrl = firstImageUrl(record);
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
                                            aspectRatio: "4 / 3",
                                            borderRadius: 6,
                                            background: "#141414",
                                            overflow: "hidden",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: 6,
                                        }}
                                    >
                                        {imageUrl ? (
                                            <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <HomeOutlined style={{ color: "#FFFFFF", fontSize: 26, opacity: 0.85 }} />
                                        )}
                                        {record.statusValidation && (
                                            <div style={{ position: "absolute", top: 6, left: 6 }}>
                                                <StatusValidationResidenceTag statusValidation={record.statusValidation} />
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
                                        {record?.nom || "Sans nom"}
                                    </Text>
                                    {record?.ville && (
                                        <Text style={{ fontSize: 11, color: T.ink60 }}>{record.ville}</Text>
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
