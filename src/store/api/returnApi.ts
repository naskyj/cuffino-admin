import { baseSlice } from "./apiSlice";

// Return Types
export type ReturnStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "REFUNDED";

export interface ReturnItemDTO {
  orderItemId: number;
  conditionNotes?: string;
}

export interface ReturnRequestDTO {
  orderId: number;
  reason: string;
  items: ReturnItemDTO[];
}

export interface ReturnRequest {
  returnId: number;
  orderId: number;
  reason: string;
  status: ReturnStatus;
  resolution?: string;
  items?: ReturnItemDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export const returnApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useCreateReturnMutation,
  useGetReturnsByOrderQuery,
  useUpdateReturnStatusMutation,
} = returnApi;
