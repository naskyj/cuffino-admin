import { baseSlice } from "./apiSlice";

// Image Types
export interface ImageUploadResponse {
  imageId: number;
  imageUrl: string;
  imageType: string;
  description?: string;
  message: string;
}

export interface ImageUploadRequest {
  file: File;
  imageType?: string;
  description?: string;
}

export interface ImageAPIResponse {
  message: string;
  status: number;
  statusCode?: number;
}

export const imageApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Upload Image
    uploadImage: builder.mutation<ImageUploadResponse, ImageUploadRequest>({
      query: ({ file, imageType, description }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (imageType) formData.append("imageType", imageType);
        if (description) formData.append("description", description);
        return {
          url: "/api/images/upload",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Images", "Upload"],
    }),

    // A customer's own uploads, viewed by staff - e.g. the MEASUREMENT_REFERENCE front/side/back
    // photos a reviewer checks against the measurements the customer typed in.
    getUserImages: builder.query<ImageUploadResponse[], { userId: number; imageType?: string }>({
      query: ({ userId, imageType }) => ({
        url: `/api/images/user/${userId}`,
        params: imageType ? { imageType } : undefined,
      }),
      providesTags: ["Images"],
    }),

    // Delete Image by ID
    deleteImage: builder.mutation<ImageAPIResponse, number>({
      query: (imageId) => ({
        url: `/api/images/delete/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Images", "Upload"],
    }),

    // Delete Image by URL
    deleteImageByUrl: builder.mutation<ImageAPIResponse, string>({
      query: (imageUrl) => ({
        url: "/api/images/delete-by-url",
        method: "DELETE",
        params: { imageUrl },
      }),
      invalidatesTags: ["Images", "Upload"],
    }),
  }),
});

export const {
  useGetUserImagesQuery,
  useUploadImageMutation,
  useDeleteImageMutation,
  useDeleteImageByUrlMutation,
} = imageApi;
