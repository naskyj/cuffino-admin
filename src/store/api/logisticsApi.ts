import { baseSlice } from "./apiSlice";

// Logistics Types
export interface Logistics {
  logisticsId: number;
  orderId: number;
  carrier: string;
  trackingNumber: string;
  packageWeight?: number;
  packageDimensions?: string;
  customsDocUrl?: string;
  estimatedDelivery?: string;
  status?: string;
  currentLocation?: string;
}

export interface LogisticsDTO {
  orderId: number;
  carrier: string;
  trackingNumber: string;
  packageWeight?: number;
  packageDimensions?: string;
  customsDocUrl?: string;
  estimatedDelivery?: string;
  status?: string;
  currentLocation?: string;
}

export const logisticsApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Logistics
    getAllLogistics: builder.query<Logistics[], void>({
      query: () => "/logistics/all",
      providesTags: ["Logistics"],
    }),

    // Get Logistics by ID
    getLogisticsById: builder.query<Logistics, number>({
      query: (id) => `/logistics/get/${id}`,
      providesTags: (result, error, id) => [{ type: "Logistics", id }],
    }),

    // Create Logistics
    createLogistics: builder.mutation<Logistics, LogisticsDTO>({
      query: (data) => ({
        url: "/logistics/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Logistics"],
    }),

    // Update Logistics
    updateLogistics: builder.mutation<
      Logistics,
      { id: number; data: LogisticsDTO }
    >({
      query: ({ id, data }) => ({
        url: `/logistics/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Logistics", id },
        "Logistics",
      ],
    }),

    // Delete Logistics
    deleteLogistics: builder.mutation<void, number>({
      query: (id) => ({
        url: `/logistics/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Logistics"],
    }),
  }),
});

export const {
  useGetAllLogisticsQuery,
  useGetLogisticsByIdQuery,
  useCreateLogisticsMutation,
  useUpdateLogisticsMutation,
  useDeleteLogisticsMutation,
} = logisticsApi;
