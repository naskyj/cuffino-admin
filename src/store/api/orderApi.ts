import { baseSlice } from "./apiSlice";

// Order Types — must match backend OrderStatusEnum exactly
export type OrderStatusEnum =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "READY_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemRequestDTO {
  productId: number;
  quantity: number;
  measurementProfileId?: number;
  measurement?: any;
  customerNotes?: string;
  customizations?: OrderItemCustomizationDTO[];
  customizationImages?: OrderItemImageDTO[];
  selectedFabricInventoryIds?: number[];
}

export interface OrderItemCustomizationDTO {
  productCustomizationId?: number;
  name?: string;
  value: string;
}

export interface OrderItemImageDTO {
  imageId?: number;
  imageUrl?: string;
  imageType?: string;
  description?: string;
}

export interface OrderItemFabricDTO {
  inventoryId: number;
  materialName: string;
  unit?: string;
  sourceType: "DEFAULT" | "CUSTOMER_SELECTED";
}

export interface OrderItemResponseDTO {
  orderItemId: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  measurement?: Record<string, unknown> | null;
  customerNotes?: string | null;
  customizations?: OrderItemCustomizationDTO[];
  productImages?: OrderItemImageDTO[];
  customizationImages?: OrderItemImageDTO[];
  defaultFabrics?: OrderItemFabricDTO[];
  customerSelectedFabrics?: OrderItemFabricDTO[];
}

export interface OrderRequestDTO {
  customerId: number;
  shippingAddressId?: number;
  items: OrderItemRequestDTO[];
}

export interface OrderResponseDTO {
  orderId: number;
  customerId: number;
  customerUsername?: string;
  totalPrice: number;
  tax: number;
  shippingFee: number;
  discountTotal: number;
  currency: string;
  finalizedTotal?: number;
  status: OrderStatusEnum;
  orderDate: string;
  shippingAddress?: any;
  items?: OrderItemResponseDTO[];
}

export interface OrderSearchCriteria {
  customerId?: number;
  status?: OrderStatusEnum;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface UpdateShippingAddressDTO {
  addressId: number;
}

export const orderApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create Order
    createOrder: builder.mutation<OrderResponseDTO, OrderRequestDTO>({
      query: (data) => ({
        url: "/order/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Orders", "Cart"],
    }),

    // Get All Orders (Admin/Manager)
    getAllOrders: builder.query<OrderResponseDTO[], void>({
      query: () => "/order/all",
      providesTags: ["Orders"],
    }),

    // Get Order by ID
    getOrderById: builder.query<OrderResponseDTO, number>({
      query: (id) => `/order/get/${id}`,
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    // Get Orders by Customer
    getOrdersByCustomer: builder.query<OrderResponseDTO[], number>({
      query: (customerId) => `/order/customer/${customerId}`,
      providesTags: (result, error, customerId) => [
        { type: "Orders", id: `customer-${customerId}` },
      ],
    }),

    // Get Orders by Status
    getOrdersByStatus: builder.query<OrderResponseDTO[], OrderStatusEnum>({
      query: (status) => `/order/status/${status}`,
      providesTags: ["Orders"],
    }),

    // Update Order Status
    updateOrderStatus: builder.mutation<
      any,
      { id: number; status: OrderStatusEnum; reason?: string }
    >({
      query: ({ id, status, reason }) => ({
        url: `/order/${id}/status`,
        method: "PUT",
        params: { newStatus: status },
        body: reason ? { reason } : undefined,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Orders", id },
        "Orders",
      ],
    }),

    // Search Orders
    searchOrders: builder.query<
      any,
      {
        criteria: OrderSearchCriteria;
        page?: number;
        size?: number;
        sort?: string;
      }
    >({
      query: ({ criteria, page = 0, size = 10, sort }) => {
        const params = new URLSearchParams();
        if (criteria.customerId) {
          params.append("customerId", criteria.customerId.toString());
        }
        if (criteria.status) params.append("status", criteria.status);
        if (criteria.startDate) params.append("startDate", criteria.startDate);
        if (criteria.endDate) params.append("endDate", criteria.endDate);
        if (criteria.minTotal) {
          params.append("minTotal", criteria.minTotal.toString());
        }
        if (criteria.maxTotal) {
          params.append("maxTotal", criteria.maxTotal.toString());
        }
        params.append("page", page.toString());
        params.append("size", size.toString());
        if (sort) params.append("sort", sort);
        return `/order/search?${params.toString()}`;
      },
      providesTags: ["Orders"],
    }),

    // Bulk Update Order Status
    bulkUpdateOrderStatus: builder.mutation<
      any[],
      { orderIds: number[]; status: OrderStatusEnum }
    >({
      query: ({ orderIds, status }) => ({
        url: "/order/update/bulk/status",
        method: "PUT",
        body: orderIds,
        params: { newStatus: status },
      }),
      invalidatesTags: ["Orders"],
    }),

    // Bulk Delete Orders
    bulkDeleteOrders: builder.mutation<void, number[]>({
      query: (orderIds) => ({
        url: "/order/delete/bulk",
        method: "DELETE",
        body: orderIds,
      }),
      invalidatesTags: ["Orders"],
    }),

    // Get Order Statistics
    getOrderStatistics: builder.query<
      any,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: "/order/statistics",
        params: { startDate, endDate },
      }),
    }),

    // Delete Order
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/order/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),

    // Update Order Item
    updateOrderItem: builder.mutation<
      any,
      { orderId: number; itemId: number; data: OrderItemRequestDTO }
    >({
      query: ({ orderId, itemId, data }) => ({
        url: `/order/update/${orderId}/items/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
      ],
    }),

    // Update Shipping Address
    updateShippingAddress: builder.mutation<
      OrderResponseDTO,
      { orderId: number; data: UpdateShippingAddressDTO }
    >({
      query: ({ orderId, data }) => ({
        url: `/order/${orderId}/shipping-address`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrdersByCustomerQuery,
  useGetOrdersByStatusQuery,
  useUpdateOrderStatusMutation,
  useSearchOrdersQuery,
  useBulkUpdateOrderStatusMutation,
  useBulkDeleteOrdersMutation,
  useGetOrderStatisticsQuery,
  useDeleteOrderMutation,
  useUpdateOrderItemMutation,
  useUpdateShippingAddressMutation,
} = orderApi;
