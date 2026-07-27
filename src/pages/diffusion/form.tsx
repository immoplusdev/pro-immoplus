import React, { useState, useRef } from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  InputNumber,
  DatePicker,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Upload,
  Button,
  Progress,
  Alert,
  message,
  FormProps,
  FormInstance,
} from "antd";
import type { UploadFile } from "antd";
import {
  PlusOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import {
  AD_PLACEMENTS,
  AD_ACTIONS,
  AD_CATEGORIES,
  AD_STATUSES,
  AD_TYPES,
  ENTITY_ID_ACTIONS,
  FILTERS_ACTIONS,
  AdAction,
} from "./types";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";

const { Text } = Typography;

// ─── VideoPreviewItem ──────────────────────────────────────────────────────────

interface VideoItemProps {
  file: UploadFile;
  progress: number | undefined;
  onRemove: () => void;
}

const VideoPreviewItem = ({ file, progress, onRemove }: VideoItemProps) => {
  const [src, setSrc] = React.useState<string | undefined>(file.url);

  React.useEffect(() => {
    if (!file.url && file.originFileObj) {
      const url = URL.createObjectURL(file.originFileObj as Blob);
      setSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file.originFileObj, file.url]);

  const isUploading = progress !== undefined && progress < 100;
  const isDone = progress === 100;
  const isError = file.status === "error";

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        border: "1px solid #e8e8e8",
        borderRadius: 8,
        marginBottom: 8,
        background: "#fafafa",
        alignItems: "flex-start",
      }}
    >
      {/* Player */}
      <div style={{ flexShrink: 0, borderRadius: 6, overflow: "hidden", background: "#000", width: 192, height: 108, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {src ? (
          <video src={src} width={192} height={108} controls style={{ display: "block", objectFit: "cover" }} />
        ) : (
          <PlayCircleOutlined style={{ fontSize: 36, color: "#555" }} />
        )}
      </div>

      {/* Info + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{ display: "block", fontWeight: 500, fontSize: 13, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={file.name}
        >
          {file.name}
        </Text>

        {isUploading && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <LoadingOutlined style={{ color: "#1677ff", fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>Envoi en cours…</Text>
            </div>
            <Progress percent={progress} size="small" status="active" />
          </div>
        )}

        {isDone && (
          <Space size={4}>
            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 12 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>Enregistré</Text>
          </Space>
        )}

        {isError && (
          <Space size={4}>
            <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: 12 }} />
            <Text type="danger" style={{ fontSize: 12 }}>Erreur lors de l'upload</Text>
          </Space>
        )}

        {progress === undefined && !isError && (
          <Text type="secondary" style={{ fontSize: 12 }}>En attente d'envoi</Text>
        )}
      </div>

      {/* Remove */}
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        size="small"
        onClick={onRemove}
        disabled={isUploading}
        style={{ flexShrink: 0, marginTop: 2 }}
      />
    </div>
  );
};

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

// ─── Form ──────────────────────────────────────────────────────────────────────

interface AdCampaignFormProps {
  formProps: FormProps;
  form: FormInstance;
}

export const AdCampaignForm = ({ formProps, form }: AdCampaignFormProps) => {
  const action: AdAction | undefined = Form.useWatch("action", form);
  const [uploading, setUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const showUrl = action === "OPEN_URL";
  const showEntityId = ENTITY_ID_ACTIONS.includes(action as AdAction);
  const showEntityIds = action === "OPEN_CATEGORY";
  const showFilters = FILTERS_ACTIONS.includes(action as AdAction);

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
        // Fichier existant (mode édition) — déjà dans /files, on passe l'URL
        results.push(f.url ?? f.uid);
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
      const imageFiles = normalizeFileList(mediaRaw.images);
      const videoFiles = normalizeFileList(mediaRaw.videos);

      // Upload images puis vidéos
      const [images, videos] = await Promise.all([
        resolveMedia(imageFiles),
        resolveMedia(videoFiles),
      ]);

      const payload = {
        ...values,
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
          entity_id: scopeRaw.entity_id ?? null,
          entity_ids: (scopeRaw.entity_ids ?? []).map(Number).filter((n) => !isNaN(n)),
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

  // Vidéos actuelles depuis le form
  const videos: UploadFile[] = normalizeFileList(form.getFieldValue(["media", "videos"]));

  return (
    <Form
      {...formProps}
      onFinish={handleFinish}
      layout="vertical"
      scrollToFirstError
    >
      {/* Section 1 — Paramètres généraux */}
      <Card title="Paramètres généraux" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
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

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: "Le type est requis" }]}
            >
              <Radio.Group>
                {AD_TYPES.map((t) => (
                  <Radio.Button key={t} value={t}>{t}</Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="status"
              label="Statut"
              rules={[{ required: true, message: "Le statut est requis" }]}
            >
              <Select
                options={AD_STATUSES.map((s) => ({ label: s, value: s }))}
                placeholder="Sélectionner un statut"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="priority" label="Priorité">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
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
                    const startDay = dayjs.isDayjs(start) ? start : dayjs(start);
                    const endDay = dayjs.isDayjs(value) ? value : dayjs(value);
                    if (endDay.isAfter(startDay)) return Promise.resolve();
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
      </Card>

      {/* Section 2 — Contenu */}
      <Card title="Contenu" style={{ marginBottom: 24 }}>
        <Form.Item
          name={["content", "title"]}
          label="Titre"
          rules={[
            { required: true, message: "Le titre est requis" },
            { max: 255, message: "255 caractères maximum" },
          ]}
        >
          <Input placeholder="Titre de la campagne" showCount maxLength={255} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name={["content", "subtitle"]} label="Sous-titre">
              <Input placeholder="Sous-titre (optionnel)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name={["content", "badge"]} label="Badge">
              <Input placeholder="-20%" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name={["content", "cta_label"]} label="Libellé CTA">
              <Input placeholder="En savoir plus" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section 3 — Médias */}
      <Card title="Médias" style={{ marginBottom: 24 }}>

        {uploadError && (
          <Alert
            type="error"
            message={uploadError}
            closable
            onClose={() => setUploadError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* ── Images ── */}
        <Form.Item
          name={["media", "images"]}
          label="Images"
          extra="Sélectionnez vos images. Elles seront enregistrées dans la table files à la soumission."
          getValueFromEvent={(e) => e.fileList}
          getValueProps={(value) => ({ fileList: normalizeFileList(value) })}
        >
          <Upload
            listType="picture-card"
            accept="image/*"
            multiple
            beforeUpload={beforeUploadImage}
            onPreview={(file) => {
              const url = file.url ?? file.thumbUrl;
              if (url) window.open(url, "_blank");
            }}
            disabled={uploading}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Ajouter</div>
            </div>
          </Upload>
        </Form.Item>

        {/* ── Vidéos ── */}
        <Form.Item
          name={["media", "videos"]}
          label="Vidéos"
          extra="Glissez-déposez vos vidéos. Elles seront enregistrées dans la table files à la soumission."
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) return e;
            return e?.fileList;
          }}
          valuePropName="fileList"
        >
          <Upload.Dragger
            name="video"
            multiple
            beforeUpload={beforeUploadVideo}
            accept="video/*,video/mp4"
            showUploadList={false}
            disabled={uploading}
            style={{ borderRadius: 8, padding: "20px 0" }}
          >
            <Space direction="vertical" align="center" size={4}>
              <CloudUploadOutlined style={{ fontSize: 40, color: "#1677ff" }} />
              <Text style={{ fontSize: 14, fontWeight: 600 }}>
                Glissez-déposez vos vidéos ici
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ou cliquez pour parcourir — MP4, MOV, AVI… (max 200 Mo)
              </Text>
            </Space>
          </Upload.Dragger>
        </Form.Item>

        {/* Liste des vidéos sélectionnées avec preview */}
        <Form.Item noStyle dependencies={[["media", "videos"]]}>
          {() => {
            const list: UploadFile[] = normalizeFileList(
              form.getFieldValue(["media", "videos"]),
            );
            if (!list.length) return null;
            return (
              <div style={{ marginTop: -8, marginBottom: 16 }}>
                {list.map((file) => (
                  <VideoPreviewItem
                    key={file.uid}
                    file={file}
                    progress={fileProgress[file.uid]}
                    onRemove={() => {
                      const current: UploadFile[] = normalizeFileList(
                        form.getFieldValue(["media", "videos"]),
                      );
                      form.setFieldValue(
                        ["media", "videos"],
                        current.filter((f) => f.uid !== file.uid),
                      );
                    }}
                  />
                ))}
              </div>
            );
          }}
        </Form.Item>

        {/* Progression globale pendant l'upload */}
        {uploading && (
          <Alert
            type="info"
            icon={<LoadingOutlined />}
            message="Envoi des médias en cours, veuillez patienter…"
            showIcon
          />
        )}
      </Card>

      {/* Section 4 — Action & Scope */}
      <Card title="Action & Scope">
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

        {showUrl && (
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "L'URL est requise pour cette action" },
              { type: "url", message: "URL invalide" },
            ]}
          >
            <Input placeholder="https://exemple.com" />
          </Form.Item>
        )}

        {showEntityId && (
          <Form.Item
            name={["scope", "entity_id"]}
            label="ID de l'entité"
            rules={[{ required: true, message: "L'ID de l'entité est requis pour cette action" }]}
          >
            <Input placeholder="Ex : 42" />
          </Form.Item>
        )}

        {showEntityIds && (
          <Form.Item
            name={["scope", "entity_ids"]}
            label="IDs des entités"
            extra="Saisissez des identifiants numériques et appuyez sur Entrée."
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            Aucun scope requis pour l'action sélectionnée.
          </Text>
        )}
      </Card>
    </Form>
  );
};
