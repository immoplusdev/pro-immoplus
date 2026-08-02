import { ListPaymentTable } from "@/pages/payments/components";
import { PaymentTabs } from "@/pages/payments/components/payment-tabs";

export const ListPayments = () => {
    return (
        <>
            <PaymentTabs activeMenu="all_e" />
            <ListPaymentTable activeMenu="all_e" />
        </>
    );
};
