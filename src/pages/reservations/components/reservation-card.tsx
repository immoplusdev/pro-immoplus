import React from "react";
import { Button, Space, theme } from "antd";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useTranslate } from "@refinedev/core";
import { DeleteButton } from "@refinedev/antd";
import { StatusReservationTag } from "./status-reservation-tag";
import { StatusValidationReservationTag } from "./status-validation-reservation-tag";
import {
  ReservationCountdown,
  isRelevantStatus,
  getTempsRestant,
} from "./reservation-countdown";
import { formatAmount } from "@/lib/helpers";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

// ─── couleur bordure gauche ────────────────────────────────────────────────
function getBorderColor(record: any): string {
  const status: string = record.statusReservation;

  if (isRelevantStatus(status)) {
    const remaining = getTempsRestant(record);
    if (remaining <= 3 * 60 * 1000) return "#E24B4A"; // urgent (< 3 min ou expiré)
    return "#EF9F27"; // en attente (> 3 min)
  }

  switch (status) {
    case StatusReservation.Valide:
    case StatusReservation.Terminee:
      return "#5DCAA5";
    case StatusReservation.EnCours:
      return "#97C459";
    default:
      return "#888780"; // rejete, annulés, timeout
  }
}

// ─── composant card ───────────────────────────────────────────────────────
type Props = {
  record: any;
  onExpire?: () => void;
};

export function ReservationCard({ record, onExpire }: Props) {
  const translate = useTranslate();
  const { token } = theme.useToken();
  const borderColor = getBorderColor(record);
  const date = new Date(record.createdAt);

  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: token.borderRadiusLG,
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* ── ligne principale ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {/* gauche : timer + infos */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}
        >
          {isRelevantStatus(record.statusReservation) && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 52 }}>
              <ReservationCountdown reservation={record} onExpire={onExpire} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
            {/* code + téléphone */}
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: token.colorText,
              }}
            >
              {record.codeReservation ?? "—"}
              {record.clientPhoneNumber && (
                <span
                  style={{ fontWeight: 400, color: token.colorTextSecondary, marginLeft: 8 }}
                >
                  · {record.clientPhoneNumber}
                </span>
              )}
            </span>

            {/* badges + date */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: token.colorTextSecondary,
                  background: token.colorFillSecondary,
                  padding: "2px 8px",
                  borderRadius: 100,
                  whiteSpace: "nowrap",
                }}
              >
                {date.toLocaleDateString("fr-FR")} à{" "}
                {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span style={{ color: token.colorBorderSecondary }}>·</span>
              <StatusReservationTag status={record.statusReservation} />
              <span style={{ color: token.colorBorderSecondary }}>·</span>
              <StatusValidationReservationTag statusValidation={record.statusFacture} />
            </div>
          </div>
        </div>

        {/* droite : montant + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{ fontSize: 15, fontWeight: 600, color: token.colorText, whiteSpace: "nowrap" }}
            >
              {formatAmount(record.montantTotalReservation)}
            </div>
            <div style={{ fontSize: 11, color: token.colorTextTertiary }}>
              comm. {formatAmount(record.montantCommission)}
            </div>
          </div>
          <Space>
            <Link to={`/reservations/edit/${record.id}`}>
              <Button size="small" icon={<ArrowRightOutlined />}>
                Détails
              </Button>
            </Link>
            <DeleteButton hideText size="small" recordItemId={record.id} />
          </Space>
        </div>
      </div>

      {/* ── grille meta ───────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "6px 16px",
          paddingTop: 10,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <MetaItem
          label={translate("fields.client_phone_number")}
          value={record.clientPhoneNumber ?? "—"}
          token={token}
        />
        <MetaItem
          label={translate("reservations.fields.code_reservation")}
          value={record.codeReservation ?? "—"}
          token={token}
        />
        <MetaItem
          label={translate("reservations.fields.retrait_pro_effectue")}
          value={
            record.retraitProEffectue
              ? translate("reservations.fields.oui")
              : translate("reservations.fields.non")
          }
          valueColor={record.retraitProEffectue ? token.colorSuccess : token.colorError}
          token={token}
        />
        <MetaItem
          label={translate("reservations.fields.montant_paye")}
          value={formatAmount(record.montantTotalReservation)}
          token={token}
        />
      </div>
    </div>
  );
}

// ─── helper meta ──────────────────────────────────────────────────────────
function MetaItem({
  label,
  value,
  valueColor,
  token,
}: {
  label: string;
  value: string;
  valueColor?: string;
  token: ReturnType<typeof theme.useToken>["token"];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontSize: 10,
          color: token.colorTextTertiary,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 12, color: valueColor ?? token.colorTextSecondary }}>
        {value}
      </span>
    </div>
  );
}
