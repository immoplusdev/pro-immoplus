import { ListPaymentTable } from "@/pages/payments/components";
import { PaymentType } from "@/core/domain/payments";
import { PaymentTabs } from "@/pages/payments/components/payment-tabs";

export function ListPaymentsFactures() {
    return (
        <>
            <PaymentTabs activeMenu="factures" />
            <ListPaymentTable
                activeMenu="factures"
                filters={{
                    permanent: [
                        {
                            field: "paymentType",
                            operator: "eq",
                            value: PaymentType.Facture,
                        },
                    ],
                }}
            />
        </>
    );
}
