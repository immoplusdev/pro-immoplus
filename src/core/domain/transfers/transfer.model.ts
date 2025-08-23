import { TransferItemType } from "./transfer-item-type.enum";
import { TransferStatus } from "./transfer-status.enum";
import { TransferType } from "./transfer-type.enum";
import { PaymentMethod } from "./payment-method.enum";

export default interface Transfer {
  id: string;
  amount: number;
  currency: string;
  fees?: number;
  customer?: string;
  itemType: TransferItemType;
  itemId: string;
  transfetStatus: TransferStatus;
  transferType: TransferType;
  country: string;
  accountNumber?: string;
  bank?: Record<string, any>;
  recipientName?: string;
  transferProvider?: PaymentMethod;
  hub2TransferId?: string;
  hub2Exception?: string;
  hub2Metadata?: Record<string, any>;
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  deletedAt?: Date;
}