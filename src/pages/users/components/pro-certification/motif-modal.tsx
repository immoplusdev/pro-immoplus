import React, { useState } from "react";
import { Modal, Input } from "antd";

interface Props {
    open: boolean;
    title: string;
    confirmLabel: string;
    danger?: boolean;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: (motif: string) => void;
}

export function MotifModal({ open, title, confirmLabel, danger, loading, onCancel, onConfirm }: Props) {
    const [motif, setMotif] = useState("");

    return (
        <Modal
            open={open}
            title={title}
            onCancel={onCancel}
            okText={confirmLabel}
            cancelText="Annuler"
            okButtonProps={{ danger, disabled: !motif.trim(), loading }}
            onOk={() => {
                onConfirm(motif.trim());
                setMotif("");
            }}
            afterClose={() => setMotif("")}
        >
            <Input.TextArea
                rows={3}
                placeholder="Motif (obligatoire)"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
            />
        </Modal>
    );
}
