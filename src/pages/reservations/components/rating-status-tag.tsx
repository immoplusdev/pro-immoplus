import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";
import { RatingStatus } from "@/lib/ts-utilities/enums/rating-status";

type Props = {
    status?: string | null;
};

export function RatingStatusTag({ status }: Props) {
    const translate = useTranslate();

    if (!status) {
        return <Tag>{translate("reservations.rating_status.not_applicable")}</Tag>;
    }

    return (
        <Tag color={ratingStatusToColor(status)}>
            {translate(`reservations.rating_status.${status}`)}
        </Tag>
    );
}

function ratingStatusToColor(status: string) {
    switch (status) {
        case RatingStatus.Rated:
            return "success";
        case RatingStatus.Pending:
            return "processing";
        case RatingStatus.Expired:
            return "error";
        case RatingStatus.NotApplicable:
        default:
            return "default";
    }
}
