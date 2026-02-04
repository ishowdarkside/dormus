import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ServerError } from "@/models/errors.ts";
import { toast } from "react-toastify";
import { PATHS } from "@/router/paths.ts";
import type { FieldErrors } from "react-hook-form";
import type { JoinOnboardingType } from "@/modules/Auth/types.ts";
import { useTranslation } from "react-i18next";
import { useAuthToken } from "@/hooks";
import { useNavigate } from "react-router";
import { joinFamilyService } from "@/modules/Auth/services.ts";

export const useJoinFamily = () => {
  const { t } = useTranslation();
  const { handleAuthTokenSet } = useAuthToken();
  const navigate = useNavigate();

  const { mutate: joinFamilyMutate, isPending } = useMutation({
    mutationFn: async (data: JoinOnboardingType) => {
      const response = await joinFamilyService(data);
      return response;
    },
    onError: (res: AxiosError<ServerError>) => {
      if (!res.response) return toast.error(t("something_went_wrong"));
      if (!res.response?.data.errors) return toast.error(t(res.response?.data.message ?? ""));

      toast.error(t(Object.values(res.response.data.errors).at(0) ?? "something_went_wrong"));
    },
    onSuccess: async (res) => {
      toast.success(t(res.data.message));

      if (res.data.token) {
        handleAuthTokenSet(res.data.token);
        navigate(PATHS.Waitlist, { replace: true });
      }
    },
  });

  const handleErrors = (data: FieldErrors<JoinOnboardingType>) => {
    toast.error(Object.values(data)?.at(0)?.message);
  };

  return { joinFamilyMutate, isPending, handleErrors };
};
