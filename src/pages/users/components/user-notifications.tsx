import { useState } from "react";
import { useApiUrl } from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Space, Spin, Empty, Table, Tag, Pagination, Tooltip } from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { axiosInstance } from "@/lib/providers/utils/axios";
import type { Notification, NotificationListResponse } from "@/core/domain/notifications";

interface Props {
  userId?: string;
}

const PAGE_SIZE = 20;

const pushTypeColor: Record<string, string> = {
  reservation: "blue",
  alert: "orange",
};

export function UserNotificationsTable({ userId }: Props) {
  const apiUrl = useApiUrl();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isFetching } = useQuery<NotificationListResponse>({
    queryKey: ["user-notifications", userId, currentPage],
    queryFn: async () => {
      const response = await axiosInstance.get<NotificationListResponse>(
        `${apiUrl}/notifications/user/${userId}`,
        { params: { page: currentPage, pageSize: PAGE_SIZE } }
      );
      return response.data;
    },
    enabled: !!userId,
  });

  const notifications = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;

  if (!userId) return null;

  return (
    <Card
      style={{ marginTop: "2rem", border: "1px solid #E8E9EE", borderRadius: 10 }}
      title={
        <Space>
          <BellOutlined />
          <span>Notifications</span>
          {totalCount > 0 && <Tag color="blue">{totalCount}</Tag>}
        </Space>
      }
    >
      {isFetching ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description="Aucune notification" />
      ) : (
        <>
          <Table<Notification>
            dataSource={notifications}
            rowKey="id"
            pagination={false}
            size="small"
          >
            <Table.Column<Notification>
              title="Sujet"
              dataIndex="subject"
              render={(subject: string | null, record) => (
                <Space direction="vertical" size={2}>
                  <span style={{ fontWeight: 500 }}>{subject ?? "—"}</span>
                  <Tag
                    color={pushTypeColor[record.pushType ?? ""] ?? "default"}
                    style={{ fontSize: 11 }}
                  >
                    {record.pushType ?? "—"}
                  </Tag>
                </Space>
              )}
            />
            <Table.Column<Notification>
              title="Message"
              dataIndex="message"
              render={(msg: string | null) => (
                <Tooltip title={msg ?? ""}>
                  <span style={{ fontSize: 12, color: "#494C57" }}>
                    {msg ? (msg.length > 100 ? `${msg.slice(0, 100)}…` : msg) : "—"}
                  </span>
                </Tooltip>
              )}
            />
            <Table.Column<Notification>
              title="Statut"
              dataIndex="readAt"
              align="center"
              render={(readAt: string | null) =>
                readAt ? <Tag color="green">Lu</Tag> : <Tag color="red">Non lu</Tag>
              }
            />
            <Table.Column<Notification>
              title="Date"
              dataIndex="createdAt"
              align="center"
              render={(date: string | null) => (
                <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                  {date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—"}
                </span>
              )}
            />
          </Table>
          {totalCount > PAGE_SIZE && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Pagination
                current={currentPage}
                total={totalCount}
                pageSize={PAGE_SIZE}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showTotal={(total) => `${total} notifications`}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
}
