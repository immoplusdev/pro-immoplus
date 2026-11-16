import React from "react";
import {
  Alert,
  Card,
  Col,
  Divider,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import { AppstoreOutlined, CalendarOutlined, HomeOutlined, ThunderboltOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { formatAmount } from "@/lib/helpers";
import {
  BOOKING_MODE_LABELS,
  ENABLED_BOOKING_MODES,
  STAY_LIMITS,
  formatAdvanceNotice,
  rangeOptions,
  type BookingMode,
} from "./stay-residence.helpers";
import { useStayCatalogs, type CatalogGroup } from "./use-stay-catalogs";

const { Text } = Typography;

const CARD_STYLE: React.CSSProperties = { border: "1px solid #E8E9EE", borderRadius: 10 };
const BLOCK_STYLE: React.CSSProperties = { border: "1px solid #F0F0F3", borderRadius: 8 };
const FULL_WIDTH: React.CSSProperties = { width: "100%" };

const priceRules = (label: string) => [
  {
    type: "number" as const,
    min: STAY_LIMITS.nightlyPrice.min,
    max: STAY_LIMITS.nightlyPrice.max,
    message: `${label} doit être compris entre ${formatAmount(STAY_LIMITS.nightlyPrice.min)} et ${formatAmount(STAY_LIMITS.nightlyPrice.max)}.`,
  },
];

/** Heure "HH:mm" ↔ TimePicker. */
const timeItemProps = {
  getValueProps: (value?: string | null) => ({ value: value ? dayjs(value, "HH:mm") : null }),
  normalize: (value?: Dayjs | null) => (value ? value.format("HH:mm") : null),
};

/** Équipements : chips cliquables groupées par catégorie (codes du catalogue uniquement). */
function AmenityPicker({
  value = [],
  onChange,
  groups,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
  groups: CatalogGroup[];
}) {
  const selected = new Set(value);
  const known = new Set(groups.flatMap((g) => g.items.map((i) => i.code)));
  const unknownCount = value.filter((code) => !known.has(code)).length;
  const toggle = (code: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(code);
    else next.delete(code);
    onChange?.([...next]);
  };

  return (
    <Space direction="vertical" style={FULL_WIDTH} size="middle">
      {groups.map((group) => (
        <div key={group.key}>
          <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
            {group.label}
          </Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {group.items.map((item) => (
              <Tag.CheckableTag
                key={item.code}
                checked={selected.has(item.code)}
                onChange={(checked) => toggle(item.code, checked)}
                style={{ border: "1px solid #E8E9EE", padding: "2px 10px" }}
              >
                {item.label}
              </Tag.CheckableTag>
            ))}
          </div>
        </div>
      ))}
      {unknownCount > 0 && (
        <Text type="warning" style={{ fontSize: 12 }}>
          {unknownCount} équipement(s) enregistré(s) absent(s) du catalogue actuel : ils sont conservés.
        </Text>
      )}
    </Space>
  );
}

type Props = {
  residence?: Record<string, any>;
  /** Erreurs de l'API sans champ éditable sur la page (photos, adresse…). */
  generalErrors: string[];
};

/**
 * Section « Séjour » de la fiche résidence (résidences du nouveau flow uniquement).
 * Les champs vivent sous `stay` avec les noms du PATCH : voir `stay-residence.helpers.ts`.
 */
export function StayResidenceSection({ residence, generalErrors }: Props) {
  const form = Form.useFormInstance();
  const { propertyTypes, roomGroups, amenityGroups, isLoading, isError } = useStayCatalogs(true);
  const advanceNoticeDays = Form.useWatch(["stay", "advanceNoticeDays"], form);
  const weekendPricingEnabled = Form.useWatch(["stay", "weekendPricingEnabled"], form);
  const currentBookingMode = residence?.bookingMode as BookingMode | undefined;

  // Un mode inactif déjà enregistré reste affiché (désactivé) pour ne pas montrer un code brut.
  const bookingModeOptions = (Object.keys(BOOKING_MODE_LABELS) as BookingMode[])
    .filter((mode) => ENABLED_BOOKING_MODES.includes(mode) || mode === currentBookingMode)
    .map((mode) => ({
      value: mode,
      label: BOOKING_MODE_LABELS[mode],
      disabled: !ENABLED_BOOKING_MODES.includes(mode),
    }));

  // Type inconnu du catalogue : on garde l'option pour ne pas perdre la valeur.
  const propertyTypeOptions = propertyTypes.map((item) => ({ value: item.code, label: item.label }));
  const currentType = residence?.propertyTypeCode;
  if (currentType && !propertyTypes.some((item) => item.code === currentType) && !isLoading) {
    propertyTypeOptions.push({ value: currentType, label: "Type absent du catalogue" });
  }

  return (
    <Card
      style={{ ...CARD_STYLE, marginTop: 32 }}
      title={
        <Space>
          <CalendarOutlined />
          <p>Séjour</p>
          <Tag color="blue">Nouveau flow</Tag>
        </Space>
      }
      headStyle={{ padding: "1rem" }}
      bodyStyle={{ padding: "1.5rem" }}
    >
      <Space direction="vertical" size="large" style={FULL_WIDTH}>
        {generalErrors.length > 0 && (
          <Alert
            type="error"
            showIcon
            message="L'API a refusé la modification"
            description={
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {generalErrors.map((message, i) => (
                  <li key={i}>{message}</li>
                ))}
              </ul>
            }
          />
        )}
        {isError && (
          <Alert
            type="warning"
            showIcon
            message="Impossible de charger les catalogues séjour : certains libellés peuvent manquer."
          />
        )}

        {/* ── Logement ─────────────────────────────────────────────── */}
        <Card
          size="small"
          style={BLOCK_STYLE}
          title={
            <Space>
              <HomeOutlined />
              Logement
            </Space>
          }
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Type de logement"
                name={["stay", "propertyType"]}
                rules={[{ required: true, message: "Le type de logement est obligatoire." }]}
              >
                <Select loading={isLoading} options={propertyTypeOptions} showSearch optionFilterProp="label" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            {(
              [
                ["bedrooms", "Chambres"],
                ["livingRooms", "Salons"],
                ["bathrooms", "Salles de bain"],
                ["maxGuests", "Voyageurs max"],
              ] as const
            ).map(([key, label]) => (
              <Col xs={12} md={6} key={key}>
                <Form.Item
                  label={label}
                  name={["stay", "capacity", key]}
                  rules={key === "maxGuests" ? [{ required: true, message: "Le nombre de voyageurs est obligatoire." }] : []}
                >
                  <Select
                    options={rangeOptions(STAY_LIMITS.capacity[key].min, STAY_LIMITS.capacity[key].max)}
                    showSearch
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
          {roomGroups.length > 0 && <Divider plain style={{ margin: "8px 0 16px" }}>Pièces et lits</Divider>}
          {roomGroups.map((group) => (
            <div key={group.key}>
              <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {group.label}
              </Text>
              <Row gutter={16} style={{ marginTop: 6 }}>
                {group.items
                  .filter((item) => item.countKey)
                  .map((item) => (
                    <Col xs={12} md={6} key={item.code}>
                      <Form.Item label={item.label} name={["stay", "roomCounts", item.countKey!]} tooltip={item.description}>
                        <Select
                          allowClear
                          placeholder="0"
                          options={rangeOptions(STAY_LIMITS.roomCount.min, STAY_LIMITS.roomCount.max)}
                          showSearch
                        />
                      </Form.Item>
                    </Col>
                  ))}
              </Row>
            </div>
          ))}
        </Card>

        {/* ── Équipements ──────────────────────────────────────────── */}
        <Card
          size="small"
          style={BLOCK_STYLE}
          title={
            <Space>
              <AppstoreOutlined />
              Équipements
            </Space>
          }
        >
          <Form.Item
            name={["stay", "amenityCodes"]}
            rules={[
              {
                type: "array",
                max: STAY_LIMITS.amenitiesMaxItems,
                message: `${STAY_LIMITS.amenitiesMaxItems} équipements maximum.`,
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <AmenityPicker groups={amenityGroups} />
          </Form.Item>
        </Card>

        {/* ── Réservation & tarifs ─────────────────────────────────── */}
        <Card
          size="small"
          style={BLOCK_STYLE}
          title={
            <Space>
              <ThunderboltOutlined />
              Réservation &amp; tarifs
            </Space>
          }
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Mode de réservation" name={["stay", "bookingMode"]} rules={[{ required: true }]}>
                <Select options={bookingModeOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Préavis" name={["stay", "advanceNoticeDays"]}>
                <Select
                  options={STAY_LIMITS.advanceNoticeDays.map((days) => ({
                    value: days,
                    label: formatAdvanceNotice(days),
                  }))}
                />
              </Form.Item>
            </Col>
            {advanceNoticeDays === 0 && (
              <Col xs={24} md={12}>
                <Form.Item label="Heure limite le jour même" name={["stay", "sameDayCutoff"]}>
                  <Select
                    allowClear
                    placeholder="Aucune"
                    options={STAY_LIMITS.sameDayCutoffs.map((time) => ({ value: time, label: time }))}
                  />
                </Form.Item>
              </Col>
            )}
            <Col xs={24} md={12}>
              <Form.Item label="Réservable jusqu'à" name={["stay", "bookingHorizonDays"]}>
                <Select
                  options={STAY_LIMITS.bookingHorizonDays.map((days) => ({
                    value: days,
                    label: `${days} jours à l'avance`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Nuits de préparation entre deux séjours" name={["stay", "preparationNights"]}>
                <Select
                  options={STAY_LIMITS.preparationNights.map((n) => ({
                    value: n,
                    label: n === 0 ? "Aucune" : `${n} nuit${n > 1 ? "s" : ""}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item label="Arrivée à partir de" name={["stay", "checkInFrom"]} {...timeItemProps}>
                <TimePicker format="HH:mm" minuteStep={15} style={FULL_WIDTH} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item label="Départ avant" name={["stay", "checkOutBefore"]} {...timeItemProps}>
                <TimePicker format="HH:mm" minuteStep={15} style={FULL_WIDTH} />
              </Form.Item>
            </Col>
          </Row>

          <Divider plain style={{ margin: "8px 0 16px" }}>Tarifs</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Prix de base par nuit (FCFA)"
                name={["stay", "baseNightlyPrice"]}
                rules={[{ required: true, message: "Le tarif par nuit est obligatoire." }, ...priceRules("Le tarif par nuit")]}
              >
                <InputNumber
                  min={STAY_LIMITS.nightlyPrice.min}
                  max={STAY_LIMITS.nightlyPrice.max}
                  precision={0}
                  step={500}
                  style={FULL_WIDTH}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Réduction à partir de 7 nuits" name={["stay", "weeklyDiscountPercent"]}>
                <Select
                  options={STAY_LIMITS.weeklyDiscountPercents.map((p) => ({
                    value: p,
                    label: p === 0 ? "Aucune" : `${p} %`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Tarif week-end (ven. et sam.)" name={["stay", "weekendPricingEnabled"]} valuePropName="checked">
                <Switch checkedChildren="Activé" unCheckedChildren="Désactivé" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Prix week-end par nuit (FCFA)"
                name={["stay", "weekendNightlyPrice"]}
                rules={
                  weekendPricingEnabled
                    ? [{ required: true, message: "Le tarif week-end est obligatoire." }, ...priceRules("Le tarif week-end")]
                    : []
                }
              >
                <InputNumber
                  disabled={!weekendPricingEnabled}
                  min={STAY_LIMITS.nightlyPrice.min}
                  max={STAY_LIMITS.nightlyPrice.max}
                  precision={0}
                  step={500}
                  style={FULL_WIDTH}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                label="Nuits min"
                name={["stay", "minNights"]}
                rules={[{ required: true, message: "Obligatoire." }]}
              >
                <InputNumber min={STAY_LIMITS.nights.min} max={STAY_LIMITS.nights.max} precision={0} style={FULL_WIDTH} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item
                label="Nuits max"
                name={["stay", "maxNights"]}
                dependencies={[["stay", "minNights"]]}
                rules={[
                  { required: true, message: "Obligatoire." },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const min = getFieldValue(["stay", "minNights"]);
                      if (value == null || min == null || value >= min) return Promise.resolve();
                      return Promise.reject(new Error("Doit être supérieur ou égal au minimum."));
                    },
                  }),
                ]}
              >
                <InputNumber min={STAY_LIMITS.nights.min} max={STAY_LIMITS.nights.max} precision={0} style={FULL_WIDTH} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              {/* `reduction` est la réduction appliquée par un admin : distincte de la réduction hebdo. */}
              <Form.Item label="Réduction admin (historique)">
                <Text>{residence?.reduction ? `${residence.reduction} %` : "Aucune"}</Text>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item label="Animaux autorisés" name={["stay", "petsAllowed"]} valuePropName="checked">
                <Switch checkedChildren="Oui" unCheckedChildren="Non" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item label="Fêtes autorisées" name={["stay", "partiesAllowed"]} valuePropName="checked">
                <Switch checkedChildren="Oui" unCheckedChildren="Non" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Space>
    </Card>
  );
}
