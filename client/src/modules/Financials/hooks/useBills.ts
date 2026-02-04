import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";
import { FinancialsQueryKeys } from "@/modules/Financials/queryKeys.ts";
import { CreateBillService, DeleteBillService, RetrieveBillsService, UpdateBillService } from "@/modules/Financials/services.ts";
import type { Bill } from "@/models/Bill.ts";
import { SERVER_RESPONSE_STATUS } from "@/utils/common.ts";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const useBills = () => {
  const { data: bills, isLoading: isLoadingBills } = useQuery<Bill[], AxiosError<ServerError>>({
    queryKey: FinancialsQueryKeys.Bills,
    queryFn: async () => await RetrieveBillsService().then((res) => res.data.bills),
  });

  return { bills, isLoadingBills };
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: createBillMutation } = useMutation({
    mutationFn: CreateBillService,
    onSuccess: (res) => {
      const bills = queryClient.getQueryData<Bill[]>(FinancialsQueryKeys.Bills);
      if (!bills) return;

      const isExisting = bills.some((data) => data.id === res.data.bill.id);
      if (isExisting) return;

      const updatedBills = [...bills, res.data.bill];
      queryClient.setQueryData(FinancialsQueryKeys.Bills, updatedBills);
    },
  });

  return { createBillMutation };
};

export const useUpdateBill = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutateAsync: updateBillMutation } = useMutation({
    mutationFn: async (data: Partial<Bill>) => await UpdateBillService(data.id ?? 0, { ...data, id: undefined }),
    onSuccess: (res, payload) => {
      if (res.data.status !== SERVER_RESPONSE_STATUS.Success) return toast.error(t(res.data.message));

      const bills = queryClient.getQueryData<Bill[]>(FinancialsQueryKeys.Bills);
      if (!bills?.length) return;

      const updatedBills = bills.map((bill) => (bill.id === payload.id ? { ...bill, ...payload } : { ...bill }));
      queryClient.setQueryData(FinancialsQueryKeys.Bills, updatedBills);
    },
    onError: (err: AxiosError<ServerError>) => {
      if (err.response?.data.errors) {
        toast.error(t(Object.values(err.response.data.errors)[0]));
        return;
      }

      toast.error(t(err.response?.data?.message ?? ""));
    },
  });

  return { updateBillMutation };
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteBillMutation } = useMutation({
    mutationFn: DeleteBillService,
    onSuccess: (_, payload) => {
      const bills = queryClient.getQueryData<Bill[]>(FinancialsQueryKeys.Bills);
      if (!bills?.length) return;

      const updatedBills = bills.filter((e) => e.id !== payload);
      queryClient.setQueryData(FinancialsQueryKeys.Bills, updatedBills);
    },
  });

  return { deleteBillMutation };
};
