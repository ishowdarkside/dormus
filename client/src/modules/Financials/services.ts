import { api, ApiService } from "@/lib/api.ts";
import type {
  CreateBillResponseModel,
  CreateBudgetResponseModel,
  RetrieveBillsResponseModel,
  RetrieveBudgetsResponseModel,
  UpdateBillResponseModel,
} from "@/modules/Financials/types.ts";
import type { Bill } from "@/models/Bill.ts";
import type { Budget } from "@/models/Budget.ts";

export const RetrieveBillsService = async () => {
  return await ApiService.get<RetrieveBillsResponseModel>(api.bills);
};

export const CreateBillService = async (data: Partial<Bill>) => {
  return await ApiService.post<Partial<Bill>, CreateBillResponseModel>(api.bills, "", data);
};

export const UpdateBillService = async (id: number, data: Partial<Bill>) => {
  return await ApiService.post<Partial<Bill>, UpdateBillResponseModel>(api.bills, `/${id}`, data);
};

export const DeleteBillService = async (id: number) => {
  return await ApiService.delete(api.bills, `/${id}`);
};

export const CreateBudgetItemService = async (data: Partial<Budget>) => {
  return await ApiService.post<Partial<Bill>, CreateBudgetResponseModel>(api.budgets, "", data);
};

export const RetrieveBudgetsService = async () => {
  return await ApiService.get<RetrieveBudgetsResponseModel>(api.budgets).then((res) => res.data.budgets);
};
