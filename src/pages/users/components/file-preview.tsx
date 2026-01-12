import React, { useState } from "react";
import { Button, Modal } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import FilePreview from "reactjs-file-preview";

interface FilePreviewModalProps {
  fileId: string;
  fileUrl: string;
  label?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  fileId,
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
      <Button type="link" icon={<EyeOutlined />} onClick={showModal}>
        {label}
      </Button>
      <Modal
        title="Aperçu du document"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ height: "calc(100vh - 200px)", overflow: "auto" }}
      >
        <FilePreview
          url={fileUrl}
          onError={(error) => {
            console.error("Erreur de prévisualisation:", error);
          }}
        />
      </Modal>
    </>
  );
};
