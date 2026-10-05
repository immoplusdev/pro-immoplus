import React, { useState } from "react";
import { useApiUrl, useGetIdentity, useTranslate } from "@refinedev/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Divider, Empty, Input, Modal, Progress, Select, Spin, Tag, Typography, message } from "antd";
import { Add, Calendar, Chart21, TickCircle } from "iconsax-react";
import dayjs from "dayjs";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { Link } from "react-router-dom";
import { UserRole } from "@/core/domain/users";

type ItemState = "pending" | "done" | "failed" | "not_applicable";

type ProgressItem = {
    key: string;
    step: number;
    source: "AUTO" | "COM" | "SUP";
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
    const { data: identity } = useGetIdentity<{ role?: { id: string } }>();
    const isAdmin = identity?.role?.id === UserRole.Admin;
    const queryClient = useQueryClient();
    const [track, setTrack] = useState<"new_pro" | "existing_pro">("new_pro");
    const [noteEditor, setNoteEditor] = useState<{ caseId: string; item: ProgressItem } | null>(null);
    const [note, setNote] = useState("");
    const [itemState, setItemState] = useState<ItemState>("pending");
    const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [itemPage, setItemPage] = useState(0);
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
        mutationFn: ({ caseId, item, state, note }: { caseId: string; item: ProgressItem; state: ItemState; note?: string }) =>
            axiosInstance.patch(`${apiUrl}/admin/pro-progress/cases/${caseId}/items/${encodeURIComponent(item.key)}`, { state, note }),
        onSuccess: () => refresh(),
        onError: () => message.error(translate("pro_progress.item_error")),
    });

    const content = data?.data;
    const cases = content?.cases ?? [];
    const activeCase = cases.find((progressCase) => progressCase.id === activeCaseId) ?? cases[0];
    const stepNumbers = activeCase ? [...new Set(activeCase.items.map((item) => item.step))].sort((a, b) => a - b) : [];
    const selectedStep = activeStep ?? activeCase?.currentStep ?? stepNumbers[0];
    const stepItems = activeCase?.items.filter((item) => item.step === selectedStep) ?? [];
    const itemsPerPage = 6;
    const itemPageCount = Math.max(1, Math.ceil(stepItems.length / itemsPerPage));
    const visibleItems = stepItems.slice(itemPage * itemsPerPage, (itemPage + 1) * itemsPerPage);
    const openNoteEditor = (caseId: string, item: ProgressItem) => {
        setNoteEditor({ caseId, item });
        setNote(item.note ?? "");
        setItemState(item.state);
    };
    const saveNote = async () => {
        if (!noteEditor) return;
        try {
            await updateItem.mutateAsync({ caseId: noteEditor.caseId, item: noteEditor.item, state: itemState, note });
            message.success(translate("pro_progress.note_saved"));
            setNoteEditor(null);
        } catch {
            // The mutation displays the API error.
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={1120}
            destroyOnClose
            styles={{ body: { maxHeight: "calc(100dvh - 170px)", overflow: "hidden" } }}
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
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr 1fr", gap: 12, padding: 14, borderRadius: 14, background: "#F8F9FC", border: "1px solid #E8E9EE" }}>
                        <Metric label={translate("pro_progress.cases")} value={content?.summary.totalCases ?? 0} />
                        <Metric label={translate("pro_progress.average_completion")} value={`${content?.summary.averageCompletionPercent ?? 0}%`} />
                        <Metric label={translate("pro_progress.completed")} value={content?.summary.completedCases ?? 0} />
                    </div>
                    {cases.length > 1 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {cases.map((progressCase, index) => <Button key={progressCase.id} size="small" type={activeCase?.id === progressCase.id ? "primary" : "default"} onClick={() => { setActiveCaseId(progressCase.id); setActiveStep(progressCase.currentStep); setItemPage(0); }}>{translate("pro_progress.case_number", { number: index + 1 })}</Button>)}
                    </div>}
                    {activeCase && <section style={{ border: "1px solid #E1E5EC", borderRadius: 14, padding: 14, background: "#FFFFFF" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
                            <div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                                    <strong>{translate(activeCase.track === "new_pro" ? "pro_progress.new_pro_track" : "pro_progress.existing_pro_track")}</strong>
                                    <Tag color={statusColors[activeCase.status] ?? "default"}>{translate(`pro_progress.status.${activeCase.status}`, { defaultValue: activeCase.status })}</Tag>
                                </div>
                                <ResidenceReference residenceId={activeCase.residenceId} residence={activeCase.residence} />
                            </div>
                            <div style={{ padding: "8px 10px", background: "#F6F8FF", borderRadius: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#2744DE", fontWeight: 700 }}><span>{translate("pro_progress.progress")}</span><span>{activeCase.completionPercent}%</span></div>
                                <Progress percent={activeCase.completionPercent} showInfo={false} strokeColor="#2744DE" size="small" style={{ margin: "6px 0" }} />
                                {activeCase.nextAction && <div style={{ display: "flex", gap: 6, color: "#494C57", fontSize: 12 }}><Calendar size={15} color="#5F6370" variant="Linear" /><span>{activeCase.nextAction}{formatDate(activeCase.nextActionAt) ? ` — ${formatDate(activeCase.nextActionAt)}` : ""}</span></div>}
                            </div>
                        </div>
                        <Divider style={{ margin: "12px 0" }} />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(64px, 1fr))", gap: 7, marginBottom: 12 }}>
                            {stepNumbers.map((step) => {
                                const items = activeCase.items.filter((item) => item.step === step);
                                const completed = items.filter((item) => item.state === "done").length;
                                const selected = selectedStep === step;
                                return <button key={step} type="button" onClick={() => { setActiveStep(step); setItemPage(0); }} style={{ border: selected ? "1px solid #2744DE" : "1px solid #E1E5EC", borderRadius: 10, background: selected ? "#EEF2FF" : "#FFFFFF", padding: "8px 5px", color: "#20222A", cursor: "pointer" }}><div style={{ fontSize: 11, color: "#5F6370" }}>{translate("pro_progress.step", { step })}</div><div style={{ fontWeight: 700, fontSize: 13 }}>{completed}/{items.length}</div></button>;
                            })}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <Typography.Text strong>{translate("pro_progress.step", { step: selectedStep })}</Typography.Text>
                            {itemPageCount > 1 && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Button size="small" disabled={itemPage === 0} onClick={() => setItemPage((page) => page - 1)}>{translate("pro_progress.previous")}</Button><Typography.Text type="secondary" style={{ fontSize: 12 }}>{itemPage + 1}/{itemPageCount}</Typography.Text><Button size="small" disabled={itemPage + 1 === itemPageCount} onClick={() => setItemPage((page) => page + 1)}>{translate("pro_progress.next")}</Button></div>}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
                            {visibleItems.map((item) => {
                                    const isAutomatic = item.source === "AUTO";
                                    const isSupervision = item.source === "SUP";
                                    const isReadOnly = isAutomatic || (isSupervision && !isAdmin);
                                    return (
                                        <article key={item.key} style={{ border: "1px solid #E6E9F0", borderRadius: 12, padding: 12, minHeight: 104, display: "flex", flexDirection: "column", justifyContent: "space-between", background: item.state === "done" ? "#FAFFFC" : "#FFFFFF" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                                <Checkbox
                                                    checked={item.state === "done"}
                                                    disabled={isReadOnly || updateItem.isPending}
                                                    onChange={(event) => updateItem.mutate({ caseId: activeCase.id, item, state: event.target.checked ? "done" : "pending" })}
                                                >
                                                    <span style={{ color: item.state === "done" ? "#1F8A5B" : undefined }}>{item.label}</span>
                                                </Checkbox>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    {isAutomatic ? <Tag color="blue">{translate("pro_progress.automatic")}</Tag> : isSupervision ? <Tag color="purple">{translate("pro_progress.supervision")}</Tag> : item.state === "done" ? <TickCircle size={18} color="#1F8A5B" variant="Bold" /> : null}
                                                    {!isReadOnly && <Button type="link" size="small" onClick={() => openNoteEditor(activeCase.id, item)}>{translate(item.note ? "pro_progress.edit_note" : "pro_progress.add_note")}</Button>}
                                                </div>
                                            </div>
                                            {item.note && <div style={{ marginTop: 8, padding: "7px 8px", borderRadius: 8, background: "#F6F8FC", color: "#50545E", fontSize: 12, lineHeight: 1.45, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}><strong>{translate("pro_progress.note")} :</strong> {item.note}</div>}
                                        </article>
                                    );
                            })}
                        </div>
                    </section>}
                </div>
            )}
            <Modal
                open={!!noteEditor}
                title={noteEditor?.item.label}
                onCancel={() => setNoteEditor(null)}
                onOk={saveNote}
                okText={translate("pro_progress.save_note")}
                cancelText={translate("buttons.cancel")}
                confirmLoading={updateItem.isPending}
                destroyOnClose
            >
                <Typography.Paragraph type="secondary">{translate("pro_progress.note_help")}</Typography.Paragraph>
                <Select<ItemState>
                    value={itemState}
                    onChange={setItemState}
                    disabled={updateItem.isPending}
                    options={(["pending", "done", "failed", "not_applicable"] as ItemState[]).map((state) => ({ value: state, label: translate(`pro_progress.item_state.${state}`) }))}
                    style={{ width: "100%", marginBottom: 12 }}
                />
                <Input.TextArea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={translate("pro_progress.note_placeholder")}
                    maxLength={5000}
                    autoSize={{ minRows: 4, maxRows: 8 }}
                    disabled={updateItem.isPending}
                />
            </Modal>
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
