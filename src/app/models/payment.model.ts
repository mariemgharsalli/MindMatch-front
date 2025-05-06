import { User } from "./User.model";

export interface Payment {
  id: number;
  amount: number;
  status: PaymentStatus;
  bank: Banks;
  createdAt: Date;
  holderName: string;
  expirationDate: string;
  cardNumber: string;
  cardCode: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  userPhone: string;
  userAddress: string;
  paymentId: string;
  titles: string[];
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Banks {
  AMANE = 'AMANE',
  BIAT = 'BIAT'
}
