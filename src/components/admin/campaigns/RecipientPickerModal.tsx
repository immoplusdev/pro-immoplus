import { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import { Modal, Spin, Empty, Pagination, Input, Avatar, Typography, Button, Checkbox } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { UserRole } from "@/core/domain/users";
import { getApiFileUrl } from "@/lib/helpers";
import { CampaignCible } from "@/types/campaigns.types";

const { Text } = Typography;

export interface RecipientPick {
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
  cible: CampaignCible;
  /** sélection déjà faite avant l'ouverture — pré-cochée dans la liste. */
  initialSelected: RecipientPick[];
  onConfirm: (recipients: RecipientPick[]) => void;
}

const PAGE_SIZE = 10;

/**
 * Recherche client/pro (par nom/email) + sélection multiple, pour construire
 * `audience.recipientIds` d'une campagne (cf. docs/drafts/campaigns.md §3).
 * Calqué sur ClientPickerModal, mais garde plusieurs sélections ouvertes à la
 * fois et filtre le rôle selon la cible de la campagne.
 */
export function RecipientPickerModal({ open, onClose, cible, initialSelected, onConfirm }: Props) {
  const [current, setCurrent] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Map<string, RecipientPick>>(new Map());

  useEffect(() => {
    if (open) {
      setCurrent(1);
      setSearchInput("");
      setSearch("");
      setSelected(new Map(initialSelected.map((r) => [r.id, r])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    setCurrent(1);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const roleFilter =
    cible === CampaignCible.CustomerApp
      ? { field: "role", operator: "eq" as const, value: UserRole.Customer }
      : {
          field: "role",
          operator: "in" as const,
          value: [UserRole.ProEntreprise, UserRole.ProParticulier],
        };

  const { data, isLoading } = useList({
    resource: "users",
    pagination: { current, pageSize: PAGE_SIZE },
    filters: [roleFilter, ...(search ? [{ field: "q", operator: "contains" as const, value: search }] : [])],
    sorters: [{ field: "createdAt", order: "desc" }],
    queryOptions: { enabled: open },
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  const toggle = (record: RecipientPick) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(record.id)) next.delete(record.id);
      else next.set(record.id, record);
      return next;
    });
  };

  const handleValidate = () => {
    onConfirm(Array.from(selected.values()));
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={cible === CampaignCible.CustomerApp ? "Choisir des clients" : "Choisir des pros"}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Annuler
        </Button>,
        <Button key="validate" type="primary" onClick={handleValidate}>
          Valider ({selected.size})
        </Button>,
      ]}
    >
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
          <Empty description="Aucun résultat" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 200 }}>
            {items.map((record: any) => {
              const pick: RecipientPick = {
                id: record.id,
                firstName: record.firstName ?? "",
                lastName: record.lastName ?? "",
                email: record.email ?? "",
                phoneNumber: record.phoneNumber,
                avatar: record.avatar ?? null,
              };
              const checked = selected.has(record.id);
              return (
                <div
                  key={record.id}
                  onClick={() => toggle(pick)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: checked ? "#F0F5FF" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!checked) e.currentTarget.style.background = "#F5F5F5";
                  }}
                  onMouseLeave={(e) => {
                    if (!checked) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Checkbox checked={checked} onClick={(e) => e.stopPropagation()} onChange={() => toggle(pick)} />
                  <Avatar src={pick.avatar ? getApiFileUrl(pick.avatar) : undefined} icon={<UserOutlined />} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ display: "block" }}>
                      {pick.lastName} {pick.firstName}
                    </Text>
                    <Text style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{pick.email}</Text>
                  </div>
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
