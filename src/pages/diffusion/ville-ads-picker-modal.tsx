import React, { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { Modal, Spin, Empty, Pagination, Button, Space, Typography, Checkbox, Segmented, Input } from "antd";
import { HomeOutlined, BankOutlined, SearchOutlined } from "@ant-design/icons";
import { StatusValidationResidenceTag } from "@/pages/residences/components";
import { StatusValidationBiensImmobilersTag } from "@/pages/biens-immobiliers/components/status-validation-biens-immobilers-tag";
import { getApiFileUrl } from "@/lib/helpers";
import { T } from "./tokens";

const { Text } = Typography;

type EntityResource = "residences" | "biens-immobiliers";

const MAX_IMAGES_PER_ENTITY = 4;

export interface EntityPick {
    id: string;
    images: { id: string; url: string }[]; // jusqu'à 4 — la première sert d'aperçu dans le sheet
    nom: string;
    resource: EntityResource;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (items: EntityPick[]) => void;
    multiple?: boolean;
}

const PAGE_SIZE = 12;

function pickedImages(record: any): { id: string; url: string }[] {
    const ids: string[] = (record?.images ?? []).slice(0, MAX_IMAGES_PER_ENTITY).filter(Boolean);
    return ids.map((id) => ({ id, url: getApiFileUrl(id) }));
}

const RESOURCE_OPTIONS = [
    { label: "Résidences", value: "residences" as const },
    { label: "Biens immobiliers", value: "biens-immobiliers" as const },
];

export function VilleAdsPickerModal({ open, onClose, onConfirm, multiple = true }: Props) {
    const [resource, setResource] = useState<EntityResource>("residences");
    const [current, setCurrent] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Map<string, EntityPick>>(new Map());

    useEffect(() => {
        if (open) {
            setResource("residences");
            setCurrent(1);
            setSearchInput("");
            setSearch("");
            setSelected(new Map());
        }
    }, [open]);

    useEffect(() => {
        setCurrent(1);
    }, [resource, search]);

    // Debounce la recherche — tape sur ville/adresse/nom côté backend (_search générique)
    useEffect(() => {
        const timeout = setTimeout(() => setSearch(searchInput.trim()), 400);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const { data, isLoading } = useList({
        resource,
        pagination: { current, pageSize: PAGE_SIZE },
        filters: search ? [{ field: "q", operator: "eq", value: search }] : [],
        sorters: [{ field: "createdAt", order: "desc" }],
        queryOptions: { enabled: open },
    });

    const items = data?.data ?? [];
    const total = data?.total ?? 0;

    const entryKey = (id: string) => `${resource}:${id}`;

    const toggle = (record: any) => {
        setSelected((prev) => {
            const k = entryKey(record.id);
            const alreadyPicked = prev.has(k);

            if (!multiple) {
                return alreadyPicked
                    ? new Map()
                    : new Map([[k, {
                        id: record.id,
                        images: pickedImages(record),
                        nom: record?.nom ?? "",
                        resource,
                    }]]);
            }

            const next = new Map(prev);
            if (alreadyPicked) {
                next.delete(k);
            } else {
                next.set(k, {
                    id: record.id,
                    images: pickedImages(record),
                    nom: record?.nom ?? "",
                    resource,
                });
            }
            return next;
        });
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selected.values()));
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={multiple ? "Sélectionner des résidences ou biens immobiliers" : "Sélectionner une résidence ou un bien immobilier"}
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
            <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }} size={12}>
                <Segmented options={RESOURCE_OPTIONS} value={resource} onChange={(v) => setResource(v as EntityResource)} />
                <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Rechercher par ville, nom, adresse…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                {multiple && selected.size > 0 && (
                    <Text style={{ fontSize: 12, color: T.ink60 }}>
                        {selected.size} élément(s) sélectionné(s) au total (résidences + biens immobiliers confondus).
                    </Text>
                )}
            </Space>

            <Spin spinning={isLoading}>
                {items.length === 0 && !isLoading ? (
                    <Empty description="Aucun résultat" />
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
                            const k = entryKey(record.id);
                            const isChecked = selected.has(k);
                            const imageUrl = pickedImages(record)[0]?.url ?? null;
                            return (
                                <div
                                    key={k}
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
                                        ) : resource === "residences" ? (
                                            <HomeOutlined style={{ color: "#FFFFFF", fontSize: 26, opacity: 0.85 }} />
                                        ) : (
                                            <BankOutlined style={{ color: "#FFFFFF", fontSize: 26, opacity: 0.85 }} />
                                        )}
                                        {record.statusValidation && (
                                            <div style={{ position: "absolute", top: 6, left: 6 }}>
                                                {resource === "residences" ? (
                                                    <StatusValidationResidenceTag statusValidation={record.statusValidation} />
                                                ) : (
                                                    <StatusValidationBiensImmobilersTag statusValidation={record.statusValidation} />
                                                )}
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
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            color: T.ink60,
                                            display: "block",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {resource === "residences" ? record?.ville : record?.adresse}
                                    </Text>
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
