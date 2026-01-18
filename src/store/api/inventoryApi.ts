import { baseSlice } from "./apiSlice";

// Inventory Types
export interface Inventory {
  inventoryId: number;
  productId?: number;
  materialName: string;
  quantity: number;
  unit?: string;
  location?: string;
  [key: string]: any;
}

export interface InventoryDTO {
  productId?: number;
  materialName: string;
  quantity: number;
  unit?: string;
  location?: string;
  [key: string]: any;
}

export const inventoryApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Inventory Items
    getAllInventories: builder.query<Inventory[], void>({
      query: () => "/inventory/all",
      providesTags: ["Inventory"],
    }),

    // Get Inventory Item by ID
    getInventoryById: builder.query<Inventory, number>({
      query: (id) => `/inventory/get/${id}`,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),

    // Create Inventory Item
    createInventory: builder.mutation<Inventory, InventoryDTO>({
      query: (data) => ({
        url: "/inventory/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Inventory"],
    }),

    // Update Inventory Item
    updateInventory: builder.mutation<
      Inventory,
      { id: number; data: InventoryDTO }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Inventory", id },
        "Inventory",
      ],
    }),

    // Delete Inventory Item
    deleteInventory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/inventory/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Inventory"],
    }),
  }),
});

export const {
  useGetAllInventoriesQuery,
  useGetInventoryByIdQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} = inventoryApi;
