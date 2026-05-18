import { api } from "../lib/axios";

export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentType = "DEPOSIT" | "FIRST_MONTH_RENT" | "MONTHLY_RENT" | "UTILITIES" | "OTHER";

export interface Payment {
  id: string;
  contractId: string;
  tenantId: string;
  landlordId: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  dueDate: string;
  paidAt: string | null;
  providerTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
  contract: {
    property: {
      title: string;
      address: string;
      city: string;
      district: string;
    };
    room: {
      title: string;
    };
  };
  landlord: {
    fullName: string;
  };
  tenant: {
    fullName: string;
  };
}

export interface CreatePaymentDto {
  amount: number;
  type: PaymentType;
  dueDate: string;
}

export const PaymentService = {
  findAll: async (): Promise<Payment[]> => {
    const response = await api.get("/payments");
    return response.data?.data || response.data;
  },

  findOne: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data?.data || response.data;
  },

  createInvoice: async (contractId: string, dto: CreatePaymentDto): Promise<Payment> => {
    const response = await api.post(`/contracts/${contractId}/payments`, dto);
    return response.data?.data || response.data;
  },

  markAsPaid: async (id: string): Promise<{ payment: Payment; contractActivated: boolean; tenancy: any }> => {
    const response = await api.post(`/payments/${id}/pay`);
    return response.data?.data || response.data;
  },

  generateRecurringBilling: async (): Promise<{ count: number; invoices: any[] }> => {
    const response = await api.post("/payments/generate-recurring");
    return response.data?.data || response.data;
  },
};
