import type { Bill } from "@/models/Bill.ts";
import type { Budget } from "@/models/Budget.ts";

export interface RetrieveBillsResponseModel {
  status: string;
  bills: Bill[];
}

export interface CreateBillResponseModel {
  status: string;
  bill: Bill;
  message: string;
}

export interface UpdateBillResponseModel {
  status: string;
  message: string;
}

export interface CreateBudgetResponseModel {
  status: string;
  message: string;
  budget: Budget;
}

export interface RetrieveBudgetsResponseModel {
  status: string;
  budgets: Budget[];
}
