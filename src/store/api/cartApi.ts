import { baseSlice } from "./apiSlice";

// Cart Types
export interface CartItemImageDTO {
  imageId?: number;
  imageUrl?: string;
  imageType?: string;
  description?: string;
}

export interface AddToCartRequestDTO {
  productId: number;
  quantity: number;
  measurementId?: number;
  customerNotes?: string;
  customizations?: CartItemCustomizationDTO[];
  customizationImages?: CartItemImageDTO[];
}

export interface CartItemCustomizationDTO {
  productCustomizationId: number;
  value: string;
}

export interface UpdateCartItemRequestDTO {
  quantity?: number;
  measurementId?: number;
  customerNotes?: string;
  customizations?: CartItemCustomizationDTO[];
}

export interface CartItemDTO {
  cartItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  customerNotes?: string;
  customizationImages?: CartItemImageDTO[];
  customizations?: any[];
}

export interface CartResponseDTO {
  cartId: number;
  userId: number;
  items: CartItemDTO[];
}

export const cartApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get Cart
    getCart: builder.query<CartResponseDTO, number>({
      query: (userId) => `/cart/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Cart", id: userId }],
    }),

    // Add to Cart (JSON)
    addToCart: builder.mutation<
      CartResponseDTO,
      { userId: number; data: AddToCartRequestDTO }
    >({
      query: ({ userId, data }) => ({
        url: `/cart/${userId}/add/json`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Cart", id: userId },
      ],
    }),

    // Add to Cart (Multipart - with file uploads)
    addToCartWithFiles: builder.mutation<
      CartResponseDTO,
      {
        userId: number;
        request: AddToCartRequestDTO;
        images?: File[];
        imageTypes?: string[];
        descriptions?: string[];
      }
    >({
      query: ({ userId, request, images, imageTypes, descriptions }) => {
        const formData = new FormData();
        formData.append("request", JSON.stringify(request));
        if (images) {
          images.forEach((image) => formData.append("images", image));
        }
        if (imageTypes) {
          imageTypes.forEach((type) => formData.append("imageTypes", type));
        }
        if (descriptions) {
          descriptions.forEach((desc) => formData.append("descriptions", desc));
        }
        return {
          url: `/cart/${userId}/add`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: "Cart", id: userId },
      ],
    }),

    // Update Cart Item
    updateCartItem: builder.mutation<
      CartResponseDTO,
      { userId: number; cartItemId: number; data: UpdateCartItemRequestDTO }
    >({
      query: ({ userId, cartItemId, data }) => ({
        url: `/cart/${userId}/items/${cartItemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Cart", id: userId },
      ],
    }),

    // Remove Item from Cart
    removeFromCart: builder.mutation<
      CartResponseDTO,
      { userId: number; cartItemId: number }
    >({
      query: ({ userId, cartItemId }) => ({
        url: `/cart/${userId}/items/${cartItemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Cart", id: userId },
      ],
    }),

    // Clear Cart
    clearCart: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/cart/${userId}/clear`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "Cart", id: userId },
      ],
    }),

    // Convert Cart to Order
    convertCartToOrder: builder.mutation<any, number>({
      query: (userId) => ({
        url: `/cart/${userId}/convert-to-order`,
        method: "POST",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "Cart", id: userId },
        "Orders",
      ],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useAddToCartWithFilesMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useConvertCartToOrderMutation,
} = cartApi;
