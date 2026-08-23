import React from "react";
import { Upload, Typography, Button } from "antd";
import { CloudUploadOutlined, DeleteOutlined, PlayCircleOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { T } from "./tokens";

const { Text } = Typography;

interface Props {
    label: string;
    hint: string;
    accept: string;
    kind: "image" | "video";
    value?: UploadFile[];
    beforeUpload: UploadProps["beforeUpload"];
    onChange?: (fileList: UploadFile[]) => void;
    onPreview?: (file: UploadFile) => void;
    disabled?: boolean;
}

export function MediaDropzone({ label, hint, accept, kind, value, beforeUpload, onChange, onPreview, disabled }: Props) {
    const fileList = value ?? [];
    return (
        <div>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500, color: T.ink, marginBottom: 8 }}>
                {label}
            </Text>
            <Upload.Dragger
                multiple
                accept={accept}
                beforeUpload={beforeUpload}
                showUploadList={false}
                disabled={disabled}
                fileList={fileList}
                onChange={(info) => onChange?.(info.fileList)}
                style={{
                    borderRadius: 8,
                    padding: "24px 0",
                    border: `1px dashed ${T.ink12}`,
                    background: T.surfaceMuted,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <CloudUploadOutlined style={{ fontSize: 32, color: T.primary }} />
                    <Text style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                        Glissez-déposez {label.toLowerCase()} ici
                    </Text>
                    <Text style={{ fontSize: 12, color: T.ink60 }}>ou cliquez pour parcourir — {hint}</Text>
                </div>
            </Upload.Dragger>

            {fileList.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                    {fileList.map((file) => (
                        <MediaThumb
                            key={file.uid}
                            file={file}
                            kind={kind}
                            onRemove={() => onChange?.(fileList.filter((f) => f.uid !== file.uid))}
                            onPreview={onPreview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function MediaThumb({
    file,
    kind,
    onRemove,
    onPreview,
}: {
    file: UploadFile;
    kind: "image" | "video";
    onRemove: () => void;
    onPreview?: (file: UploadFile) => void;
}) {
    const [src, setSrc] = React.useState<string | undefined>(file.url);

    React.useEffect(() => {
        if (!file.url && file.originFileObj) {
            const url = URL.createObjectURL(file.originFileObj as Blob);
            setSrc(url);
            return () => URL.revokeObjectURL(url);
        }
        setSrc(file.url);
    }, [file]);

    return (
        <div
            style={{
                position: "relative",
                width: 96,
                height: 96,
                borderRadius: 8,
                overflow: "hidden",
                border: `1px solid ${T.ink12}`,
                background: "#000",
                cursor: onPreview ? "pointer" : "default",
            }}
            onClick={() => onPreview?.(file)}
        >
            {kind === "image" && src && (
                <img src={src} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {kind === "video" && (
                src ? (
                    <video src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PlayCircleOutlined style={{ color: "#FFFFFF", fontSize: 22 }} />
                    </div>
                )
            )}
            <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined style={{ color: "#FFFFFF" }} />}
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.45)" }}
            />
        </div>
    );
}
