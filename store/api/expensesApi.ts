import { baseApi } from "@/store/api/baseApi";

export type ExpenseDayPoint = {
  date: string;
  label: string;
  expenseCents: number;
  expenseCount: number;
};

export type ExpenseCategorySlice = {
  label: string;
  expenseCents: number;
  expenseCount: number;
};

export type ExpenseTransactionRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  amountCents: number;
  currency: string;
  spentAt: string;
  createdAt: string;
};

export type ExpensesResponse = {
  rangeDays: number;
  currency: string;
  lifetime: {
    totalExpenseCents: number;
    expenseCount: number;
  };
  inRange: {
    totalExpenseCents: number;
    expenseCount: number;
    avgExpenseCents: number;
  };
  daily: ExpenseDayPoint[];
  byCategory: ExpenseCategorySlice[];
  transactions: ExpenseTransactionRow[];
};

export type ExpenseCreateBody = {
  title: string;
  amountCents: number;
  currency?: string;
  category?: string;
  description?: string;
  spentAt?: string;
};

export type ExpenseUpdateBody = {
  title?: string;
  amountCents?: number;
  currency?: string;
  category?: string | null;
  description?: string | null;
  spentAt?: string;
};

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<ExpensesResponse, { days: number }>({
      query: ({ days }) => ({
        url: "/expenses",
        params: { days },
      }),
      providesTags: [{ type: "Expense", id: "LIST" }],
    }),
    createExpense: build.mutation<
      { item: ExpenseTransactionRow },
      ExpenseCreateBody
    >({
      query: (body) => ({
        url: "/expenses",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Expense", id: "LIST" }],
    }),
    deleteExpense: build.mutation<{ ok: boolean }, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Expense", id: "LIST" }],
    }),
    updateExpense: build.mutation<
      { item: ExpenseTransactionRow },
      { id: string; body: ExpenseUpdateBody }
    >({
      query: ({ id, body }) => ({
        url: `/expenses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Expense", id: "LIST" }],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useUpdateExpenseMutation,
} = expensesApi;
