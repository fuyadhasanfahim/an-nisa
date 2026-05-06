import { baseApi } from "@/store/api/baseApi";

export type UserMiniDto = {
  id: string;
  name: string;
  email: string;
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
  }),
});

export const { useListUsersForAdminQuery, useLazyListUsersForAdminQuery } =
  usersApi;
