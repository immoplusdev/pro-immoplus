import {ListPaymentTable} from "@/pages/payments/components";
import {PaymentType} from "@/core/domain/payments";


export function ListPaymentsDemandesRetrait() {
    return (
        <ListPaymentTable
            activeMenu={"retraits"}
            filters={
                {
                    permanent: [
                        {
                            field: "paymentType",
                            operator: "eq",
                            value: PaymentType.Retrait
                        }
                    ]
                }
            }
        />
    )
}
