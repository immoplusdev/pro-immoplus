import React, { useState } from "react";
import { useApiUrl, useTranslate } from "@refinedev/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Divider, Empty, Modal, Progress, Select, Spin, Tag, Typography, message } from "antd";
import { Add, Calendar, Chart21, TickCircle } from "iconsax-react";
import dayjs from "dayjs";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { Link } from "react-router-dom";

type ItemState = "pending" | "done" | "failed" | "not_applicable";

type ProgressItem = {
    key: string;
    step: number;
    source: "AUTO" | "COM";
    label: string;
    state: ItemState;
    completedAt?: string | null;
    note?: string | null;
};

type ProgressCase = {
    id: string;
    residenceId?: string | null;
    residence?: { id?: string; nom?: string; name?: string } | null;
    track: "new_pro" | "existing_pro";
    status: string;
    currentStep: number;
    completionPercent: number;
    nextAction?: string | null;
    nextActionAt?: string | null;
    items: ProgressItem[];
};

type ProProgressResponse = {
    data: {
        proId: string;
        summary: {
            totalCases: number;
            completedCases: number;
            averageCompletionPercent: number;
            nextActionAt?: string | null;
        };
        cases: ProgressCase[];
    };
};

interface Props {
    open: boolean;
    proId: string | null;
    proName?: string;
    onClose: () => void;
}

const statusColors: Record<string, string> = {
    in_progress: "processing",
    blocked: "error",
    ready_for_validation: "warning",
    completed: "success",
    cancelled: "default",
};

function formatDate(value?: string | null) {
    return value ? dayjs(value).format("DD/MM/YYYY [à] HH:mm") : null;
}

export function ProProgressModal({ open, proId, proName, onClose }: Props) {
    const apiUrl = useApiUrl();
    const translate = useTranslate();
    const queryClient = useQueryClient();
    const [track, setTrack] = useState<"new_pro" | "existing_pro">("new_pro");
    const queryKey = ["pro-progress", proId];

    const { data, isFetching, isError } = useQuery({
        queryKey,
        enabled: open && !!proId,
        queryFn: async () => (await axiosInstance.get<ProProgressResponse>(`${apiUrl}/admin/pro-progress/pros/${proId}`)).data,
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey });

    const createCase = useMutation({
        mutationFn: () => axiosInstance.post(`${apiUrl}/admin/pro-progress/cases`, { proId, track }),
        onSuccess: () => {
            message.success(translate("pro_progress.started"));
            refresh();
        },
        onError: () => message.error(translate("pro_progress.start_error")),
    });

    const updateItem = useMutation({
        mutationFn: ({ caseId, item, state }: { caseId: string; item: ProgressItem; state: ItemState }) =>
            axiosInstance.patch(`${apiUrl}/admin/pro-progress/cases/${caseId}/items/${encodeURIComponent(item.key)}`, { state }),
        onSuccess: () => refresh(),
        onError: () => message.error(translate("pro_progress.item_error")),
    });

    const content = data?.data;
    const cases = content?.cases ?? [];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={760}
            destroyOnClose
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 9, background: "#EEF2FF" }}>
                        <Chart21 size={19} color="#2744DE" variant="Linear" />
                    </span>
                    <span>{translate("pro_progress.title")}{proName ? ` · ${proName}` : ""}</span>
                </div>
            }
        >
            {isFetching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 56 }}><Spin /></div>
            ) : isError ? (
                <Empty description={translate("pro_progress.unavailable")}><Button onClick={refresh}>{translate("pro_progress.retry")}</Button></Empty>
            ) : cases.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={translate("pro_progress.not_started")}
                >
                    <Typography.Paragraph type="secondary" style={{ marginTop: -16 }}>
                        {translate("pro_progress.not_started_description")}
                    </Typography.Paragraph>
                    <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <Select
                            value={track}
                            onChange={setTrack}
                            options={[{ value: "new_pro", label: translate("pro_progress.new_pro") }, { value: "existing_pro", label: translate("pro_progress.existing_pro") }]}
                            style={{ width: 150 }}
                        />
                        <Button type="primary" icon={<Add size={17} />} loading={createCase.isPending} onClick={() => createCase.mutate()}>
                            {translate("pro_progress.start")}
                        </Button>
                    </div>
                </Empty>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: 14, borderRadius: 10, background: "#F8F9FC" }}>
                        <Metric label={translate("pro_progress.cases")} value={content?.summary.totalCases ?? 0} />
                        <Metric label={translate("pro_progress.average_completion")} value={`${content?.summary.averageCompletionPercent ?? 0}%`} />
                        <Metric label={translate("pro_progress.completed")} value={content?.summary.completedCases ?? 0} />
                    </div>
                    {cases.map((progressCase) => (
                        <section key={progressCase.id} style={{ border: "1px solid #E8E9EE", borderRadius: 10, padding: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                                <div>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                                        <strong>{translate(progressCase.track === "new_pro" ? "pro_progress.new_pro_track" : "pro_progress.existing_pro_track")}</strong>
                                        <Tag color={statusColors[progressCase.status] ?? "default"}>{translate(`pro_progress.status.${progressCase.status}`, { defaultValue: progressCase.status })}</Tag>
                                    </div>
                                    <Typography.Text type="secondary">{translate("pro_progress.step", { step: progressCase.currentStep })}</Typography.Text>
                                    <ResidenceReference residenceId={progressCase.residenceId} residence={progressCase.residence} />
                                </div>
                                <span style={{ fontWeight: 700, color: "#2744DE" }}>{progressCase.completionPercent}%</span>
                            </div>
                            <Progress percent={progressCase.completionPercent} showInfo={false} strokeColor="#2744DE" size="small" style={{ margin: "12px 0 8px" }} />
                            {progressCase.nextAction && (
                                <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#494C57", fontSize: 13, marginBottom: 12 }}>
                                    <Calendar size={16} color="#5F6370" variant="Linear" />
                                    <span><strong>{translate("pro_progress.next_action")}</strong> {progressCase.nextAction}{formatDate(progressCase.nextActionAt) ? ` — ${formatDate(progressCase.nextActionAt)}` : ""}</span>
                                </div>
                            )}
                            <Divider style={{ margin: "10px 0" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                                {progressCase.items.length ? progressCase.items.map((item) => {
                                    const isAutomatic = item.source === "AUTO";
                                    return (
                                        <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                            <Checkbox
                                                checked={item.state === "done"}
                                                disabled={isAutomatic || updateItem.isPending}
                                                onChange={(event) => updateItem.mutate({ caseId: progressCase.id, item, state: event.target.checked ? "done" : "pending" })}
                                            >
                                                <span style={{ color: item.state === "done" ? "#1F8A5B" : undefined }}>{item.label}</span>
                                            </Checkbox>
                                            {isAutomatic ? <Tag color="blue">{translate("pro_progress.automatic")}</Tag> : item.state === "done" ? <TickCircle size={18} color="#1F8A5B" variant="Bold" /> : null}
                                        </div>
                                    );
                                }) : <Typography.Text type="secondary">{translate("pro_progress.no_items")}</Typography.Text>}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </Modal>
    );
}

function ResidenceReference({ residenceId, residence }: Pick<ProgressCase, "residenceId" | "residence">) {
    const apiUrl = useApiUrl();
    const translate = useTranslate();
    const directName = residence?.nom ?? residence?.name;
    const { data } = useQuery({
        queryKey: ["pro-progress-residence", residenceId],
        enabled: !!residenceId && !directName,
        queryFn: async () => (await axiosInstance.get<{ data?: { nom?: string; name?: string }; nom?: string; name?: string }>(`${apiUrl}/residences/${residenceId}`)).data,
    });
    const resolvedResidence = data?.data ?? data;
    const residenceName = directName ?? resolvedResidence?.nom ?? resolvedResidence?.name;

    if (!residenceId || !residenceName) return null;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, fontSize: 13 }}>
            <Typography.Text type="secondary">{translate("pro_progress.residence")} :</Typography.Text>
            <Typography.Text strong>{residenceName}</Typography.Text>
            <Link to={`/residences/show/${residenceId}`} aria-label={`${translate("pro_progress.view_details")} : ${residenceName}`}>
                {translate("pro_progress.view_details")}
            </Link>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
    return <div><div style={{ color: "#6C707A", fontSize: 12 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 700, color: "#20222A" }}>{value}</div></div>;
}
