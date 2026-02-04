import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateBudgetItemService, RetrieveBudgetsService } from "@/modules/Financials/services.ts";
import type { Budget } from "@/models/Budget.ts";
import { FinancialsQueryKeys } from "@/modules/Financials/queryKeys.ts";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";

export const useBudgets = () => {
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery<Budget[], AxiosError<ServerError>>({
    queryKey: FinancialsQueryKeys.Budgets,
    queryFn: RetrieveBudgetsService,
  });

  return { isLoadingBudgets, budgets };
};

export const useCreateBudgetItem = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: createBudgetMutation } = useMutation({
    mutationFn: CreateBudgetItemService,
    onSuccess: (res) => {
      const budgets = queryClient.getQueryData<Budget[]>(FinancialsQueryKeys.Budgets);
      if (!budgets) return;

      const updatedBudgets = [...budgets, res.data.budget];
      queryClient.setQueryData(FinancialsQueryKeys.Budgets, updatedBudgets);
    },
  });

  return { createBudgetMutation };
};
