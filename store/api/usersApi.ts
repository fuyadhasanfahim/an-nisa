import { baseApi } from "@/store/api/baseApi";

export type UserMiniDto = {
  id: string;
  name: string;
  email: string;
};

export type CustomerProfileDto = {
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
};

export type UserListResponse = {
  items: UserMiniDto[];
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsersForAdmin: build.query<
      UserListResponse,
      { q?: string; limit?: number } | void
    >({
      query: (arg) => ({
        url: "/users",
        params: {
          q: arg?.q,
          limit: arg?.limit,
        },
      }),
    }),
    getCustomerProfileForAdmin: build.query<CustomerProfileDto, string>({
      query: (userId) => `/users/${userId}/customer-profile`,
    }),
  }),
});

export const {
  useListUsersForAdminQuery,
  useLazyListUsersForAdminQuery,
  useLazyGetCustomerProfileForAdminQuery,
} = usersApi;
