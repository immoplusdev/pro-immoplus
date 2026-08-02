import { useTranslate } from "@refinedev/core";
import { RatingStatus } from "@/lib/ts-utilities/enums/rating-status";
import { OutlineTag } from "@/components/table";

type Props = {
    status?: string | null;
};

export function RatingStatusTag({ status }: Props) {
    const translate = useTranslate();

    if (!status) {
        return <OutlineTag color="#5F5E5A">{translate("reservations.rating_status.not_applicable")}</OutlineTag>;
    }

    return (
        <OutlineTag color={ratingStatusToColor(status)}>
            {translate(`reservations.rating_status.${status}`)}
        </OutlineTag>
    );
}

function ratingStatusToColor(status: string) {
    switch (status) {
        case RatingStatus.Rated:
            return "#1F8A5B";
        case RatingStatus.Pending:
            return "#185FA5";
        case RatingStatus.Expired:
            return "#C13838";
        case RatingStatus.NotApplicable:
        default:
            return "#5F5E5A";
    }
}
