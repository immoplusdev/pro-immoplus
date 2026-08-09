import { useTranslate } from "@refinedev/core";
import { RatingStatus } from "@/lib/ts-utilities/enums/rating-status";
import { PillTag, PillTone } from "@/components/table";

type Props = {
    status?: string | null;
};

export function RatingStatusTag({ status }: Props) {
    const translate = useTranslate();

    if (!status) {
        return <PillTag tone="neutral">{translate("reservations.rating_status.not_applicable")}</PillTag>;
    }

    return (
        <PillTag tone={ratingStatusToTone(status)}>
            {translate(`reservations.rating_status.${status}`)}
        </PillTag>
    );
}

function ratingStatusToTone(status: string): PillTone {
    switch (status) {
        case RatingStatus.Rated:
            return "success";
        case RatingStatus.Pending:
            return "warning";
        case RatingStatus.Expired:
            return "error";
        case RatingStatus.NotApplicable:
        default:
            return "neutral";
    }
}
