import { useShow } from "@refinedev/core";
import { Button, Card, Descriptions, Progress, Space, Spin, Typography } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Poll, SECTION_POSITION_LABELS } from "./types";
import { PollStatusBadge } from "./status-badge";

const { Text, Title } = Typography;

export const PollShow = () => {
  const navigate = useNavigate();

  const { queryResult } = useShow<Poll>({
    resource: "polls",
  });

  const poll = queryResult?.data?.data;
  const isLoading = queryResult?.isLoading ?? false;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!poll) {
    return <Text type="danger">Sondage introuvable.</Text>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Retour
        </Button>
        <Link to={`/polls/edit/${poll.id}`}>
          <Button type="primary" icon={<EditOutlined />}>
            Modifier
          </Button>
        </Link>
      </div>

      <Title level={4} style={{ marginBottom: 24 }}>
        {poll.question}
      </Title>

      <Card title="Général" style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="Statut">
            <PollStatusBadge status={poll.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Total des votes">{poll.totalVotes}</Descriptions.Item>
          <Descriptions.Item label="Expire le">
            {dayjs(poll.expiresAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Section ciblée">{poll.targetSectionKey}</Descriptions.Item>
          <Descriptions.Item label="Position section">
            {SECTION_POSITION_LABELS[poll.sectionPosition] ?? poll.sectionPosition}
          </Descriptions.Item>
        </Descriptions>
        {poll.description && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Description</Text>
            <div>{poll.description}</div>
          </div>
        )}
      </Card>

      <Card title="Résultats">
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          {poll.options.map((opt) => (
            <div key={opt.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <Text>{opt.label}</Text>
                <Text type="secondary">
                  {opt.voteCount} vote{opt.voteCount > 1 ? "s" : ""} ({opt.percentage}%)
                </Text>
              </div>
              <Progress percent={opt.percentage} showInfo={false} />
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
};
