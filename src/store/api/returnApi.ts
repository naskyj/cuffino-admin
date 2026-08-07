import { baseSlice } from "./apiSlice";

// Return Types
// Must match the backend ReturnRequestStatus enum exactly (order/model/ReturnRequestStatus.java) -
// the backend now validates this server-side and rejects any other value (RISK_REGISTER.md A5).
export type ReturnStatus =
  | "REQUESTED"
  | "APPROVED"
  | "RECEIVED"
  | "INSPECTED"
  | "REWORK"
  | "REFUNDED"
  | "REJECTED";

export type ReturnReasonCategory =
  | "FIT"
  | "QUALITY"
  | "WRONG_ITEM"
  | "DAMAGED"
  | "CHANGE_OF_MIND"
  | "OTHER";

export interface ReturnItemDTO {
  orderItemId: number;
  conditionNotes?: string;
}

export interface ReturnRequestDTO {
  orderId: number;
  reason: string;
  reasonCategory?: ReturnReasonCategory;
  items: ReturnItemDTO[];
}

export interface ReturnRequest {
  returnId: number;
  orderId: number;
  reason: string;
  reasonCategory?: ReturnReasonCategory;
  status: ReturnStatus;
  refundAmount?: number;
  taxRefundedAmount?: number;
  refundTransactionId?: string;
  resolution?: string;
  items?: ReturnItemDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export const returnApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllReturns: builder.query<ReturnRequest[], void>({
      query: () => "/returns/all",
      providesTags: ["Returns"],
    }),

    // Create Return Request
    createReturn: builder.mutation<ReturnRequest, ReturnRequestDTO>({
      query: (data) => ({
        url: "/returns",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Returns", "Orders"],
    }),

    // List Returns by Order
    getReturnsByOrder: builder.query<ReturnRequest[], number>({
      query: (orderId) => `/returns/order/${orderId}`,
      providesTags: (result, error, orderId) => [
        { type: "Returns", id: `order-${orderId}` },
      ],
    }),

    // Update Return Status
    updateReturnStatus: builder.mutation<
      ReturnRequest,
      { returnId: number; status: ReturnStatus; resolution?: string }
    >({
      query: ({ returnId, status, resolution }) => ({
        url: `/returns/${returnId}/status`,
        method: "PUT",
        params: { status },
        body: resolution ? { resolution } : undefined,
      }),
      invalidatesTags: (result, error, { returnId }) => [
        { type: "Returns", id: returnId },
        "Returns",
      ],
    }),

    // Issue refund (A1/G2: automated, tax refunded proportionally, moves return to REFUNDED)
    refundReturn: builder.mutation<
      ReturnRequest,
      { returnId: number; amount: number; reason: string }
    >({
      query: ({ returnId, amount, reason }) => ({
        url: `/returns/${returnId}/refund`,
        method: "POST",
        body: { amount, reason },
      }),
      invalidatesTags: (result, error, { returnId }) => [
        { type: "Returns", id: returnId },
        "Returns",
      ],
    }),
  }),
});

export const {
  useGetAllReturnsQuery,
  useCreateReturnMutation,
  useGetReturnsByOrderQuery,
  useUpdateReturnStatusMutation,
  useRefundReturnMutation,
} = returnApi;
