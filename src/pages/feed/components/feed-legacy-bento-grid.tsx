import React from "react";
import { BaseRecord } from "@refinedev/core";
import { Empty, Spin } from "antd";
import { FeedLegacyBentoCard } from "./feed-legacy-bento-card";

type Props = {
    dataSource?: readonly BaseRecord[];
    loading?: boolean;
    onDelete: (id: string) => void;
    onMigrate: (id: string) => void;
    migratingId?: string | null;
};

export function FeedLegacyBentoGrid({ dataSource = [], loading, onDelete, onMigrate, migratingId }: Props) {
    return (
        <Spin spinning={!!loading}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                }}
            >
                {dataSource.map((record) => (
                    <FeedLegacyBentoCard
                        key={record.id}
                        record={record}
                        onDelete={onDelete}
                        onMigrate={onMigrate}
                        isMigrating={migratingId === record.id}
                    />
                ))}
            </div>
            {!loading && dataSource.length === 0 && <Empty style={{ marginTop: 24 }} />}
        </Spin>
    );
}
