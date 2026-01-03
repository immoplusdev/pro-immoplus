import {ListPaymentTable} from "@/pages/payments/components";
import {PaymentType} from "@/core/domain/payments";


export function ListPaymentsFactures() {
    return (
        <ListPaymentTable
            activeMenu={"factures"}
            filters={
                {
                    permanent: [
                        {
                            field: "paymentType",
                            operator: "eq",
                            value: PaymentType.Facture
                        }
                    ]
                }
            }
        />
    )
}
