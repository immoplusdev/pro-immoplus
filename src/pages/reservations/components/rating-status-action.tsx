import React, { useEffect, useState } from "react";
import { Button, Select, Space, message } from "antd";
import { useApiUrl, useCustomMutation, useInvalidate, useTranslate } from "@refinedev/core";
import { enumToList } from "@/lib/ts-utilities";
import { RatingStatus } from "@/lib/ts-utilities/enums/rating-status";

type Props = {
    id?: string;
    value?: string | null;
};

export const RatingStatusAction: React.FC<Props> = ({ id, value }) => {
    const translate = useTranslate();
    const apiUrl = useApiUrl();
    const invalidate = useInvalidate();
    const { mutateAsync, isLoading } = useCustomMutation();
    const [selected, setSelected] = useState<string | null>(value ?? null);

    useEffect(() => {
        setSelected(value ?? null);
    }, [value]);

    const handleApply = async () => {
        if (!id) return;
        try {
            await mutateAsync({
                url: `${apiUrl}/reservations/action/rating-status/${id}`,
                method: "post",
                values: { ratingStatus: selected },
            });
            message.success(translate("reservations.messages.rating_status_updated"));
            invalidate({ resource: "reservations", invalidates: ["list", "detail"] });
        } catch (error: any) {
            message.error(error?.response?.data?.message || translate("common.error"));
        }
    };

    return (
        <Space.Compact style={{ width: "100%" }}>
            <Select
                style={{ width: "100%" }}
                value={selected}
                onChange={(val) => setSelected(val)}
                options={[
                    { value: null, label: translate("reservations.rating_status.automatic") },
                    ...enumToList(RatingStatus).map((item) => ({
                        value: item,
                        label: translate(`reservations.rating_status.${item}`),
                    })),
                ]}
            />
            <Button type="primary" loading={isLoading} disabled={!id} onClick={handleApply}>
                {translate("buttons.apply")}
            </Button>
        </Space.Compact>
    );
};
