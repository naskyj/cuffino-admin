import { baseSlice } from "./apiSlice";

// Production Queue Types
export type ProductionStatus =
  | "QUEUED"
  | "ASSIGNED"
  | "FABRIC_ACQUISITION"
  | "IN_PROGRESS"
  | "IN_PRODUCTION"
  | "QUALITY_CHECK"
  | "READY_FOR_SHIPMENT";

export interface ProductionQueue {
  queueId: number;
  orderId: number;
  customerId?: number;
  customerUsername?: string;
  orderStatus?: string;
  status: ProductionStatus;
  assignedDesignerId?: number;
  assignedDesignerName?: string;
  priority?: number;
  notes?: string;
  productionStartDate?: string;
  estimatedCompletionDate?: string;
}

export interface ProductionQueueDTO {
  orderId: number;
  status?: ProductionStatus;
  assignedDesignerId?: number;
  priority?: number;
  notes?: string;
}

export interface ProductionAssignmentDTO {
  assignedDesignerId: number;
  priority?: number;
  notes?: string;
}

export interface ProductionStatusUpdateDTO {
  status: ProductionStatus;
  notes?: string;
}

export interface ProductionShipmentDTO {
  carrier: string;
  trackingNumber: string;
  packageWeight?: number;
  packageDimensions?: string;
  customsDocUrl?: string;
}

export interface ProductionLogistics {
  logisticsId: number;
  [key: string]: unknown;
}

export const productionApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Production Queue Items
    getAllProductionQueues: builder.query<ProductionQueue[], void>({
      query: () => "/production-queue/all",
      providesTags: ["Production"],
    }),

    // Get only active production queue items for operations UI
    getActiveProductionQueues: builder.query<ProductionQueue[], void>({
      query: () => "/production-queue/active",
      providesTags: ["Production"],
    }),

    // Get Production Queue Item by ID
    getProductionQueueById: builder.query<ProductionQueue, number>({
      query: (id) => `/production-queue/get/${id}`,
      providesTags: (result, error, id) => [{ type: "Production", id }],
    }),

    // Create Production Queue Item
    createProductionQueue: builder.mutation<
      ProductionQueue,
      ProductionQueueDTO
    >({
      query: (data) => ({
        url: "/production-queue/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Production"],
    }),

    // Update Production Queue Item
    updateProductionQueue: builder.mutation<
      ProductionQueue,
      { id: number; data: ProductionQueueDTO }
    >({
      query: ({ id, data }) => ({
        url: `/production-queue/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Production", id },
        "Production",
      ],
    }),

    // Delete Production Queue Item
    deleteProductionQueue: builder.mutation<void, number>({
      query: (id) => ({
        url: `/production-queue/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Production"],
    }),

    // Assign Production
    assignProduction: builder.mutation<
      ProductionQueue,
      { id: number; data: ProductionAssignmentDTO }
    >({
      query: ({ id, data }) => ({
        url: `/production-queue/${id}/assign`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Production", id },
        "Production",
      ],
    }),

    assignProductionByOrder: builder.mutation<
      ProductionQueue,
      { orderId: number; data: ProductionAssignmentDTO }
    >({
      query: ({ orderId, data }) => ({
        url: `/production-queue/order/${orderId}/assign`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Production", "Orders"],
    }),

    // Update Production Status
    updateProductionStatus: builder.mutation<
      ProductionQueue,
      { id: number; data: ProductionStatusUpdateDTO }
    >({
      query: ({ id, data }) => ({
        url: `/production-queue/${id}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Production", id },
        "Production",
        "Logistics",
        "Orders",
      ],
    }),

    // Create Shipment from Production
    createShipmentFromProduction: builder.mutation<
      ProductionLogistics,
      { id: number; data: ProductionShipmentDTO }
    >({
      query: ({ id, data }) => ({
        url: `/production-queue/${id}/shipments`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Production", id },
        "Logistics",
      ],
    }),
  }),
});

export const {
  useGetAllProductionQueuesQuery,
  useGetActiveProductionQueuesQuery,
  useGetProductionQueueByIdQuery,
  useCreateProductionQueueMutation,
  useUpdateProductionQueueMutation,
  useDeleteProductionQueueMutation,
  useAssignProductionMutation,
  useAssignProductionByOrderMutation,
  useUpdateProductionStatusMutation,
  useCreateShipmentFromProductionMutation,
} = productionApi;
