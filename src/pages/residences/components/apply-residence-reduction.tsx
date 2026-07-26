import React, { useState } from "react";
import { Button, Card, InputNumber, Select, Space, Typography, message } from "antd";
import { useSelect } from "@refinedev/antd";
import { useApiUrl, useCustomMutation, useInvalidate } from "@refinedev/core";

interface ResidenceOption {
    id: string;
    nom: string;
}

export function ApplyResidenceReduction() {
    const apiUrl = useApiUrl();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [reduction, setReduction] = useState<number | null>(null);
    const { mutateAsync, isLoading } = useCustomMutation();
    const invalidate = useInvalidate();

    const { selectProps, query } = useSelect<ResidenceOption>({
        resource: "residences",
        optionLabel: "nom",
        optionValue: "id",
        onSearch: (value) => [{ field: "q", operator: "contains", value }],
        pagination: { mode: "server", pageSize: 20 },
    });

    const handleApply = async () => {
        if (!selectedIds.length || reduction == null) return;

        let success = 0;
        let failed = 0;

        for (const id of selectedIds) {
            try {
                await mutateAsync({
                    url: `${apiUrl}/residences/${id}/reduction`,
                    method: "post",
                    values: { reduction },
                });
                success++;
            } catch {
                failed++;
            }
        }

        if (success) {
            message.success(`Réduction appliquée à ${success} résidence(s)`);
            invalidate({ resource: "residences", invalidates: ["list"] });
        }
        if (failed) message.error(`Échec pour ${failed} résidence(s)`);

        setSelectedIds([]);
        setReduction(null);
    };

    return (
        <Card title="Appliquer une réduction" style={{ marginBottom: 16 }}>
            <Typography.Paragraph type="secondary">
                Recherchez une ou plusieurs résidences par leur nom, sélectionnez-les puis appliquez une réduction en pourcentage.
            </Typography.Paragraph>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Select
                    options={selectProps.options}
                    onSearch={selectProps.onSearch}
                    filterOption={false}
                    loading={query.isFetching}
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Rechercher une résidence par nom..."
                    value={selectedIds}
                    onChange={(vals) => setSelectedIds(vals as string[])}
                />
                <Space>
                    <InputNumber
                        min={0}
                        max={100}
                        addonAfter="%"
                        placeholder="Réduction"
                        value={reduction ?? undefined}
                        onChange={(val) => setReduction(val)}
                    />
                    <Button
                        type="primary"
                        disabled={!selectedIds.length || reduction == null}
                        loading={isLoading}
                        onClick={handleApply}
                    >
                        Appliquer la réduction ({selectedIds.length})
                    </Button>
                </Space>
            </Space>
        </Card>
    );
}
