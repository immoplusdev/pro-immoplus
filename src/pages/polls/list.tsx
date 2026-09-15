import { useTable, List } from "@refinedev/antd";
import { useDelete } from "@refinedev/core";
import { Table, Button, Space, Select, Popconfirm, message, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { CrudFilter } from "@refinedev/core/src/contexts/data/types";
import { Poll, PollStatus, POLL_STATUSES, SECTION_POSITION_LABELS } from "./types";
import { PollStatusBadge, STATUS_LABELS } from "./status-badge";

export const PollList = () => {
  const navigate = useNavigate();

  const { tableProps, filters, setFilters } = useTable<Poll>({
    resource: "polls",
    syncWithLocation: true,
  });

  const { mutate: deleteOne } = useDelete();

  const selectedStatus = (filters as CrudFilter[])?.find(
    (f) => "field" in f && f.field === "status",
  ) as { value?: string } | undefined;

  // "replace" (plutôt que le "merge" par défaut de setFilters) — sinon effacer le filtre
  // (value: undefined) se fait fusionner avec l'ancienne valeur au lieu de la remplacer.
  const handleStatusFilter = (status: PollStatus | null) => {
    setFilters(
      status ? [{ field: "status", operator: "eq", value: status }] : [],
      "replace",
    );
  };

  const handleDelete = (id: string) => {
    deleteOne(
      { resource: "polls", id },
      {
        onSuccess: () => message.success("Sondage supprimé"),
        onError: () => message.error("Erreur lors de la suppression"),
      },
    );
  };

  return (
    <List
      title="Sondages"
      headerButtons={[
        <Link key="create" to="/polls/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Créer un sondage
          </Button>
        </Link>,
      ]}
    >
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Filtrer par statut"
          style={{ width: 160 }}
          value={selectedStatus?.value}
          onChange={(v) => handleStatusFilter((v as PollStatus) ?? null)}
          options={POLL_STATUSES.map((s) => ({ label: STATUS_LABELS[s], value: s }))}
        />
      </Space>

      <Table {...tableProps} rowKey="id" size="small">
        <Table.Column dataIndex="question" title="Question" ellipsis />
        <Table.Column
          dataIndex="status"
          title="Statut"
          render={(status: PollStatus) => <PollStatusBadge status={status} size="small" />}
        />
        <Table.Column dataIndex="totalVotes" title="Votes" width={80} />
        <Table.Column
          dataIndex="expiresAt"
          title="Expire le"
          render={(v: string) => dayjs(v).format("DD/MM/YYYY HH:mm")}
        />
        <Table.Column dataIndex="targetSectionKey" title="Section ciblée" ellipsis />
        <Table.Column
          dataIndex="sectionPosition"
          title="Position"
          render={(v: Poll["sectionPosition"]) => SECTION_POSITION_LABELS[v] ?? v}
        />
        <Table.Column
          title="Actions"
          align="center"
          render={(_: unknown, record: Poll) => (
            <Space>
              <Tooltip title="Voir le détail">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/polls/show/${record.id}`)}
                />
              </Tooltip>
              <Tooltip title="Modifier">
                <Link to={`/polls/edit/${record.id}`}>
                  <Button size="small" icon={<EditOutlined />} />
                </Link>
              </Tooltip>
              <Popconfirm
                title="Supprimer ce sondage ?"
                description="Cette action est irréversible."
                onConfirm={() => handleDelete(record.id)}
                okText="Supprimer"
                cancelText="Annuler"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
