import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeFamilyNameService } from "@/modules/FamilyManager/services.ts";
import { SERVER_RESPONSE_STATUS } from "@/utils/common.ts";
import { toast } from "react-toastify";
import { useFamily } from "@/hooks";
import { HooksQueryKeys } from "@/hooks/queryKeys.ts";
import { type ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const useChangeFamilyName = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { family } = useFamily();

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value);

  const { mutate, isPending } = useMutation({
    mutationFn: () => changeFamilyNameService({ name: inputValue ?? "" }),
    onSuccess: (res) => {
      if (res.data.status === SERVER_RESPONSE_STATUS.Success) toast.success(t(res.data.message));
      queryClient.setQueryData(HooksQueryKeys.Family, { ...family, name: inputValue ?? "" });
    },
  });

  useEffect(() => {
    setInputValue(family?.name ?? "");
  }, [family]);

  return { changeFamilyNameMutation: mutate, isPending, inputValue, handleInputChange };
};
