import React, { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { Modal, Spin, Empty, Pagination, Input, Avatar, Typography } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { UserRole } from "@/core/domain/users";
import { getApiFileUrl } from "@/lib/helpers";

const { Text } = Typography;

export interface ClientPick {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (client: ClientPick) => void;
}

const PAGE_SIZE = 10;

export function ClientPickerModal({ open, onClose, onConfirm }: Props) {
  const [current, setCurrent] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setCurrent(1);
      setSearchInput("");
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    setCurrent(1);
  }, [search]);

  // Debounce — tape sur nom/prénom/email côté backend (_search générique, même convention que
  // les autres pickers du dashboard).
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading } = useList({
    resource: "users",
    pagination: { current, pageSize: PAGE_SIZE },
    filters: [
      { field: "role", operator: "eq", value: UserRole.Customer },
      ...(search ? [{ field: "q", operator: "contains" as const, value: search }] : []),
    ],
    sorters: [{ field: "createdAt", order: "desc" }],
    queryOptions: { enabled: open },
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  const handlePick = (record: ClientPick) => {
    onConfirm(record);
    onClose();
  };

  return (
    <Modal open={open} onCancel={onClose} title="Choisir un client" width={600} footer={null}>
      <Input
        placeholder="Rechercher par nom ou email..."
        prefix={<SearchOutlined />}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        style={{ marginBottom: 16 }}
        allowClear
      />

      <Spin spinning={isLoading}>
        {items.length === 0 && !isLoading ? (
          <Empty description="Aucun client trouvé" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 200 }}>
            {items.map((record: any) => (
              <div
                key={record.id}
                onClick={() =>
                  handlePick({
                    id: record.id,
                    firstName: record.firstName ?? "",
                    lastName: record.lastName ?? "",
                    email: record.email ?? "",
                    phoneNumber: record.phoneNumber,
                    avatar: record.avatar ?? null,
                  })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5F5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Avatar src={record.avatar ? getApiFileUrl(record.avatar) : undefined} icon={<UserOutlined />} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ display: "block" }}>
                    {record.lastName} {record.firstName}
                  </Text>
                  <Text style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{record.email}</Text>
                </div>
              </div>
            ))}
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
