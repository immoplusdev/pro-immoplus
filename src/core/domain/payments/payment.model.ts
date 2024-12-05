import {PaymentStatus} from "./payment-status.enum";
import {PaymentType} from "./payment-type.enum";

export interface Payment {
    id: string;
    amount: number;
    amountNoFees: number;
    customer: string;
    paymentType: PaymentType;
    collection: string;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    itemId: string;
    hub2PaymentId?: string;
    hub2Exception?: string;
    hub2NextAction?: Record<string, any>;
    hub2Token?: string;
    hub2Metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    createdBy?: string;
}
