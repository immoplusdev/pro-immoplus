import { Form, Input, InputNumber, Switch, Radio, Row, Col, Select, Card, Space, Typography, Divider, Segmented } from "antd";
import { ColorPicker } from "antd";
import {
    PlusCircleOutlined,
    CheckSquareOutlined,
    BellOutlined,
    HomeOutlined,
    StarOutlined,
    SoundOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
    MobileOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { BannerPreview } from "./banner-preview";

const { Text } = Typography;

const ICON_OPTIONS = [
    { value: "plus-circle", label: "Ajouter", icon: <PlusCircleOutlined /> },
    { value: "calendar-check", label: "Calendrier validé", icon: <CheckSquareOutlined /> },
    { value: "bell", label: "Cloche", icon: <BellOutlined /> },
    { value: "home", label: "Maison", icon: <HomeOutlined /> },
    { value: "star", label: "Étoile", icon: <StarOutlined /> },
    { value: "megaphone", label: "Annonce", icon: <SoundOutlined /> },
    { value: "credit-card", label: "Paiement", icon: <CreditCardOutlined /> },
    { value: "check-circle", label: "Succès", icon: <CheckCircleOutlined /> },
];

const PRESET_COLORS = ["#5B3FE4", "#1A5CFF", "#00B37E", "#FF4E4E", "#FF8C00"];

export const BannerFormFields = ({ form }: { form: any }) => {
    const [previewAudience, setPreviewAudience] = useState<string>("buyer");

    const title = Form.useWatch("title", form);
    const subtitle = Form.useWatch("subtitle", form);
    const ctaLabel = Form.useWatch("cta_label", form);
    const cta2Label = Form.useWatch("cta2_label", form);
    const icon = Form.useWatch("icon", form);
    const bgColor = Form.useWatch("bg_color", form);
    const dismissible = Form.useWatch("dismissible", form);

    return (
        <Row gutter={32}>
            {/* ── Formulaire ── */}
            <Col xs={24} lg={14}>
                {/* Contenu */}
                <Card size="small" title="Contenu" style={{ marginBottom: 16 }}>
                    <Form.Item
                        name="title"
                        label="Titre"
                        rules={[{ required: true, message: "Le titre est obligatoire" }, { max: 255 }]}
                    >
                        <Input
                            showCount
                            maxLength={255}
                            placeholder="Ex: Publiez vos biens facilement"
                        />
                    </Form.Item>
                    <Form.Item name="subtitle" label="Sous-titre" rules={[{ max: 500 }]}>
                        <Input.TextArea
                            showCount
                            maxLength={500}
                            rows={2}
                            placeholder="Description courte…"
                        />
                    </Form.Item>
                </Card>

                {/* CTA principal */}
                <Card size="small" title="Bouton principal (CTA)" style={{ marginBottom: 16 }}>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="cta_label" label="Label">
                                <Input placeholder="Démarrer" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="cta_url" label="URL">
                                <Input placeholder="/publisher/new" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* CTA secondaire */}
                <Card size="small" title="Bouton secondaire (optionnel)" style={{ marginBottom: 16 }}>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="cta2_label" label="Label">
                                <Input placeholder="En savoir plus" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="cta2_url" label="URL">
                                <Input placeholder="/help" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Apparence */}
                <Card size="small" title="Apparence" style={{ marginBottom: 16 }}>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="icon" label="Icône">
                                <Select placeholder="Choisir une icône">
                                    {ICON_OPTIONS.map((o) => (
                                        <Select.Option key={o.value} value={o.value}>
                                            <Space>
                                                {o.icon}
                                                {o.label}
                                            </Space>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="bg_color"
                                label="Couleur de fond"
                                rules={[
                                    {
                                        pattern: /^#[0-9A-Fa-f]{6}$/,
                                        message: "Hex invalide (#RRGGBB)",
                                    },
                                ]}
                                getValueFromEvent={(color) =>
                                    typeof color === "string" ? color : color?.toHexString?.() ?? color
                                }
                                getValueProps={(value) => ({
                                    value: typeof value === "string" ? value : value,
                                })}
                            >
                                <ColorPicker
                                    format="hex"
                                    showText
                                    presets={[{ label: "ImmoPlus", colors: PRESET_COLORS }]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Ciblage */}
                <Card size="small" title="Ciblage" style={{ marginBottom: 16 }}>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="audience" label="Audience">
                                <Radio.Group>
                                    <Space direction="vertical">
                                        <Radio value="buyer">👤 App Client</Radio>
                                        <Radio value="seller">🏢 App Pro</Radio>
                                        <Radio value="all">🌐 Les deux</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="type" label="Type">
                                <Radio.Group>
                                    <Space direction="vertical">
                                        <Radio value="promo">Promotionnel</Radio>
                                        <Radio value="notification">Notification</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Paramètres */}
                <Card size="small" title="Paramètres" style={{ marginBottom: 16 }}>
                    <Row gutter={12}>
                        <Col span={8}>
                            <Form.Item
                                name="order"
                                label="Ordre d'affichage"
                                rules={[{ type: "number", min: 0, message: "≥ 0" }]}
                            >
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dismissible" label="Peut être fermée" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="active" label="Statut" valuePropName="checked">
                                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Col>

            {/* ── Prévisualisation live ── */}
            <Col xs={24} lg={10}>
                <div style={{ position: "sticky", top: 24 }}>
                    <Card
                        size="small"
                        title="Prévisualisation live"
                        extra={
                            <Segmented
                                size="small"
                                value={previewAudience}
                                onChange={(v) => setPreviewAudience(v as string)}
                                options={[
                                    { label: <><MobileOutlined /> Client</>, value: "buyer" },
                                    { label: <><ShopOutlined /> Pro</>, value: "seller" },
                                ]}
                            />
                        }
                    >
                        <BannerPreview
                            title={title}
                            subtitle={subtitle}
                            cta_label={ctaLabel}
                            cta2_label={cta2Label}
                            icon={icon}
                            bg_color={typeof bgColor === "string" ? bgColor : bgColor?.toHexString?.() ?? "#5B3FE4"}
                            dismissible={dismissible}
                        />
                        <Divider style={{ margin: "16px 0 8px" }} />
                        <Space direction="vertical" size={4} style={{ width: "100%" }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                <strong>Audience :</strong>{" "}
                                {previewAudience === "buyer" ? "👤 App Client" : "🏢 App Pro"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Rendu approximatif — les styles peuvent légèrement différer dans l'app.
                            </Text>
                        </Space>
                    </Card>
                </div>
            </Col>
        </Row>
    );
};
