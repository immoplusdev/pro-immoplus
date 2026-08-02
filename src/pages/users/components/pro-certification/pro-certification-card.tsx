import React, { useState } from "react";
import { useApiUrl } from "@refinedev/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Space, Spin, Empty, message } from "antd";
import { ReloadOutlined, SafetyCertificateOutlined, StopOutlined, DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { OutlineTag, VerificationBadge } from "@/components/table";
import { MotifModal } from "./motif-modal";
import {
    ProCertificationDetail,
    certificationStatusColor,
    certificationStatusLabel,
    conditionsAttributionLabels,
    ConditionsAttribution,
} from "./types";

const BORDER_COLOR = "#E8E9EE";
const TEXT_SECONDARY = "#494C57";
const PRIMARY = "#2744DE";

interface Props {
    proId?: string;
}

function PilierCard({ title, score, max, children }: { title: string; score: number | null; max: number; children: React.ReactNode }) {
    return (
        <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 10, padding: 16, background: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: PRIMARY }}>{score ?? "—"}/{max}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: TEXT_SECONDARY }}>
                {children}
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span>{label}</span>
            <span style={{ fontWeight: 500, color: "#12131A" }}>{value ?? "—"}</span>
        </div>
    );
}

export function ProCertificationCard({ proId }: Props) {
    const apiUrl = useApiUrl();
    const queryClient = useQueryClient();
    const queryKey = ["pro-certification", proId];
    const [modal, setModal] = useState<null | "suspend" | "retirer">(null);
    const [actionLoading, setActionLoading] = useState(false);

    const { data, isFetching } = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await axiosInstance.get<ProCertificationDetail>(`${apiUrl}/pro/${proId}/certification`);
            return response.data;
        },
        enabled: !!proId,
    });

    const refetch = () => queryClient.invalidateQueries({ queryKey });

    const runAction = async (action: string, payload?: Record<string, string>) => {
        setActionLoading(true);
        try {
            await axiosInstance.post(`${apiUrl}/admin/pro-certification/${proId}/${action}`, payload ?? {});
            message.success("Action effectuée avec succès");
            setModal(null);
            refetch();
        } catch {
            message.error("Erreur lors de l'exécution de l'action");
        } finally {
            setActionLoading(false);
        }
    };

    if (!proId) return null;

    return (
        <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 10, background: "#FFFFFF", padding: 24, marginTop: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <Space>
                    <SafetyCertificateOutlined style={{ color: PRIMARY }} />
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Certification Pro</span>
                </Space>
                <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    style={{ background: "#FFFFFF", border: `1px solid ${BORDER_COLOR}`, color: TEXT_SECONDARY }}
                    onClick={() => refetch()}
                >
                    Actualiser
                </Button>
            </div>

            {isFetching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                    <Spin />
                </div>
            ) : !data ? (
                <Empty description="Aucune donnée de certification" />
            ) : (
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                        <span style={{ fontSize: 32, fontWeight: 700 }}>{data.scoreTotal}<span style={{ fontSize: 16, fontWeight: 400, color: TEXT_SECONDARY }}>/100</span></span>
                        <OutlineTag color={certificationStatusColor[data.status]}>{certificationStatusLabel[data.status]}</OutlineTag>
                        <span style={{ fontSize: 12, color: "#888B96", marginLeft: "auto" }}>
                            Dernier calcul : {dayjs(data.lastCalculatedAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
                        <PilierCard title="Informations" score={data.piliers.informations.score} max={data.piliers.informations.max}>
                            <DetailRow label="Photo / logo" value={data.piliers.informations.detail.photoLogo} />
                            <DetailRow label="Numéros vérifiés" value={data.piliers.informations.detail.numerosVerifies} />
                            <DetailRow label="Identité / RCCM" value={data.piliers.informations.detail.identiteRccm} />
                            <DetailRow label="E-mail" value={data.piliers.informations.detail.email} />
                            <DetailRow label="Adresse" value={data.piliers.informations.detail.adresse} />
                            <DetailRow label="Moyen de paiement" value={data.piliers.informations.detail.moyenPaiement} />
                            <DetailRow label="Annonce complète" value={data.piliers.informations.detail.annonceComplete} />
                        </PilierCard>

                        <PilierCard title="Réservations" score={data.piliers.reservations.score} max={data.piliers.reservations.max}>
                            <DetailRow label="Réservations effectuées" value={data.piliers.reservations.nbReservationsEffectuees} />
                            <DetailRow label="Plafond" value={data.piliers.reservations.plafond} />
                        </PilierCard>

                        <PilierCard title="Avis" score={data.piliers.avis.score} max={data.piliers.avis.max}>
                            <DetailRow label="Note moyenne" value={data.piliers.avis.noteMoyenne != null ? `${data.piliers.avis.noteMoyenne}/5` : null} />
                            <DetailRow label="Avis reçus" value={data.piliers.avis.nbAvisRecus} />
                        </PilierCard>

                        <PilierCard title="Fiabilité" score={data.piliers.fiabilite.score} max={data.piliers.fiabilite.max}>
                            <DetailRow label="Taux de réponse" value={data.piliers.fiabilite.tauxReponse != null ? `${data.piliers.fiabilite.tauxReponse}%` : null} />
                            <DetailRow label="Délai médian" value={data.piliers.fiabilite.delaiMedianMinutes != null ? `${data.piliers.fiabilite.delaiMedianMinutes} min` : null} />
                            <DetailRow label="Calendrier MAJ" value={data.piliers.fiabilite.calendrierMajJours != null ? `${data.piliers.fiabilite.calendrierMajJours} j` : null} />
                            <DetailRow label="Taux annulation Pro" value={data.piliers.fiabilite.tauxAnnulationPro != null ? `${data.piliers.fiabilite.tauxAnnulationPro}%` : null} />
                            <DetailRow label="Taux check-in réussi" value={data.piliers.fiabilite.tauxCheckinReussi != null ? `${data.piliers.fiabilite.tauxCheckinReussi}%` : null} />
                        </PilierCard>
                    </div>

                    <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 12 }}>Conditions d'attribution</span>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                            {(Object.keys(conditionsAttributionLabels) as (keyof ConditionsAttribution)[]).map((key) => (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <VerificationBadge verified={data.conditionsAttribution[key]} />
                                    <span style={{ fontSize: 12, color: TEXT_SECONDARY }}>{conditionsAttributionLabels[key]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Space wrap>
                        <Button
                            icon={<ReloadOutlined />}
                            loading={actionLoading}
                            style={{ background: "#FFFFFF", border: `1px solid ${BORDER_COLOR}`, color: TEXT_SECONDARY }}
                            onClick={() => runAction("recalculate")}
                        >
                            Recalculer
                        </Button>
                        {data.status !== "suspendu" && (
                            <Button
                                icon={<StopOutlined />}
                                style={{ background: "#FFFFFF", border: "1px solid #B86B0A", color: "#B86B0A" }}
                                onClick={() => setModal("suspend")}
                            >
                                Suspendre
                            </Button>
                        )}
                        {data.status !== "retire" && (
                            <Button
                                icon={<DeleteOutlined />}
                                style={{ background: "#FFFFFF", border: "1px solid #C13838", color: "#C13838" }}
                                onClick={() => setModal("retirer")}
                            >
                                Retirer
                            </Button>
                        )}
                        {(data.status === "suspendu" || data.status === "retire") && (
                            <Button
                                icon={<UndoOutlined />}
                                loading={actionLoading}
                                style={{ background: "#FFFFFF", border: "1px solid #1F8A5B", color: "#1F8A5B" }}
                                onClick={() => runAction("reactiver")}
                            >
                                Réactiver
                            </Button>
                        )}
                    </Space>
                </>
            )}

            <MotifModal
                open={modal === "suspend"}
                title="Suspendre la certification"
                confirmLabel="Suspendre"
                danger
                loading={actionLoading}
                onCancel={() => setModal(null)}
                onConfirm={(motif) => runAction("suspend", { motif })}
            />
            <MotifModal
                open={modal === "retirer"}
                title="Retirer la certification"
                confirmLabel="Retirer"
                danger
                loading={actionLoading}
                onCancel={() => setModal(null)}
                onConfirm={(motif) => runAction("retirer", { motif })}
            />
        </div>
    );
}
