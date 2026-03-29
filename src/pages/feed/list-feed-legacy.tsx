import { useEffect, useState, useRef } from "react";
import { BaseRecord, useTranslate, useDelete } from "@refinedev/core";
import { List } from "@refinedev/antd";
import { Table, Space, Button, Typography, Spin, Empty, Popconfirm, message } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRightOutlined, EyeOutlined, LikeOutlined, HomeOutlined, DeleteOutlined } from "@ant-design/icons";
import { DateDisplayField } from "@/components/table";
import { FeedEntityTag } from "./components/feed-entity-tag";
import { FeedVideoStatusTag } from "./components/feed-video-status-tag";
import { API_URL } from "@/configs/app.config";

const { Text } = Typography;

const STATUS_OPTIONS = [
    { label: "🟢 Ready", value: "ready" },
    { label: "⏳ Processing", value: "processing" },
    { label: "❌ Failed", value: "failed" },
    { label: "🗑️ Deleted", value: "deleted" },
];

interface FeedLegacyResponse {
    data: BaseRecord[];
    cursor?: string;
    has_more: boolean;
    count: number;
}

export const ListFeedLegacy = () => {
    const translate = useTranslate();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedStatus = searchParams.get("status");
    const [allData, setAllData] = useState<BaseRecord[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const nextCursorRef = useRef<string | undefined>();
    const loaderRef = useRef<HTMLDivElement>(null);
    const { mutate: deleteVideo } = useDelete();

    const handleStatusFilter = (status: string | null) => {
        setAllData([]);
        nextCursorRef.current = undefined;
        if (status) {
            setSearchParams({ status });
        } else {
            setSearchParams({});
        }
    };

    // Récupérer les données initiales au montage
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const statusParam = selectedStatus ? `&status=${selectedStatus}` : "";
                const url = `${API_URL}/feed/legacy?limit=10${statusParam}`;
                console.log("🔵 Fetch initial:", url);

                const response = await fetch(url);
                console.log("📊 Status:", response.status, response.statusText);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }

                const json: FeedLegacyResponse = await response.json();
                console.log("✅ Données reçues:", {
                    count: json.data?.length || 0,
                    has_more: json.has_more,
                    cursor: json.cursor?.substring(0, 20) + "...",
                    data: json.data,
                });

                setAllData(json.data || []);
                nextCursorRef.current = json.cursor;
                setHasMore(json.has_more ?? false);
            } catch (error) {
                console.error("❌ Erreur fetch /feed/legacy:", error);
                message.error(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [translate, selectedStatus]);

    // Charger la page suivante
    const loadNextPage = async () => {
        if (!nextCursorRef.current || !hasMore || isFetchingNextPage) {
            console.log("⏭️ LoadNextPage ignoré:", {
                hasCursor: !!nextCursorRef.current,
                hasMore,
                isFetching: isFetchingNextPage,
            });
            return;
        }

        try {
            setIsFetchingNextPage(true);
            const statusParam = selectedStatus ? `&status=${selectedStatus}` : "";
            const url = `${API_URL}/feed/legacy?limit=10&cursor=${nextCursorRef.current}${statusParam}`;
            console.log("🔵 Fetch page suivante:", url);

            const response = await fetch(url);
            console.log("📊 Status:", response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const json: FeedLegacyResponse = await response.json();
            console.log("✅ Données suivantes reçues:", {
                count: json.data?.length || 0,
                has_more: json.has_more,
                cursor: json.cursor?.substring(0, 20) + "...",
            });

            setAllData((prev) => [...prev, ...(json.data || [])]);
            nextCursorRef.current = json.cursor;
            setHasMore(json.has_more ?? false);
        } catch (error) {
            console.error("❌ Erreur fetch /feed/legacy (nextpage):", error);
            message.error(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
        } finally {
            setIsFetchingNextPage(false);
        }
    };

    // Intersection Observer pour Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    console.log("👀 Intersection détectée!", {
                        hasMore,
                        isFetching: isFetchingNextPage,
                        isLoading,
                    });
                    if (hasMore && !isFetchingNextPage && !isLoading) {
                        console.log("⬇️ Déclenchement loadNextPage");
                        loadNextPage();
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [hasMore, isFetchingNextPage, isLoading]);

    // Gestionnaire de suppression
    const handleDelete = (recordId: string) => {
        deleteVideo(
            {
                resource: "feed/videos",
                id: recordId,
            },
            {
                onSuccess: () => {
                    setAllData((prev) => prev.filter((item) => item.id !== recordId));
                    message.success(translate("common.deleteSuccess"));
                },
                onError: () => {
                    message.error(translate("common.error"));
                },
            }
        );
    };

    if (isLoading && allData.length === 0) {
        return (
            <List title={translate("feed.sections.legacyFlow")}>
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <Spin />
                </div>
            </List>
        );
    }

    if (!isLoading && allData.length === 0) {
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
                <Empty
                    description={translate("common.noData")}
                    style={{ marginTop: 40 }}
                />
            </List>
        );
    }

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
                        type={selectedStatus === null ? "primary" : "default"}
                        onClick={() => handleStatusFilter(null)}
                    >
                        {translate("feed.filters.all") || "All"}
                    </Button>
                    {STATUS_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            type={selectedStatus === option.value ? "primary" : "default"}
                            onClick={() => handleStatusFilter(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </Space>
            </div>

            {/* Tableau Infini */}
            <div style={{ overflowX: "auto" }}>
                <Table
                    dataSource={allData}
                    rowKey="id"
                    pagination={false}
                    loading={isLoading}
                >
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
                        render={(value) => (value ? <FeedEntityTag entity={value} /> : <Text type="secondary">-</Text>)}
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
                        render={(value) => (value ? <FeedVideoStatusTag status={value} /> : null)}
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
                                    <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                    />
                                </Popconfirm>
                            </Space>
                        )}
                    />
                </Table>
            </div>

            {/* Loader pour Infinite Scroll */}
            <div
                ref={loaderRef}
                style={{
                    textAlign: "center",
                    padding: "20px",
                    visibility: hasMore ? "visible" : "hidden",
                }}
            >
                {isFetchingNextPage && <Spin />}
                {!hasMore && (
                    <Text type="secondary">{translate("common.noMore")}</Text>
                )}
            </div>
        </List>
    );
};
