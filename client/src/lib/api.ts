import { type AxiosResponse } from "axios";
import { http } from "@/lib/https.ts";

export const api = {
  family: `/api/v1/family`,
  status: `/api/v1/status`,
  users: `/api/v1/users`,
  validators: `/api/v1/validators`,
  auth: `/api/v1/auth`,
  kanban_columns: "/api/v1/kanban_columns",
  kanban_tasks: "/api/v1/kanban_tasks",
  notes: "/api/v1/notes",
  bills: "/api/v1/bills",
  budgets: "/api/v1/budgets",
};

type ApiBaseUrl = (typeof api)[keyof typeof api];

export const ApiService = {
  //T represents expected payload model, R represents response model
  post: async function <T, R>(baseUrl: ApiBaseUrl, resource: string, data: T): Promise<AxiosResponse<R, any, {}>> {
    return await http.post<R>(`${baseUrl}${resource}`, data);
  },

  get: async function <T>(baseUrl: ApiBaseUrl, resource: string = "") {
    return await http.get<T>(`${baseUrl}${resource}`);
  },

  delete: async function (baseUrl: ApiBaseUrl, resource: string = "") {
    return await http.delete(`${baseUrl}${resource}`);
  },
};
