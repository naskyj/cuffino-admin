import { baseSlice } from "./apiSlice";

// User Types
export interface User {
  userId: number;
  username: string;
  email: string;
  active: boolean;
  role: string | { roleName: string };
  address?: string;
  phoneNumber?: string;
  companyName?: string;
  bio?: string;
}

export interface UserDTO {
  username?: string;
  email?: string;
  address?: string;
  phoneNumber?: string;
  companyName?: string;
  bio?: string;
}

// Address Types
export interface AddressDTO {
  addressId: number;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDTO {
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label?: string;
  isDefault?: boolean;
}

export interface UpdateAddressDTO {
  streetAddress?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  label?: string;
  isDefault?: boolean;
}

// Measurement Profile Types
export interface UserMeasurementProfileDTO {
  profileId?: number;
  userId: number;
  profileName: string;
  bust?: number;
  waist?: number;
  hips?: number;
  shoulderWidth?: number;
  armLength?: number;
  legLength?: number;
  neck?: number;
  sleeveLength?: number;
  inseam?: number;
  thigh?: number;
  calf?: number;
  additionalNotes?: string;
  customFields?: Record<string, string>;
}

export const userApi = baseSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get User by ID
    getUserById: builder.query<User, number>({
      query: (id) => `/user/get/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Get All Users (Admin only)
    getAllUsers: builder.query<User[], void>({
      query: () => "/user/all",
      providesTags: ["User"],
    }),

    // Update User
    updateUser: builder.mutation<User, { id: number; data: UserDTO }>({
      query: ({ id, data }) => ({
        url: `/user/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    // Delete User (Admin only)
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/user/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Address Management
    // Get All Addresses for User
    getUserAddresses: builder.query<AddressDTO[], number>({
      query: (userId) => `/users/${userId}/addresses`,
      providesTags: (result, error, userId) => [
        { type: "Addresses", id: userId },
      ],
    }),

    // Get Address by ID
    getAddressById: builder.query<
      AddressDTO,
      { userId: number; addressId: number }
    >({
      query: ({ userId, addressId }) =>
        `/users/${userId}/addresses/${addressId}`,
      providesTags: (result, error, { addressId }) => [
        { type: "Addresses", id: addressId },
      ],
    }),

    // Get Default Address
    getDefaultAddress: builder.query<AddressDTO, number>({
      query: (userId) => `/users/${userId}/addresses/default`,
      providesTags: (result, error, userId) => [
        { type: "Addresses", id: `default-${userId}` },
      ],
    }),

    // Create Address
    createAddress: builder.mutation<
      AddressDTO,
      { userId: number; data: CreateAddressDTO }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/addresses`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Addresses", id: userId },
      ],
    }),

    // Update Address
    updateAddress: builder.mutation<
      AddressDTO,
      { userId: number; addressId: number; data: UpdateAddressDTO }
    >({
      query: ({ userId, addressId, data }) => ({
        url: `/users/${userId}/addresses/${addressId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { addressId, userId }) => [
        { type: "Addresses", id: addressId },
        { type: "Addresses", id: userId },
      ],
    }),

    // Set Address as Default
    setDefaultAddress: builder.mutation<
      AddressDTO,
      { userId: number; addressId: number }
    >({
      query: ({ userId, addressId }) => ({
        url: `/users/${userId}/addresses/${addressId}/set-default`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Addresses", id: userId },
      ],
    }),

    // Delete Address
    deleteAddress: builder.mutation<
      void,
      { userId: number; addressId: number }
    >({
      query: ({ userId, addressId }) => ({
        url: `/users/${userId}/addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Addresses", id: userId },
      ],
    }),

    // Measurement Profile Management
    // Create Measurement Profile
    createMeasurementProfile: builder.mutation<
      UserMeasurementProfileDTO,
      UserMeasurementProfileDTO
    >({
      query: (data) => ({
        url: "/user/measurements",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Measurements", id: userId },
      ],
    }),

    // List Measurement Profiles for User
    getMeasurementProfiles: builder.query<UserMeasurementProfileDTO[], number>({
      query: (userId) => `/user/measurements/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "Measurements", id: userId },
      ],
    }),

    // Update Measurement Profile
    updateMeasurementProfile: builder.mutation<
      UserMeasurementProfileDTO,
      { profileId: number; data: UserMeasurementProfileDTO }
    >({
      query: ({ profileId, data }) => ({
        url: `/user/measurements/${profileId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { data }) => [
        { type: "Measurements", id: data.userId },
      ],
    }),

    // Delete Measurement Profile
    deleteMeasurementProfile: builder.mutation<void, number>({
      query: (profileId) => ({
        url: `/user/measurements/${profileId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Measurements"],
    }),
  }),
});

export const {
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserAddressesQuery,
  useGetAddressByIdQuery,
  useGetDefaultAddressQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
  useCreateMeasurementProfileMutation,
  useGetMeasurementProfilesQuery,
  useUpdateMeasurementProfileMutation,
  useDeleteMeasurementProfileMutation,
} = userApi;
