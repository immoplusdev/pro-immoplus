import { useState, useEffect, useRef } from "react";
import { useTranslate } from "@refinedev/core";
import {
    Table,
    Space,
    Button,
    Typography,
    Popconfirm,
    message,
    Switch,
    Select,
    Modal,
    Tag,
    Tooltip,
    Empty,
    Skeleton,
    Badge,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    MenuOutlined,
    ReloadOutlined,
    TagOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { BannerAudienceTag } from "./components/banner-audience-tag";
import { BannerTypeTag } from "./components/banner-type-tag";
import { BannerPreview } from "./components/banner-preview";

const { Text } = Typography;

interface Banner {
    id: number;
    title: string;
    subtitle: string | null;
    cta_label: string | null;
    cta2_label: string | null;
    icon: string;
    bg_color: string;
    icon_color: string | null;
    text_color: string | null;
    type: string;
    audience: string;
    order: number;
    active: boolean;
    dismissible: boolean;
    created_at: string;
}

export const ListBanners = () => {
    const translate = useTranslate();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterAudience, setFilterAudience] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterActive, setFilterActive] = useState<boolean | null>(null);
    const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
    const dragIdRef = useRef<number | null>(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`${API_URL}/banners`);
            const items: Banner[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            setBanners(items.sort((a, b) => a.order - b.order));
        } catch {
            message.error(translate("banners.messages.loadError") || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const filteredBanners = banners.filter((b) => {
        if (filterAudience && b.audience !== filterAudience) return false;
        if (filterType && b.type !== filterType) return false;
        if (filterActive !== null && b.active !== filterActive) return false;
        return true;
    });

    const handleToggle = async (banner: Banner) => {
        const newActive = !banner.active;
        setBanners((prev) =>
            prev.map((b) => (b.id === banner.id ? { ...b, active: newActive } : b))
        );
        try {
            await axiosInstance.patch(`${API_URL}/banners/${banner.id}`, { active: newActive });
            message.success(translate("banners.messages.toggleSuccess") || "Mis à jour");
        } catch {
            setBanners((prev) =>
                prev.map((b) => (b.id === banner.id ? { ...b, active: banner.active } : b))
            );
            message.error(translate("banners.messages.toggleError") || "Erreur");
        }
    };

    const handleDelete = (id: number) => {
        const prev = [...banners];
        setBanners((b) => b.filter((x) => x.id !== id));
        axiosInstance.delete(`${API_URL}/banners/${id}`).then(() => {
            message.success(translate("banners.messages.deleteSuccess") || "Bannière supprimée");
        }).catch(() => {
            setBanners(prev);
            message.error(translate("common.error") || "Erreur");
        });
    };

    const handleDrop = async (targetId: number) => {
        const dragId = dragIdRef.current;
        if (dragId === null || dragId === targetId) return;

        const dragIdx = banners.findIndex((b) => b.id === dragId);
        const targetIdx = banners.findIndex((b) => b.id === targetId);
        if (dragIdx === -1 || targetIdx === -1) return;

        const reordered = [...banners];
        const [moved] = reordered.splice(dragIdx, 1);
        reordered.splice(targetIdx, 0, moved);

        const withOrder = reordered.map((b, i) => ({ ...b, order: i + 1 }));
        setBanners(withOrder);
        dragIdRef.current = null;

        try {
            await Promise.all(
                withOrder.map((b) =>
                    axiosInstance.patch(`${API_URL}/banners/${b.id}`, { order: b.order })
                )
            );
        } catch {
            setBanners(banners);
            message.error(translate("banners.messages.reorderError") || "Erreur de réordonnancement");
        }
    };

    const columns = [
        {
            key: "drag",
            width: 36,
            render: () => (
                <MenuOutlined style={{ cursor: "grab", color: "#bbb", fontSize: 14 }} />
            ),
        },
        {
            dataIndex: "title",
            title: translate("banners.fields.title") || "Bannière",
            render: (title: string, record: Banner) => (
                <Space>
                    <div
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: record.bg_color,
                            flexShrink: 0,
                        }}
                    />
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ opacity: record.active ? 1 : 0.45 }}>
                            {title}
                        </Text>
                        {record.subtitle && (
                            <Text
                                type="secondary"
                                style={{ fontSize: 12, opacity: record.active ? 1 : 0.45 }}
                                ellipsis
                            >
                                {record.subtitle.length > 48
                                    ? record.subtitle.slice(0, 48) + "…"
                                    : record.subtitle}
                            </Text>
                        )}
                    </Space>
                </Space>
            ),
        },
        {
            dataIndex: "audience",
            title: translate("banners.fields.audience") || "Audience",
            align: "center" as const,
            render: (v: string) => <BannerAudienceTag audience={v} />,
        },
        {
            dataIndex: "type",
            title: translate("banners.fields.type") || "Type",
            align: "center" as const,
            render: (v: string) => <BannerTypeTag type={v} />,
        },
        {
            dataIndex: "active",
            title: translate("banners.fields.active") || "Statut",
            align: "center" as const,
            render: (active: boolean, record: Banner) => (
                <Tooltip title={active ? "Désactiver" : "Activer"}>
                    <Switch
                        checked={active}
                        size="small"
                        onChange={() => handleToggle(record)}
                    />
                </Tooltip>
            ),
        },
        {
            dataIndex: "order",
            title: translate("banners.fields.order") || "Ordre",
            align: "center" as const,
            render: (v: number) => <Badge count={v} color="blue" showZero />,
        },
        {
            title: translate("table.actions") || "Actions",
            align: "center" as const,
            render: (_: unknown, record: Banner) => (
                <Space>
                    <Tooltip title="Prévisualiser">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => setPreviewBanner(record)}
                        />
                    </Tooltip>
                    <Link to={`/banners/${record.id}/edit`}>
                        <Button size="small" icon={<EditOutlined />} />
                    </Link>
                    <Popconfirm
                        title={translate("common.deleteTitle") || "Supprimer cette bannière ?"}
                        description={`"${record.title}" — Cette action est irréversible.`}
                        onConfirm={() => handleDelete(record.id)}
                        okText={translate("common.yes") || "Supprimer"}
                        cancelText={translate("common.no") || "Annuler"}
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <div>
                    <Space>
                        <TagOutlined style={{ fontSize: 20 }} />
                        <Text style={{ fontSize: 20, fontWeight: 700 }}>
                            {translate("banners.title") || "Bannières"}
                        </Text>
                    </Space>
                    <br />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {translate("banners.subtitle") ||
                            "Gérez les bannières affichées dans les apps client et pro."}
                    </Text>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchBanners} loading={loading} />
                    <Link to="/banners/new">
                        <Button type="primary" icon={<PlusOutlined />}>
                            {translate("banners.actions.create") || "Créer une bannière"}
                        </Button>
                    </Link>
                </Space>
            </div>

            {/* Filtres */}
            <Space wrap style={{ marginBottom: 16 }}>
                <Select
                    allowClear
                    placeholder={translate("banners.filters.audience") || "Audience"}
                    style={{ width: 160 }}
                    onChange={(v) => setFilterAudience(v ?? null)}
                    options={[
                        { label: "👤 App Client", value: "buyer" },
                        { label: "🏢 App Pro", value: "seller" },
                        { label: "🌐 Les deux", value: "all" },
                    ]}
                />
                <Select
                    allowClear
                    placeholder={translate("banners.filters.type") || "Type"}
                    style={{ width: 160 }}
                    onChange={(v) => setFilterType(v ?? null)}
                    options={[
                        { label: "Promotionnel", value: "promo" },
                        { label: "Notification", value: "notification" },
                    ]}
                />
                <Select
                    allowClear
                    placeholder={translate("banners.filters.status") || "Statut"}
                    style={{ width: 140 }}
                    onChange={(v) => setFilterActive(v ?? null)}
                    options={[
                        { label: "✅ Active", value: true },
                        { label: "⏸️ Inactive", value: false },
                    ]}
                />
            </Space>

            {/* Tableau */}
            {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : filteredBanners.length === 0 ? (
                <Empty
                    description={
                        <Space direction="vertical">
                            <Text>{translate("banners.empty") || "Aucune bannière trouvée."}</Text>
                            <Link to="/banners/new">
                                <Button type="primary" icon={<PlusOutlined />} size="small">
                                    Créer une bannière
                                </Button>
                            </Link>
                        </Space>
                    }
                />
            ) : (
                <Table
                    dataSource={filteredBanners}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    rowClassName={(record) => (!record.active ? "opacity-50" : "")}
                    onRow={(record) => ({
                        draggable: true,
                        style: { cursor: "grab" },
                        onDragStart: () => {
                            dragIdRef.current = record.id;
                        },
                        onDragEnd: () => {
                            dragIdRef.current = null;
                        },
                        onDragOver: (e: React.DragEvent) => e.preventDefault(),
                        onDrop: () => handleDrop(record.id),
                    })}
                />
            )}

            {/* Modale prévisualisation */}
            <Modal
                open={!!previewBanner}
                onCancel={() => setPreviewBanner(null)}
                footer={null}
                title={`Prévisualisation — ${previewBanner?.title ?? ""}`}
                width={480}
            >
                {previewBanner && (
                    <div style={{ padding: "8px 0" }}>
                        <BannerPreview
                            title={previewBanner.title}
                            subtitle={previewBanner.subtitle ?? undefined}
                            cta_label={previewBanner.cta_label ?? undefined}
                            cta2_label={previewBanner.cta2_label ?? undefined}
                            icon={previewBanner.icon}
                            bg_color={previewBanner.bg_color}
                            icon_color={previewBanner.icon_color ?? undefined}
                            text_color={previewBanner.text_color ?? undefined}
                            dismissible={previewBanner.dismissible}
                        />
                        <Space style={{ marginTop: 16 }} wrap>
                            <BannerAudienceTag audience={previewBanner.audience} />
                            <BannerTypeTag type={previewBanner.type} />
                            <Tag color={previewBanner.active ? "success" : "default"}>
                                {previewBanner.active ? "Active" : "Inactive"}
                            </Tag>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};
