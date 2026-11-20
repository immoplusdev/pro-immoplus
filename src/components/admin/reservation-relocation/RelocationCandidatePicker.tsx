import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  InputNumber,
  Row,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { CheckCircleFilled, HomeOutlined, ReloadOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import { getApiFileUrl } from "@/lib/helpers";
import { extractErrorMessage } from "@/lib/helpers/http-exception.helper";
import { useRelocationSuggestions } from "@/hooks/useReservationRelocation";
import {
  excludeCurrentResidence,
  formatFcfa,
  suggestionToCandidate,
} from "@/lib/helpers/reservation-relocation.helper";
import type { RelocationCandidate, SuggestionMode } from "@/types/reservation-relocation.types";

const { Text } = Typography;

const SUGGESTION_LIMIT = 6;
const SEARCH_PAGE_SIZE = 8;

const AVAILABILITY_TAGS: Record<NonNullable<RelocationCandidate["disponibiliteConfirmeeVia"]>, { label: string; color: string }> =
  {
    calendrier: { label: "Disponible (calendrier)", color: "green" },
    confirmation_proprietaire: { label: "Confirmé par le propriétaire", color: "blue" },
  };

const STATUS_VALIDATION_LABELS: Record<string, { label: string; color: string }> = {
  valide: { label: "Validée", color: "green" },
  en_attente_validation: { label: "En attente de validation", color: "orange" },
  rejete: { label: "Rejetée", color: "red" },
};

interface ResidenceListRecord {
  id: string;
  nom?: string | null;
  images?: string[] | null;
  prixReservation?: number | null;
  nombreMaxOccupants?: number | null;
  statusValidation?: string | null;
  ville?: { nom?: string | null } | string | null;
  commune?: { nom?: string | null } | string | null;
}

/** La liste renvoie la relation chargée (`{ nom }`) ou seulement son id : un id n'est pas affiché. */
const placeName = (value: ResidenceListRecord["ville"]): string | null =>
  value && typeof value === "object" ? value.nom ?? null : null;

const searchRecordToCandidate = (record: ResidenceListRecord): RelocationCandidate => {
  const imageId = record.images?.[0];
  return {
    id: record.id,
    nom: record.nom ?? "Sans nom",
    miniature: imageId ? getApiFileUrl(imageId) : null,
    ville: placeName(record.ville),
    commune: placeName(record.commune),
    prixReservation: record.prixReservation ?? null,
    nombreMaxOccupants: record.nombreMaxOccupants ?? null,
    statusValidation: record.statusValidation ?? null,
    source: "recherche",
  };
};

interface Props {
  reservationId: string;
  currentResidenceId?: string | null;
  selected: RelocationCandidate | null;
  onSelect: (candidate: RelocationCandidate) => void;
}

/** Étape 1 : suggestions (similaires / proches) ou recherche libre par nom. */
export function RelocationCandidatePicker({ reservationId, currentResidenceId, selected, onSelect }: Props) {
  const [mode, setMode] = useState<SuggestionMode>("similaires");
  const [rayonKm, setRayonKm] = useState<number>(10);
  const [search, setSearch] = useState("");

  const suggestions = useRelocationSuggestions(reservationId, {
    mode,
    rayonKm: mode === "proches" ? rayonKm : undefined,
    limit: SUGGESTION_LIMIT,
  });

  // Recherche libre : l'admin peut avoir confirmé une disponibilité par téléphone.
  const searchQuery = useList<ResidenceListRecord>({
    resource: "residences",
    pagination: { current: 1, pageSize: SEARCH_PAGE_SIZE },
    filters: [{ field: "q", operator: "contains", value: search }],
    queryOptions: { enabled: search.trim().length >= 2, keepPreviousData: true },
  });

  const suggestionCandidates = useMemo(
    () => excludeCurrentResidence(suggestions.data ?? [], currentResidenceId).map(suggestionToCandidate),
    [suggestions.data, currentResidenceId],
  );
  const searchCandidates = useMemo(
    () => excludeCurrentResidence(searchQuery.data?.data ?? [], currentResidenceId).map(searchRecordToCandidate),
    [searchQuery.data, currentResidenceId],
  );

  const renderGrid = (items: RelocationCandidate[]) => (
    <Row gutter={[12, 12]}>
      {items.map((candidate) => (
        <Col key={candidate.id} xs={24} sm={12} lg={8}>
          <CandidateCard
            candidate={candidate}
            showDistance={mode === "proches" && candidate.source === "suggestion"}
            selected={selected?.id === candidate.id}
            onSelect={() => onSelect(candidate)}
          />
        </Col>
      ))}
    </Row>
  );

  const suggestionsBody = (() => {
    if (suggestions.isInitialLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
    if (suggestions.isError) {
      return (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger les suggestions"
          description={extractErrorMessage(suggestions.error, "Une erreur est survenue.")}
          action={
            <Button size="small" onClick={() => suggestions.refetch()}>
              Réessayer
            </Button>
          }
        />
      );
    }
    if (suggestionCandidates.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Aucune suggestion. Les suggestions ne montrent que les résidences au calendrier récent : utilisez la recherche par nom."
        />
      );
    }
    return renderGrid(suggestionCandidates);
  })();

  const searchBody = (() => {
    if (search.trim().length < 2) return null;
    if (searchQuery.isInitialLoading) return <Skeleton active paragraph={{ rows: 2 }} />;
    if (searchQuery.isError) {
      return (
        <Alert
          type="error"
          showIcon
          message="Recherche impossible"
          description={extractErrorMessage(searchQuery.error, "Une erreur est survenue.")}
          action={
            <Button size="small" onClick={() => searchQuery.refetch()}>
              Réessayer
            </Button>
          }
        />
      );
    }
    if (searchCandidates.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`Aucune résidence pour « ${search.trim()} »`} />;
    }
    return renderGrid(searchCandidates);
  })();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card
        size="small"
        title="Suggestions"
        extra={
          <Space wrap>
            <Segmented<SuggestionMode>
              value={mode}
              onChange={(value) => setMode(value)}
              options={[
                { label: "Similaires", value: "similaires" },
                { label: "Proches", value: "proches" },
              ]}
            />
            {mode === "proches" && (
              <InputNumber
                min={1}
                max={100}
                value={rayonKm}
                onChange={(value) => setRayonKm(value ?? 10)}
                addonAfter="km"
                style={{ width: 120 }}
                aria-label="Rayon de recherche en kilomètres"
              />
            )}
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined spin={suggestions.isFetching && !suggestions.isInitialLoading} />}
              aria-label="Rafraîchir les suggestions"
              onClick={() => suggestions.refetch()}
            />
          </Space>
        }
      >
        {suggestionsBody}
      </Card>

      <Card size="small" title="Rechercher une résidence par nom">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Input.Search
            allowClear
            placeholder="Nom de la résidence (2 caractères minimum)"
            enterButton={<SearchOutlined />}
            loading={searchQuery.isFetching && search.trim().length >= 2}
            onSearch={(value) => setSearch(value.trim())}
          />
          {searchBody}
        </Space>
      </Card>
    </Space>
  );
}

function CandidateCard({
  candidate,
  selected,
  showDistance,
  onSelect,
}: {
  candidate: RelocationCandidate;
  selected: boolean;
  showDistance: boolean;
  onSelect: () => void;
}) {
  const location = [candidate.ville, candidate.commune].filter(Boolean).join(" · ");
  const availability = candidate.disponibiliteConfirmeeVia ? AVAILABILITY_TAGS[candidate.disponibiliteConfirmeeVia] : null;
  const validation = candidate.statusValidation ? STATUS_VALIDATION_LABELS[candidate.statusValidation] : null;

  return (
    <Card
      hoverable
      size="small"
      onClick={onSelect}
      role="button"
      aria-pressed={selected}
      style={{
        height: "100%",
        borderRadius: 10,
        border: selected ? "2px solid #1677ff" : "1px solid #E8E9EE",
      }}
      cover={
        candidate.miniature ? (
          <img
            src={candidate.miniature}
            alt={candidate.nom}
            style={{ height: 120, objectFit: "cover", borderRadius: "10px 10px 0 0" }}
          />
        ) : (
          <div
            style={{
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F5F5F7",
              borderRadius: "10px 10px 0 0",
            }}
          >
            <HomeOutlined style={{ fontSize: 32, color: "#BFBFBF" }} />
          </div>
        )
      }
    >
      <Space direction="vertical" size={2} style={{ width: "100%" }}>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Text strong ellipsis style={{ maxWidth: 180 }}>
            {candidate.nom}
          </Text>
          {selected && <CheckCircleFilled style={{ color: "#1677ff" }} />}
        </Space>
        {location && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {location}
          </Text>
        )}
        <Space size={12} wrap>
          {candidate.prixReservation != null && <Text>{formatFcfa(candidate.prixReservation)} / nuit</Text>}
          {candidate.nombreMaxOccupants != null && (
            <Text type="secondary">
              <TeamOutlined /> {candidate.nombreMaxOccupants}
            </Text>
          )}
          {showDistance && candidate.distanceKm != null && (
            <Text type="secondary">{candidate.distanceKm.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km</Text>
          )}
        </Space>
        <Space size={[4, 4]} wrap>
          {availability && <Tag color={availability.color}>{availability.label}</Tag>}
          {candidate.source === "recherche" && <Tag>Disponibilité non vérifiée</Tag>}
          {validation && <Tag color={validation.color}>{validation.label}</Tag>}
        </Space>
      </Space>
    </Card>
  );
}
