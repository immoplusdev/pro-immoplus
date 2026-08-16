import React, { useState, useRef } from "react";
import {
  Form,
  Input,
  Select,
  Segmented,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Space,
  Typography,
  Upload,
  Button,
  Alert,
  message,
  FormProps,
  FormInstance,
} from "antd";
import type { UploadFile } from "antd";
import {
  PictureOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import {
  AD_PLACEMENTS,
  AD_ACTIONS,
  AD_CATEGORIES,
  ENTITY_ID_ACTIONS,
  FILTERS_ACTIONS,
  AdAction,
  AdType,
} from "./types";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { T, cardStyle, focusRingStyle } from "./tokens";
import { StatusBadgeSelect } from "./status-badge-select";
import { MediaDropzone } from "./media-dropzone";
import { AdCampaignPreview } from "./ad-campaign-preview";
import { FeedPickerModal, FeedVideoPick } from "./feed-picker-modal";
import { ResidencePickerModal, ResidencePick } from "./residence-picker-modal";

const { Text, Title } = Typography;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB

const beforeUploadImage = (file: File): boolean | string => {
  if (file.size > MAX_IMAGE_SIZE) {
    message.error(`"${file.name}" dépasse la limite de 10 Mo pour les images.`);
    return Upload.LIST_IGNORE;
  }
  return false; // false = ne pas uploader automatiquement
};

const beforeUploadVideo = (file: File): boolean | string => {
  if (file.size > MAX_VIDEO_SIZE) {
    message.error(`"${file.name}" dépasse la limite de 200 Mo pour les vidéos.`);
    return Upload.LIST_IGNORE;
  }
  return false;
};

const normalizeFileList = (value: unknown): UploadFile[] => {
  if (!value || !Array.isArray(value)) return [];
  return value.map((item, i) =>
    typeof item === "string"
      ? { uid: item || `existing-${i}`, name: `fichier-${i + 1}`, status: "done" as const, url: item }
      : (item as UploadFile),
  );
};

const TYPE_OPTIONS: { label: React.ReactNode; value: AdType }[] = [
  { value: "IMAGE", label: <Space size={6}><PictureOutlined /> Image</Space> },
  { value: "VIDEO", label: <Space size={6}><VideoCameraOutlined /> Vidéo</Space> },
  { value: "CAROUSEL", label: <Space size={6}><AppstoreOutlined /> Carrousel</Space> },
  { value: "VIDEO_CAROUSEL", label: <Space size={6}><AppstoreOutlined /> Carrousel vidéo</Space> },
];

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ ...cardStyle, padding: 24, marginBottom: 24 }}>
      <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.ink }}>{title}</Title>
      {description && (
        <Text style={{ display: "block", fontSize: 12, color: T.ink60, marginTop: 2, marginBottom: 16 }}>
          {description}
        </Text>
      )}
      {!description && <div style={{ marginTop: 16 }} />}
      {children}
    </div>
  );
}

function OptionalLabel({ children }: { children: React.ReactNode }) {
  return (
    <span>
      {children} <span style={{ color: T.ink60, fontWeight: 400 }}>(optionnel)</span>
    </span>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <Text style={{ display: "block", fontSize: 12, color: T.ink60, marginTop: 4 }}>{children}</Text>;
}

// ─── Form ──────────────────────────────────────────────────────────────────────

interface AdCampaignFormProps {
  formProps: FormProps;
  form: FormInstance;
  submitLabel?: string;
}

export const AdCampaignForm = ({ formProps, form, submitLabel = "Enregistrer" }: AdCampaignFormProps) => {
  const action: AdAction | undefined = Form.useWatch("action", form);
  const type: AdType = Form.useWatch("type", form) ?? "IMAGE";
  const status = Form.useWatch("status", form) ?? "DRAFT";
  const placement = Form.useWatch("placement", form);
  const category = Form.useWatch("campaign_category", form);
  const priority = Form.useWatch("priority", form);
  const positionIndex = Form.useWatch("position_index", form);
  const startDate: Dayjs | undefined = Form.useWatch("start_date", form);
  const endDate: Dayjs | undefined = Form.useWatch("end_date", form);
  const title = Form.useWatch(["content", "title"], form);
  const subtitle = Form.useWatch(["content", "subtitle"], form);
  const badge = Form.useWatch(["content", "badge"], form);
  const ctaLabel = Form.useWatch(["content", "cta_label"], form);
  const imagesRaw = Form.useWatch(["media", "images"], form);
  const videosRaw = Form.useWatch(["media", "videos"], form);

  const [uploading, setUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [feedPickerOpen, setFeedPickerOpen] = useState(false);
  const [residencePickerOpen, setResidencePickerOpen] = useState(false);
  const submittingRef = useRef(false);

  const showUrl = action === "OPEN_URL";
  const showFeedPickerSingle = type === "VIDEO" && action === "OPEN_INTERNAL_PAGE";
  const showFeedPickerMulti = type === "VIDEO_CAROUSEL" && action === "OPEN_INTERNAL_PAGE";
  const showFeedPicker = showFeedPickerSingle || showFeedPickerMulti;
  const showResidencePicker =
    type === "CAROUSEL" && (action === "OPEN_INTERNAL_PAGE" || action === "OPEN_RESIDENCE");
  const showEntityId =
    (ENTITY_ID_ACTIONS.includes(action as AdAction) && !showResidencePicker) || showFeedPickerSingle;
  const showEntityIds = action === "OPEN_CATEGORY" || showFeedPickerMulti || showResidencePicker;
  const showFilters = FILTERS_ACTIONS.includes(action as AdAction);

  // Ajoute des ids à scope.entity_ids sans doublon.
  const mergeEntityIds = (newIds: string[]) => {
    const currentEntityIds: unknown[] = form.getFieldValue(["scope", "entity_ids"]) ?? [];
    const merged = Array.from(new Set([...currentEntityIds.map(String), ...newIds]));
    form.setFieldValue(["scope", "entity_ids"], merged);
  };

  // Fusionne la/les vidéo(s) choisie(s) dans le flux : leur URL rejoint media.videos
  // (sans passer par /files). Type VIDEO → une seule vidéo, scope.entity_id (singulier).
  // Type VIDEO_CAROUSEL → plusieurs vidéos, scope.entity_ids (pluriel, cumulatif).
  const handleFeedVideosPicked = (picked: FeedVideoPick[]) => {
    setFeedPickerOpen(false);
    if (picked.length === 0) return;

    const toEntry = (item: FeedVideoPick): UploadFile => ({
      uid: item.videoUrl,
      name: item.title || "video-feed",
      status: "done",
      url: item.videoUrl,
    });

    if (showFeedPickerSingle) {
      const [single] = picked;
      form.setFieldValue(["media", "videos"], [toEntry(single)]);
      form.setFieldValue(["scope", "entity_id"], single.id);
    } else {
      const currentVideos = normalizeFileList(form.getFieldValue(["media", "videos"]));
      const existingUrls = new Set(currentVideos.map((f) => f.url).filter(Boolean));
      const newVideoEntries = picked.filter((item) => !existingUrls.has(item.videoUrl)).map(toEntry);
      form.setFieldValue(["media", "videos"], [...currentVideos, ...newVideoEntries]);
      mergeEntityIds(picked.map((item) => item.id));
    }

    message.success(`${picked.length} vidéo(s) ajoutée(s) depuis le flux.`);
  };

  // Fusionne les résidences choisies : leur image (miniature) rejoint media.images
  // (sans passer par /files) et leur id rejoint scope.entity_ids.
  const handleResidencesPicked = (picked: ResidencePick[]) => {
    setResidencePickerOpen(false);
    if (picked.length === 0) return;

    const currentImages = normalizeFileList(form.getFieldValue(["media", "images"]));
    const existingIds = new Set(currentImages.map((f) => f.uid).filter(Boolean));
    const newImageEntries: UploadFile[] = picked
      .filter((item) => item.imageId && !existingIds.has(item.imageId))
      .map((item) => ({
        uid: item.imageId as string, // valeur soumise (id du fichier)
        name: item.nom || "residence",
        status: "done",
        url: item.imageUrl ?? undefined, // aperçu uniquement
      }));
    form.setFieldValue(["media", "images"], [...currentImages, ...newImageEntries]);
    mergeEntityIds(picked.map((item) => item.id));

    message.success(`${picked.length} résidence(s) ajoutée(s).`);
  };

  const imageFiles = normalizeFileList(imagesRaw);
  const videoFiles = normalizeFileList(videosRaw);
  const titleLength = (title ?? "").length;
  const titleCounterColor = titleLength > 255 ? T.error : titleLength >= 230 ? T.warningDark : T.ink60;

  const startDay = startDate ? (dayjs.isDayjs(startDate) ? startDate : dayjs(startDate)) : undefined;
  const endDay = endDate ? (dayjs.isDayjs(endDate) ? endDate : dayjs(endDate)) : undefined;

  // Uploade un fichier vers /files avec suivi de progression
  const uploadToFiles = async (file: File, uid: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(`${API_URL}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (evt.total) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setFileProgress((prev) => ({ ...prev, [uid]: Math.min(pct, 95) }));
        }
      },
    });
    setFileProgress((prev) => ({ ...prev, [uid]: 100 }));
    return (response.data?.data?.id as string) ?? null;
  };

  // Uploads tous les fichiers nouveaux d'une liste, retourne les IDs + URLs existantes
  const resolveMedia = async (fileList: UploadFile[]): Promise<string[]> => {
    const results: string[] = [];
    for (const f of fileList) {
      if (f.status === "done" && !f.originFileObj) {
        // Fichier existant — on renvoie l'id (uid porte l'id réel, url ne sert qu'à l'aperçu)
        results.push(f.uid ?? f.url);
      } else if (f.originFileObj) {
        // Nouveau fichier — upload vers /files
        const id = await uploadToFiles(f.originFileObj as File, f.uid);
        if (id) results.push(id);
      }
    }
    return results;
  };

  const handleFinish = async (values: Record<string, unknown>) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setUploading(true);
    setUploadError(null);
    setFileProgress({});

    try {
      const scopeRaw = (values.scope ?? {}) as {
        entity_id?: string | number | null;
        entity_ids?: (string | number)[];
        filters?: unknown;
      };

      const filtersRaw = scopeRaw.filters;
      let filters: Record<string, unknown> = {};
      if (typeof filtersRaw === "string") {
        try { filters = JSON.parse(filtersRaw); } catch { filters = {}; }
      } else if (filtersRaw && typeof filtersRaw === "object") {
        filters = filtersRaw as Record<string, unknown>;
      }

      const mediaRaw = (values.media ?? {}) as { images?: unknown; videos?: unknown };
      const imgFiles = normalizeFileList(mediaRaw.images);
      const vidFiles = normalizeFileList(mediaRaw.videos);

      // Upload images puis vidéos
      const [images, videos] = await Promise.all([
        resolveMedia(imgFiles),
        resolveMedia(vidFiles),
      ]);

      const payload = {
        ...values,
        url: (values.url as string | undefined) ?? "",
        start_date: values.start_date
          ? dayjs.isDayjs(values.start_date)
            ? (values.start_date as Dayjs).toISOString()
            : values.start_date
          : undefined,
        end_date: values.end_date
          ? dayjs.isDayjs(values.end_date)
            ? (values.end_date as Dayjs).toISOString()
            : values.end_date
          : undefined,
        scope: {
          entity_id:
            scopeRaw.entity_id !== null && scopeRaw.entity_id !== undefined && String(scopeRaw.entity_id).trim() !== ""
              ? String(scopeRaw.entity_id).trim()
              : null,
          entity_ids: (scopeRaw.entity_ids ?? [])
            .map((v) => String(v).trim())
            .filter((v) => v !== ""),
          filters,
        },
        media: { images, videos },
      };

      await formProps.onFinish?.(payload);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setUploadError(msg ?? "Erreur lors de l'envoi des médias.");
    } finally {
      setUploading(false);
      submittingRef.current = false;
    }
  };

  const showImages = type === "IMAGE" || type === "CAROUSEL";
  const showVideos = type === "VIDEO" || type === "VIDEO_CAROUSEL";

  return (
    <div className="campagne-form">
      <style>{focusRingStyle}</style>
      <style>{`
        @media (max-width: 1024px) {
          .campagne-columns { flex-direction: column; }
          .campagne-preview-col { position: static !important; width: 100% !important; order: -1; }
        }
      `}</style>

      <Form
        {...formProps}
        onFinish={handleFinish}
        layout="vertical"
        scrollToFirstError
      >
        <div className="campagne-columns" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 600px", minWidth: 0 }}>
            {/* Section 1 — Paramètres généraux */}
            <SectionCard title="Paramètres généraux" description="Où et quand cette campagne apparaît">
              <Row gutter={20}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="placement"
                    label="Placement"
                    rules={[{ required: true, message: "Le placement est requis" }]}
                  >
                    <Select
                      showSearch
                      options={AD_PLACEMENTS.map((p) => ({ label: p, value: p }))}
                      placeholder="Sélectionner un placement"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="campaign_category"
                    label="Catégorie"
                    rules={[{ required: true, message: "La catégorie est requise" }]}
                  >
                    <Select
                      options={AD_CATEGORIES.map((c) => ({ label: c, value: c }))}
                      placeholder="Sélectionner une catégorie"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={20} align="top">
                <Col xs={24} md={12}>
                  <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Le type est requis" }]}
                  >
                    <Segmented options={TYPE_OPTIONS} block />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="status"
                    label="Statut"
                    rules={[{ required: true, message: "Le statut est requis" }]}
                  >
                    <StatusBadgeSelect />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={20}>
                <Col xs={24} md={12}>
                  <Form.Item name="priority" label={<OptionalLabel>Priorité</OptionalLabel>}>
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                  <FieldHint>Plus la valeur est élevée, plus la bannière apparaît en premier.</FieldHint>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="position_index"
                    label="Position"
                    initialValue={0}
                    rules={[{ required: true, message: "La position est requise" }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
                  </Form.Item>
                  <FieldHint>Ordre d'affichage parmi les autres bannières du même placement.</FieldHint>
                </Col>
              </Row>

              <Row gutter={20} style={{ marginTop: 20 }}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="start_date"
                    label="Date de début"
                    rules={[{ required: true, message: "La date de début est requise" }]}
                    getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Sélectionner une date" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="end_date"
                    label="Date de fin"
                    dependencies={["start_date"]}
                    rules={[
                      { required: true, message: "La date de fin est requise" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const start = getFieldValue("start_date");
                          if (!value || !start) return Promise.resolve();
                          const sd = dayjs.isDayjs(start) ? start : dayjs(start);
                          const ed = dayjs.isDayjs(value) ? value : dayjs(value);
                          if (ed.isAfter(sd)) return Promise.resolve();
                          return Promise.reject(new Error("La date de fin doit être postérieure à la date de début"));
                        },
                      }),
                    ]}
                    getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
                  >
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Sélectionner une date" />
                  </Form.Item>
                </Col>
              </Row>
              {startDay && endDay && (
                <FieldHint>
                  {endDay.isAfter(startDay) ? (
                    <span>
                      Cette campagne sera visible du {startDay.format("DD MMMM")} au {endDay.format("DD MMMM YYYY")}
                      {" "}({endDay.diff(startDay, "day")} jour{endDay.diff(startDay, "day") > 1 ? "s" : ""}).
                    </span>
                  ) : (
                    <span style={{ color: T.error }}>La date de fin doit être postérieure à la date de début.</span>
                  )}
                </FieldHint>
              )}
            </SectionCard>

            {/* Section 2 — Contenu */}
            <SectionCard title="Contenu" description="Ce que verra l'utilisateur sur la bannière">
              <Form.Item
                name={["content", "title"]}
                label="Titre"
                rules={[
                  { required: true, message: "Le titre est requis" },
                  { max: 255, message: "255 caractères maximum" },
                ]}
              >
                <Input placeholder="Titre de la campagne" maxLength={255} />
              </Form.Item>
              <Text style={{ display: "block", fontSize: 12, color: titleCounterColor, marginTop: -12, marginBottom: 16 }}>
                {titleLength}/255
              </Text>

              <Form.Item name={["content", "subtitle"]} label={<OptionalLabel>Sous-titre</OptionalLabel>}>
                <Input placeholder="Sous-titre" />
              </Form.Item>

              <div style={{ background: T.surfaceMuted, borderRadius: 8, padding: 16, marginTop: 4 }}>
                <Text style={{ display: "block", fontSize: 12, color: T.ink60, marginBottom: 12 }}>
                  Éléments additionnels — n'apparaissent que sur certains placements
                </Text>
                <Row gutter={20}>
                  <Col xs={24} md={12}>
                    <Form.Item name={["content", "badge"]} label={<OptionalLabel>Badge</OptionalLabel>} style={{ marginBottom: 0 }}>
                      <Input placeholder="-20%" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={["content", "cta_label"]} label={<OptionalLabel>Libellé CTA</OptionalLabel>} style={{ marginBottom: 0 }}>
                      <Input placeholder="En savoir plus" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </SectionCard>

            {/* Section 3 — Médias */}
            <SectionCard title="Médias" description="Visuels affichés dans la bannière">
              {uploadError && (
                <Alert
                  type="error"
                  message={uploadError}
                  closable
                  onClose={() => setUploadError(null)}
                  style={{ marginBottom: 16 }}
                />
              )}

              {showImages && (
                <Form.Item
                  name={["media", "images"]}
                  getValueFromEvent={(files) => files}
                  getValueProps={(value) => ({ value: normalizeFileList(value) })}
                  style={{ marginBottom: 0 }}
                >
                  <MediaDropzone
                    label="Images"
                    hint="PNG, JPG — max 10 Mo"
                    accept="image/*"
                    kind="image"
                    beforeUpload={beforeUploadImage}
                    disabled={uploading}
                    onPreview={(file) => {
                      const url = file.url ?? file.thumbUrl;
                      if (url) window.open(url, "_blank");
                    }}
                  />
                </Form.Item>
              )}

              {type === "CAROUSEL" && (
                <FieldHint>
                  {imageFiles.length < 2
                    ? `Ajoutez au moins 2 visuels pour le carrousel (${imageFiles.length}/2).`
                    : `${imageFiles.length} visuels ajoutés.`}
                </FieldHint>
              )}

              {showVideos && (
                <Form.Item
                  name={["media", "videos"]}
                  getValueFromEvent={(files) => files}
                  getValueProps={(value) => ({ value: normalizeFileList(value) })}
                  style={{ marginBottom: 0, marginTop: showImages ? 20 : 0 }}
                >
                  <MediaDropzone
                    label="Vidéos"
                    hint="MP4, MOV, AVI — max 200 Mo"
                    accept="video/*,video/mp4"
                    kind="video"
                    beforeUpload={beforeUploadVideo}
                    disabled={uploading}
                  />
                </Form.Item>
              )}

              {type === "VIDEO_CAROUSEL" && (
                <FieldHint>
                  {videoFiles.length < 2
                    ? `Ajoutez au moins 2 vidéos pour le carrousel vidéo (${videoFiles.length}/2).`
                    : `${videoFiles.length} vidéos ajoutées.`}
                </FieldHint>
              )}

              {uploading && (
                <Alert
                  type="info"
                  message="Envoi des médias en cours, veuillez patienter…"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </SectionCard>

            {/* Section 4 — Action & Scope */}
            <SectionCard title="Action & Scope" description="Ce qui se passe lorsqu'on clique sur la bannière">
              <Form.Item
                name="action"
                label="Action"
                rules={[{ required: true, message: "L'action est requise" }]}
              >
                <Select
                  options={AD_ACTIONS.map((a) => ({ label: a, value: a }))}
                  placeholder="Sélectionner une action"
                />
              </Form.Item>

              {(!action || action === "NONE") && (
                <FieldHint>La bannière n'est pas cliquable.</FieldHint>
              )}

              <Form.Item
                name="url"
                label={showUrl ? "URL" : <OptionalLabel>URL</OptionalLabel>}
                rules={showUrl ? [{ required: true, message: "L'URL est requise pour cette action" }] : []}
              >
                <Input placeholder="https://exemple.com ou /vivre" />
              </Form.Item>

              {showEntityId && (
                <Form.Item
                  name={["scope", "entity_id"]}
                  label={showFeedPickerSingle ? "Vidéo sélectionnée (ID)" : "ID de l'entité"}
                  rules={[{ required: true, message: "L'ID de l'entité est requis pour cette action" }]}
                  extra={
                    showFeedPickerSingle
                      ? "Rempli via le bouton \"Choisir une vidéo depuis le flux\" ci-dessous — modifiable manuellement."
                      : undefined
                  }
                >
                  <Input placeholder="Ex : 42" />
                </Form.Item>
              )}

              {showFeedPicker && (
                <div style={{ marginBottom: 16 }}>
                  <Button icon={<FolderOpenOutlined />} onClick={() => setFeedPickerOpen(true)}>
                    {showFeedPickerSingle ? "Choisir une vidéo depuis le flux" : "Choisir des vidéos depuis le flux"}
                  </Button>
                  <FieldHint>
                    {showFeedPickerSingle
                      ? <>Sélectionne une vidéo déjà publiée — son URL rejoint <code>media.videos</code> et son id remplace <code>scope.entity_id</code>, sans re-upload.</>
                      : <>Sélectionne des vidéos déjà publiées — leur URL rejoint les médias du carrousel et leur id est ajouté à <code>scope.entity_ids</code>, sans re-upload.</>}
                  </FieldHint>
                </div>
              )}

              {showResidencePicker && (
                <div style={{ marginBottom: 16 }}>
                  <Button icon={<FolderOpenOutlined />} onClick={() => setResidencePickerOpen(true)}>
                    Choisir des résidences
                  </Button>
                  <FieldHint>
                    Sélectionne des résidences — l'id de leur première image rejoint <code>media.images</code>
                    et leur id est ajouté à <code>scope.entity_ids</code>, sans re-upload.
                  </FieldHint>
                </div>
              )}

              {showEntityIds && (
                <Form.Item
                  name={["scope", "entity_ids"]}
                  label={
                    showFeedPickerMulti
                      ? "Vidéos sélectionnées (IDs)"
                      : showResidencePicker
                        ? "Résidences sélectionnées (IDs)"
                        : "IDs des entités"
                  }
                  extra={
                    showFeedPickerMulti
                      ? "Rempli via le bouton \"Choisir des vidéos depuis le flux\" ci-dessus — modifiable manuellement."
                      : showResidencePicker
                        ? "Rempli via le bouton \"Choisir des résidences\" ci-dessus — modifiable manuellement."
                        : "Saisissez des identifiants numériques et appuyez sur Entrée."
                  }
                >
                  <Select
                    mode="tags"
                    tokenSeparators={[","]}
                    placeholder="Ex : 1, 2, 3"
                    style={{ width: "100%" }}
                    open={false}
                  />
                </Form.Item>
              )}

              {showFilters && (
                <Form.Item
                  name={["scope", "filters"]}
                  label="Filtres (JSON)"
                  getValueProps={(value) => ({
                    value:
                      value && typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : (value as string) ?? "",
                  })}
                  getValueFromEvent={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    try { return JSON.parse(e.target.value); }
                    catch { return e.target.value; }
                  }}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder='{"key": "value"}'
                    style={{ fontFamily: "monospace" }}
                  />
                </Form.Item>
              )}

              {!showEntityId && !showEntityIds && !showFilters && action && action !== "NONE" && action !== "OPEN_URL" && (
                <FieldHint>Aucun scope requis pour l'action sélectionnée.</FieldHint>
              )}
            </SectionCard>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={uploading}
              style={{ background: T.primary, borderColor: T.primary, height: 48, fontWeight: 600 }}
            >
              {submitLabel}
            </Button>
          </div>

          <div className="campagne-preview-col" style={{ flex: "0 1 340px", minWidth: 280 }}>
            <AdCampaignPreview
              type={type}
              status={status}
              placement={placement}
              category={category}
              title={title}
              subtitle={subtitle}
              badge={badge}
              ctaLabel={ctaLabel}
              imageFiles={imageFiles}
              videoFiles={videoFiles}
              startDate={startDay}
              endDate={endDay}
              priority={priority}
              positionIndex={positionIndex}
            />
          </div>
        </div>
      </Form>

      <FeedPickerModal
        open={feedPickerOpen}
        onClose={() => setFeedPickerOpen(false)}
        onConfirm={handleFeedVideosPicked}
        multiple={!showFeedPickerSingle}
      />

      <ResidencePickerModal
        open={residencePickerOpen}
        onClose={() => setResidencePickerOpen(false)}
        onConfirm={handleResidencesPicked}
      />
    </div>
  );
};
