import React from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import { List, DeleteButton, useTable } from "@refinedev/antd";
import { Table, Space, Button, Typography, Tag } from "antd";
import { Link } from "react-router-dom";
import { ArrowRightOutlined, EyeOutlined, LikeOutlined } from "@ant-design/icons";
import { DateDisplayField } from "@/components/table";
import { FeedEntityTag } from "./components/feed-entity-tag";
import { FeedVideoStatusTag } from "./components/feed-video-status-tag";

const { Text } = Typography;

export const ListFeed = () => {
    const translate = useTranslate();

    const { tableProps } = useTable({
        resource: "feed",
        syncWithLocation: true,
        pagination: { pageSize: 20 },
    });

    return (
        <List title={translate("feed.title")}>
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
                    dataIndex="videoStatus"
                    title={translate("feed.fields.videoStatus")}
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
