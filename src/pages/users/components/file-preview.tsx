import React, { useState } from "react";
import { Modal, Image, Button, Space } from "antd";
import { EyeOutlined, DownloadOutlined } from "@ant-design/icons";

interface FilePreviewModalProps {
  fileUrl: string;
  label?: string;
}

const getFileExtension = (url: string): string => {
  const pathname = url.split("?")[0];
  const extension = pathname.split(".").pop()?.toLowerCase() || "";
  return extension;
};

const isImageFile = (url: string): boolean => {
  const extension = getFileExtension(url);
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  return imageExtensions.includes(extension) || url.includes("/files/raw/");
};

const isPdfFile = (url: string): boolean => {
  const extension = getFileExtension(url);
  return extension === "pdf";
};

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  fileUrl,
  label = "Voir le document",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
    setImageError(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  const renderPreview = () => {
    if (isPdfFile(fileUrl)) {
      return (
        <iframe
          src={fileUrl}
          style={{ width: "100%", height: "calc(100vh - 250px)", border: "none" }}
          title="PDF Preview"
        />
      );
    }

    if (isImageFile(fileUrl) && !imageError) {
      return (
        <div style={{ textAlign: "center" }}>
          <Image
            src={fileUrl}
            alt="Document preview"
            style={{ maxWidth: "100%", maxHeight: "calc(100vh - 300px)" }}
            onError={() => setImageError(true)}
            preview={false}
          />
        </div>
      );
    }

    // Fallback: show download option
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ marginBottom: "20px" }}>
          Impossible d'afficher l'aperçu de ce fichier.
        </p>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
          Télécharger le fichier
        </Button>
      </div>
    );
  };

  return (
    <>
      <span
        onClick={showModal}
        style={{
          cursor: "pointer",
          color: "#1890ff",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <EyeOutlined />
        {label}
      </span>
      <Modal
        title="Aperçu du document"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              Télécharger
            </Button>
            <Button onClick={handleCancel}>Fermer</Button>
          </Space>
        }
        width="80%"
        style={{ top: 20 }}
        styles={{ body: { height: "calc(100vh - 200px)", overflow: "auto" } }}
      >
        {renderPreview()}
      </Modal>
    </>
  );
};
