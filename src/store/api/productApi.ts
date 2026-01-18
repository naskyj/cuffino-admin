import { baseSlice } from "./apiSlice";

// Product Types
export interface Product {
  productId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
  categoryId?: number;
  category?: ProductCategory;
  customizations?: ProductCustomization[];
  images?: ProductImage[];
}

export interface ProductDTO {
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
  category?: ProductCategoryDTO;
  customizations?: ProductCustomizationDTO[];
  images?: ProductImageDTO[];
}

export interface ProductCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
}

export interface ProductCategoryDTO {
  categoryName: string;
  description?: string;
}

export interface ProductCustomization {
  customizationId: number;
  productId: number;
  name: string;
  description?: string;
  customizationType: string;
  customizationValue: string;
}

export interface ProductCustomizationDTO {
  customizationId?: number;
  name: string;
  description?: string;
  customizationType: string;
  customizationValue: string;
}

export interface ProductImage {
  imageId?: number;
  imageUrl: string;
  altText?: string;
}

export interface ProductImageDTO {
  imageId?: number;
  imageUrl: string;
  altText?: string;
}

export const productApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Products
    getAllProducts: builder.query<Product[], void>({
      query: () => "/product/all",
      providesTags: ["Products"],
    }),

    // Get Product by ID
    getProductById: builder.query<Product, number>({
      query: (id) => `/product/get/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    // Search Products
    searchProducts: builder.query<
      Product[],
      {
        name?: string;
        category?: string;
        categoryId?: number;
        minPrice?: number;
        maxPrice?: number;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.name) searchParams.append("name", params.name);
        if (params.category) searchParams.append("category", params.category);
        if (params.categoryId) {
          searchParams.append("categoryId", params.categoryId.toString());
        }
        if (params.minPrice) {
          searchParams.append("minPrice", params.minPrice.toString());
        }
        if (params.maxPrice) {
          searchParams.append("maxPrice", params.maxPrice.toString());
        }
        return `/product/search?${searchParams.toString()}`;
      },
      providesTags: ["Products"],
    }),

    // Create Product
    createProduct: builder.mutation<Product, ProductDTO>({
      query: (data) => ({
        url: "/product/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),

    // Update Product
    updateProduct: builder.mutation<Product, { id: number; data: ProductDTO }>({
      query: ({ id, data }) => ({
        url: `/product/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        "Products",
      ],
    }),

    // Delete Product
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/product/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // Category Management
    // Get All Categories
    getAllCategories: builder.query<ProductCategory[], void>({
      query: () => "/product/category/all",
      providesTags: ["ProductCategories"],
    }),

    // Create Category
    createCategory: builder.mutation<ProductCategory, ProductCategoryDTO>({
      query: (data) => ({
        url: "/product/category/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ProductCategories"],
    }),

    // Customization Management
    // Get Customizations for Product
    getProductCustomizations: builder.query<ProductCustomization[], number>({
      query: (productId) => `/product/${productId}/customizations`,
      providesTags: (result, error, productId) => [
        { type: "ProductCustomizations", id: productId },
      ],
    }),

    // Add Customization to Product
    addCustomization: builder.mutation<
      ProductCustomization,
      { productId: number; data: ProductCustomizationDTO }
    >({
      query: ({ productId, data }) => ({
        url: `/product/${productId}/customizations`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "ProductCustomizations", id: productId },
      ],
    }),

    // Delete Customization
    deleteCustomization: builder.mutation<void, number>({
      query: (customizationId) => ({
        url: `/product/customizations/${customizationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductCustomizations"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useSearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useGetProductCustomizationsQuery,
  useAddCustomizationMutation,
  useDeleteCustomizationMutation,
} = productApi;
