import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslate } from "@refinedev/core";
import { List } from "@refinedev/antd";
import {
    Alert,
    Badge,
    Button,
    Collapse,
    Dropdown,
    Empty,
    InputNumber,
    Modal,
    Radio,
    Space,
    Table,
    Tabs,
    Typography,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
    ArrowRightOutlined,
    DownOutlined,
    EyeOutlined,
    HomeOutlined,
    LikeOutlined,
    LoadingOutlined,
    MoreOutlined,
    ReloadOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import { DateDisplayField } from "@/components/table";
import { extractErrorMessage } from "@/lib/helpers";
import {
    FeedAdminStatus,
    FeedAdminVideo,
    FeedQuality,
    RetryBulkResult,
    useAdminFeedVideos,
    useFeedMigrationStatus,
    useReprocessVideo,
    useRetryBulk,
} from "@/hooks/useFeedAdmin";
import { FeedEntityTag } from "./components/feed-entity-tag";
import { FeedVideoStatusTag } from "./components/feed-video-status-tag";

const { Text } = Typography;

const TABS: FeedAdminStatus[] = ["all", "ready", "processing", "failed", "deleted"];
const isTab = (v: string | null): v is FeedAdminStatus => !!v && (TABS as string[]).includes(v);
const isRetryable = (s: string) => s === "failed" || s === "processing";

const entityPathMap: Record<string, string> = {
    residence: "residences",
    bien_immobilier: "biens-immobiliers",
    furniture: "furnitures",
};

function Thumbnail({ url, status }: { url?: string | null; status: string }) {
    const [broken, setBroken] = useState(false);
    const showImage = !!url && !broken;
    return (
        <div
            style={{
                position: "relative",
                width: 88,
                height: 56,
                borderRadius: 8,
                overflow: "hidden",
                background: "#F0F0F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: status === "failed" ? "1px solid #C13838" : "1px solid #E5E5E5",
            }}
        >
            {showImage ? (
                <img
                    src={url!}
                    alt=""
                    onError={() => setBroken(true)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                <VideoCameraOutlined style={{ fontSize: 20, color: status === "failed" ? "#C13838" : "#9E9E9E" }} />
            )}
            {status === "processing" && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(24,95,165,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                    }}
                >
                    <LoadingOutlined />
                </div>
            )}
        </div>
    );
}

export const ListFeed = () => {
    const translate = useTranslate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlStatus = searchParams.get("status");

    const [status, setStatus] = useState<FeedAdminStatus>(isTab(urlStatus) ? urlStatus : "failed");
    const defaultResolved = useRef(isTab(urlStatus));
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [bulkLimit, setBulkLimit] = useState(25);
    const [bulkQuality, setBulkQuality] = useState<FeedQuality>("standard");
    const [confirmHigh, setConfirmHigh] = useState<FeedAdminVideo | null>(null);
    const [result, setResult] = useState<RetryBulkResult | null>(null);

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useAdminFeedVideos(status);
    const { data: migration } = useFeedMigrationStatus();
    const reprocess = useReprocessVideo();
    const retryBulk = useRetryBulk();

    const videos = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
    const summary = data?.pages[0]?.summary;
    const failedCount = summary?.byStatus.failed ?? 0;

    // Onglet par défaut : Échecs s'il y en a, sinon Toutes (une seule fois, sans param d'URL).
    useEffect(() => {
        if (defaultResolved.current || !summary) return;
        defaultResolved.current = true;
        if (summary.byStatus.failed === 0) setStatus("all");
    }, [summary]);

    // File d'encodage terminée : rafraîchir liste + compteurs.
    const wasBusy = useRef(false);
    useEffect(() => {
        if (!migration) return;
        if (!migration.isIdle) {
            wasBusy.current = true;
        } else if (wasBusy.current) {
            wasBusy.current = false;
            queryClient.invalidateQueries({ queryKey: ["feed-admin", "videos"] });
        }
    }, [migration, queryClient]);

    const changeTab = (next: string) => {
        if (!isTab(next)) return;
        defaultResolved.current = true;
        setStatus(next);
        setSelectedIds([]);
        setSearchParams({ status: next }, { replace: true });
    };

    const countFor = (tab: FeedAdminStatus) =>
        !summary ? undefined : tab === "all" ? summary.total : summary.byStatus[tab];

    const handleReprocessError = (err: unknown) => {
        const code = (err as any)?.response?.status;
        if (code === 409) message.warning(translate("feed.admin.errors.conflict"));
        else if (code === 404) message.error(translate("feed.admin.errors.notFound"));
        else message.error(extractErrorMessage(err, translate("feed.admin.errors.generic")));
    };

    const reprocessOne = (video: FeedAdminVideo, quality: FeedQuality) => {
        reprocess.mutate(
            { id: video.id, quality },
            {
                onSuccess: () => message.success(translate("feed.admin.reprocessQueued")),
                onError: handleReprocessError,
            }
        );
    };

    const runBulk = (payload: { ids?: string[]; limit?: number; quality: FeedQuality }) => {
        retryBulk.mutate(payload, {
            onSuccess: (res) => {
                setResult(res);
                setSelectedIds([]);
                setBulkModalOpen(false);
            },
            onError: (err) => message.error(extractErrorMessage(err, translate("feed.admin.errors.generic"))),
        });
    };

    const bulkCount = Math.min(bulkLimit, failedCount);

    const columns: ColumnsType<FeedAdminVideo> = [
        {
            title: "",
            dataIndex: "thumbnailUrl",
            width: 108,
            render: (url, record) => <Thumbnail url={url} status={record.status} />,
        },
        {
            title: translate("feed.fields.title"),
            dataIndex: ["content", "title"],
            render: (value, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{value || translate("common.notAvailable")}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.author?.name || "—"}
                        {record.shortCode ? ` · ${record.shortCode}` : ""}
                    </Text>
                </Space>
            ),
        },
        {
            title: translate("feed.admin.relatedProperty"),
            dataIndex: ["relatedTo", "entity"],
            align: "center",
            render: (entity, record) =>
                entity ? (
                    <Space direction="vertical" size={2} align="center">
                        <FeedEntityTag entity={entity} />
                        {record.relatedTo?.id && (
                            <Link to={`/${entityPathMap[entity] ?? "residences"}/show/${record.relatedTo.id}`}>
                                <Text style={{ fontSize: 12 }}>{translate("feed.actions.viewRelated")}</Text>
                            </Link>
                        )}
                    </Space>
                ) : (
                    <Text type="secondary">—</Text>
                ),
        },
        {
            title: translate("feed.fields.status"),
            dataIndex: "status",
            align: "center",
            render: (value) => (value ? <FeedVideoStatusTag status={value} /> : null),
        },
        {
            title: translate("feed.fields.stats"),
            dataIndex: "stats",
            align: "center",
            render: (stats) => (
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
            ),
        },
        {
            title: translate("fields.created_at"),
            dataIndex: "createdAt",
            align: "center",
            render: (date: string) => <DateDisplayField value={date} />,
        },
        {
            title: translate("table.actions"),
            key: "actions",
            align: "center",
            render: (_, record) => {
                const retryable = isRetryable(record.status);
                return (
                    <Space>
                        {retryable && (
                            <Dropdown
                                menu={{
                                    items: [
                                        { key: "standard", label: translate("feed.admin.quality.standard") },
                                        { key: "high", label: translate("feed.admin.quality.high") },
                                    ],
                                    onClick: ({ key }) => reprocessOne(record, key as FeedQuality),
                                }}
                            >
                                <Button size="small" icon={<ReloadOutlined />} loading={reprocess.isLoading}>
                                    {translate("feed.admin.retry")} <DownOutlined />
                                </Button>
                            </Dropdown>
                        )}
                        <Link to={`/feed/show/${record.id}`}>
                            <Button size="small" icon={<ArrowRightOutlined />} />
                        </Link>
                        {record.status === "ready" && (
                            <Dropdown
                                menu={{
                                    items: [{ key: "high", label: translate("feed.admin.reencodeHigh") }],
                                    onClick: () => setConfirmHigh(record),
                                }}
                            >
                                <Button size="small" icon={<MoreOutlined />} />
                            </Dropdown>
                        )}
                    </Space>
                );
            },
        },
    ];

    const selectedRetryable = videos.filter((v) => selectedIds.includes(v.id) && isRetryable(v.status));

    return (
        <List
            title={translate("feed.title")}
            headerButtons={[
                <Link key="home" to="/feed">
                    <Button icon={<HomeOutlined />}>{translate("feed.actions.backToHome")}</Button>
                </Link>,
                <Button
                    key="retry-failed"
                    type="primary"
                    danger
                    icon={<ReloadOutlined />}
                    disabled={failedCount === 0}
                    onClick={() => setBulkModalOpen(true)}
                >
                    {translate("feed.admin.retryFailed")}
                    {failedCount > 0 ? ` (${failedCount})` : ""}
                </Button>,
            ]}
        >
            {migration && !migration.isIdle && (
                <Alert
                    type="info"
                    showIcon
                    icon={<LoadingOutlined />}
                    style={{ marginBottom: 16 }}
                    message={translate("feed.admin.queueBanner", {
                        waiting: migration.queue.waiting,
                        active: migration.queue.active,
                    })}
                />
            )}

            <Tabs
                activeKey={status}
                onChange={changeTab}
                items={TABS.map((tab) => ({
                    key: tab,
                    label: (
                        <Space size={6}>
                            {translate(`feed.admin.tabs.${tab}`)}
                            {countFor(tab) !== undefined && (
                                <Badge
                                    count={countFor(tab)}
                                    showZero
                                    overflowCount={9999}
                                    color={tab === "failed" && (countFor(tab) ?? 0) > 0 ? "#C13838" : "#8C8C8C"}
                                />
                            )}
                        </Space>
                    ),
                }))}
            />

            {selectedIds.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        marginBottom: 12,
                        background: "#F0F5FF",
                        border: "1px solid #ADC6FF",
                        borderRadius: 8,
                        flexWrap: "wrap",
                    }}
                >
                    <Text strong>{translate("feed.admin.selected", { count: selectedIds.length })}</Text>
                    <Button
                        size="small"
                        type="primary"
                        icon={<ReloadOutlined />}
                        loading={retryBulk.isLoading}
                        disabled={selectedRetryable.length === 0}
                        onClick={() => runBulk({ ids: selectedRetryable.map((v) => v.id), quality: "standard" })}
                    >
                        {translate("feed.admin.retrySelection", { count: selectedRetryable.length })}
                    </Button>
                    <Button
                        size="small"
                        loading={retryBulk.isLoading}
                        disabled={selectedRetryable.length === 0}
                        onClick={() => runBulk({ ids: selectedRetryable.map((v) => v.id), quality: "high" })}
                    >
                        {translate("feed.admin.retrySelectionHigh")}
                    </Button>
                    <Button size="small" type="text" onClick={() => setSelectedIds([])}>
                        {translate("feed.admin.clearSelection")}
                    </Button>
                    {selectedIds.length > 10 && (
                        <Text type="warning" style={{ fontSize: 12 }}>
                            {translate("feed.admin.highBatchWarning")}
                        </Text>
                    )}
                </div>
            )}

            <Table<FeedAdminVideo>
                rowKey="id"
                columns={columns}
                dataSource={videos}
                loading={isLoading}
                pagination={false}
                rowSelection={{
                    selectedRowKeys: selectedIds,
                    onChange: (keys) => setSelectedIds(keys as string[]),
                    getCheckboxProps: (record) => ({ disabled: record.status === "deleted" }),
                }}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                status === "failed"
                                    ? translate("feed.admin.emptyFailed")
                                    : translate("feed.admin.empty")
                            }
                        />
                    ),
                }}
            />

            {hasNextPage && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                    <Button loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
                        {translate("feed.admin.loadMore")}
                    </Button>
                </div>
            )}

            {/* Relancer les échecs (sans ids) */}
            <Modal
                open={bulkModalOpen}
                title={translate("feed.admin.retryFailed")}
                onCancel={() => setBulkModalOpen(false)}
                okText={translate("feed.admin.retry")}
                confirmLoading={retryBulk.isLoading}
                onOk={() => runBulk({ limit: bulkLimit, quality: bulkQuality })}
            >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <div>
                        <Text strong>{translate("feed.admin.bulkLimit")}</Text>
                        <div>
                            <InputNumber min={1} max={200} value={bulkLimit} onChange={(v) => setBulkLimit(v ?? 25)} />
                        </div>
                    </div>
                    <div>
                        <Text strong>{translate("feed.admin.bulkQuality")}</Text>
                        <div>
                            <Radio.Group value={bulkQuality} onChange={(e) => setBulkQuality(e.target.value)}>
                                <Radio.Button value="standard">{translate("feed.admin.quality.standardShort")}</Radio.Button>
                                <Radio.Button value="high">{translate("feed.admin.quality.highShort")}</Radio.Button>
                            </Radio.Group>
                        </div>
                    </div>
                    {bulkQuality === "high" && (
                        <Alert type="warning" showIcon message={translate("feed.admin.highWarning")} />
                    )}
                    <Text>
                        {translate("feed.admin.bulkConfirm", {
                            count: bulkCount,
                            quality: translate(`feed.admin.quality.${bulkQuality}Short`),
                        })}
                    </Text>
                </Space>
            </Modal>

            {/* Ré-encodage haute qualité d'une vidéo prête */}
            <Modal
                open={!!confirmHigh}
                title={translate("feed.admin.reencodeHigh")}
                onCancel={() => setConfirmHigh(null)}
                okText={translate("feed.admin.confirm")}
                okButtonProps={{ danger: true }}
                confirmLoading={reprocess.isLoading}
                onOk={() => {
                    if (confirmHigh) reprocessOne(confirmHigh, "high");
                    setConfirmHigh(null);
                }}
            >
                <Alert type="warning" showIcon message={translate("feed.admin.reencodeWarning")} />
            </Modal>

            {/* Résumé après relance en masse */}
            <Modal
                open={!!result}
                title={translate("feed.admin.resultTitle")}
                onCancel={() => setResult(null)}
                footer={
                    <Button type="primary" onClick={() => setResult(null)}>
                        OK
                    </Button>
                }
            >
                {result && (
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Text strong>
                            {translate("feed.admin.resultSummary", {
                                queued: result.summary.queued,
                                skipped: result.summary.skipped,
                                failed: result.summary.failed,
                            })}
                        </Text>
                        {result.failed.length > 0 && (
                            <Collapse
                                size="small"
                                items={[
                                    {
                                        key: "failed",
                                        label: translate("feed.admin.resultFailedDetails", {
                                            count: result.failed.length,
                                        }),
                                        children: (
                                            <Space direction="vertical" size={4}>
                                                {result.failed.map((f) => (
                                                    <Text key={f.id} type="danger" style={{ fontSize: 12 }}>
                                                        {f.id} — {f.reason}
                                                    </Text>
                                                ))}
                                            </Space>
                                        ),
                                    },
                                ]}
                            />
                        )}
                    </Space>
                )}
            </Modal>
        </List>
    );
};
