import { ListPaymentTable } from "@/pages/payments/components";
import { PaymentType } from "@/core/domain/payments";
import { PaymentTabs } from "@/pages/payments/components/payment-tabs";

export function ListPaymentsDemandesRetrait() {
    return (
        <>
            <PaymentTabs activeMenu="retraits" />
            <ListPaymentTable
                activeMenu="retraits"
                filters={{
                    permanent: [
                        {
                            field: "paymentType",
                            operator: "eq",
                            value: PaymentType.Retrait,
                        },
                    ],
                }}
            />
        </>
    );
}
