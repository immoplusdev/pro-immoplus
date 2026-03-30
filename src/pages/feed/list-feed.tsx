import { BaseRecord, useTranslate } from "@refinedev/core";
import { List, DeleteButton, useTable } from "@refinedev/antd";
import { Table, Space, Button, Typography } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRightOutlined, EyeOutlined, LikeOutlined, HomeOutlined } from "@ant-design/icons";
import { DateDisplayField } from "@/components/table";
import { FeedEntityTag } from "./components/feed-entity-tag";
import { FeedVideoStatusTag } from "./components/feed-video-status-tag";

const { Text } = Typography;

const STATUS_OPTIONS = [
    { label: "🟢 Ready", value: "ready" },
    { label: "⏳ Processing", value: "processing" },
    { label: "❌ Failed", value: "failed" },
    { label: "🗑️ Deleted", value: "deleted" },
];

export const ListFeed = () => {
    const translate = useTranslate();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedStatus = searchParams.get("status");

    const { tableProps } = useTable({
        resource: "feed",
        syncWithLocation: true,
        pagination: { pageSize: 20 },
    });

    const handleStatusFilter = (status: string | null) => {
        if (status) {
            setSearchParams({ status });
        } else {
            setSearchParams({});
        }
    };

    return (
        <List
            title={translate("feed.title")}
            headerButtons={[
                <Link key="home" to="/feed">
                    <Button icon={<HomeOutlined />}>
                        {translate("feed.actions.backToHome")}
                    </Button>
                </Link>,
            ]}
        >
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
                    render={(value) => <FeedEntityTag entity={value} />}
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
                    render={(value) => value ? <FeedVideoStatusTag status={value} /> : null}
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
                            <Link to={`/feed/show/${record.id}`}>
                                <Button size="small" icon={<ArrowRightOutlined />} />
                            </Link>
                            <DeleteButton hideText size="small" recordItemId={record.id} />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
