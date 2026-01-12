import React, { useState } from "react";
import { Modal } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import FilePreview from "reactjs-file-preview";

interface FilePreviewModalProps {
  fileUrl: string;
  label?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  fileUrl,
  label = "Voir le document",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
        footer={null}
        width="80%"
        style={{ top: 20 }}
        styles={{ body: { height: "calc(100vh - 200px)", overflow: "auto" } }}
      >
        <FilePreview preview={fileUrl} />
      </Modal>
    </>
  );
};
