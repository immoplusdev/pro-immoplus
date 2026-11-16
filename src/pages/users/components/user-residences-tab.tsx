import React from "react";
import { Button, Table } from "antd";
import { useTable } from "@refinedev/antd";
import { BaseRecord, useTranslate } from "@refinedev/core";
import { Link, useLocation } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Thumbnail } from "@/components";
import { formatAmount, getApiFileUrl } from "@/lib/helpers";
import { StatusValidationResidence } from "@/core/domain/residences";
import { OutlineTag, StatusValidationResidenceTag } from "@/pages/residences/components";
import { TypeResidenceTag } from "@/pages/residences/components/type-residence-tag";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

/**
 * Onglet "Résidences" de la fiche utilisateur (pros uniquement — masqué par l'appelant).
 * GET /residences ne restreint rien pour un admin ; le filtre `proprietaire` est
 * traduit en `proprietaire.id` par le repository backend. Toutes les résidences
 * sont listées, quel que soit leur statut de validation.
 */
export function UserResidencesTab({ userId }: { userId: string }) {
  const translate = useTranslate();
  const location = useLocation();
  const { tableProps } = useTable({
    resource: "residences",
    // Pas de synchro URL : la page porte déjà ?tab= et ne doit pas hériter des filtres de /residences.
    syncWithLocation: false,
    sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    filters: { permanent: [{ field: "proprietaire", operator: "eq", value: userId }] },
    pagination: { pageSize: 10 },
  });

  return (
    <Table {...tableProps} rowKey="id" style={{ marginTop: 16 }} scroll={{ x: true }}>
      <Table.Column
        dataIndex="miniature"
        title={translate("fields.images")}
        render={(value: string, record: BaseRecord) => (
          <Thumbnail src={getApiFileUrl(value ?? record.miniatureId)} />
        )}
        align="center"
      />
      <Table.Column dataIndex="nom" title={translate("fields.nom")} sorter />
      <Table.Column
        dataIndex="typeResidence"
        title={translate("residences.fields.type_residence")}
        render={(value: string) => <TypeResidenceTag typeResidence={value} />}
        align="center"
        sorter
      />
      <Table.Column
        dataIndex="prixReservation"
        title={translate("fields.prix_reservation")}
        render={(value: number) => formatAmount(value)}
        align="center"
        sorter
      />
      <Table.Column
        dataIndex="statusValidation"
        title={translate("fields.status_validation")}
        render={(value: StatusValidationResidence) => (
          <StatusValidationResidenceTag statusValidation={value} />
        )}
        align="center"
        sorter
      />
      <Table.Column
        dataIndex="residenceDisponible"
        title={translate("residences.fields.residence_disponible")}
        render={(value: boolean) =>
          value ? (
            <OutlineTag color="#1F8A5B">{translate("biens_immobiliers.fields.disponible")}</OutlineTag>
          ) : (
            <OutlineTag color="#C13838">{translate("biens_immobiliers.fields.non_disponible")}</OutlineTag>
          )
        }
        align="center"
      />
      <Table.Column
        dataIndex="createdAt"
        title={translate("fields.created_at")}
        render={(date: string) => (date ? new Date(date).toLocaleDateString() : "-")}
        align="center"
        sorter
      />
      <Table.Column
        title={translate("table.actions")}
        dataIndex="actions"
        align="center"
        render={(_, record: BaseRecord) => (
          <Link to={`/residences/edit/${record.id}`} state={{ from: location.pathname + location.search }}>
            <Button
              size="small"
              icon={<ArrowRightOutlined />}
              style={{ background: "#FFFFFF", border: `1px solid ${BORDER_COLOR}`, color: TEXT_SECONDARY }}
            />
          </Link>
        )}
      />
    </Table>
  );
}
