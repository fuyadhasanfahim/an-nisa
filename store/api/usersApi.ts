import { baseApi } from "@/store/api/baseApi";
import type { AdminCustomerDto } from "@/lib/users/map-admin-customer";
import type {
  AdminCustomerCreateInput,
  AdminCustomerUpdateInput,
} from "@/lib/validators/customer-admin.schema";

export type CustomerProfileDto = {
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
};

export type UserListResponse = {
  items: AdminCustomerDto[];
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsersForAdmin: build.query<
      UserListResponse,
      { q?: string; limit?: number; excludeBanned?: boolean } | void
    >({
      query: (arg) => ({
        url: "/users",
        params: {
          q: arg?.q,
          limit: arg?.limit,
          ...(arg?.excludeBanned ? { excludeBanned: "1" } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({
                type: "User" as const,
                id: c.id,
              })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),
    getCustomerAdmin: build.query<AdminCustomerDto, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),
    createCustomer: build.mutation<AdminCustomerDto, AdminCustomerCreateInput>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateCustomer: build.mutation<
      AdminCustomerDto,
      { id: string; body: AdminCustomerUpdateInput }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),
    deleteCustomer: build.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
    getCustomerProfileForAdmin: build.query<CustomerProfileDto, string>({
      query: (userId) => `/users/${userId}/customer-profile`,
    }),
  }),
});

export const {
  useListUsersForAdminQuery,
  useLazyListUsersForAdminQuery,
  useGetCustomerAdminQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useLazyGetCustomerProfileForAdminQuery,
} = usersApi;

/** Minimal user shape for admin pickers (orders, etc.). */
export type UserMiniDto = {
  id: string;
  name: string;
  email: string;
};
