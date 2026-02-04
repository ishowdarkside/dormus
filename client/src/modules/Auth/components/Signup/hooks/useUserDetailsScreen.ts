import { useTranslation } from "react-i18next";
import { type FieldErrors, useFormContext } from "react-hook-form";
import type { OnboardingType } from "@/modules/Auth/types.ts";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { type AxiosError, type AxiosResponse } from "axios";
import type { ServerError } from "@/models/errors.ts";
import { useNavigate } from "react-router";
import { registerUserFamilyService } from "@/modules/Auth/services.ts";
import { PATHS } from "@/router/paths.ts";
import { useAuthToken } from "@/hooks";

export const useUserDetailsScreen = () => {
  const { setValue, register } = useFormContext<OnboardingType>();
  const { t } = useTranslation();

  useEffect(() => {
    register("region", {
      required: { value: true, message: t("region_required") },
    });
    register("phone_number", {
      required: { value: true, message: t("phone_required") },
    });
  }, []);

  const genderOptions = [
    {
      label: t("male"),
      value: "male",
    },
    {
      label: t("female"),
      value: "female",
    },
  ];

  const roleOptions = [
    {
      label: t("child"),
      value: "child",
    },
    {
      label: t("parent"),
      value: "parent",
    },
  ];

  const handleRegionChange = (input: string) => {
    setValue("region", input, { shouldValidate: true });
  };

  const handlePhoneNumberChange = (input: string) => {
    setValue("phone_number", input, { shouldValidate: true });
  };

  return {
    genderOptions,
    roleOptions,
    handleRegionChange,
    handlePhoneNumberChange,
  };
};

export const useRegisterUserMutation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleAuthTokenSet } = useAuthToken();

  const { mutateAsync } = useMutation({
    mutationFn: (data: OnboardingType) => registerUserFamilyService(data),
    onError: (res: AxiosError<ServerError>) => {
      if (!res.response) return toast.error(t("something_went_wrong"));
      if (!res.response?.data.errors) return toast.error(t(res.response?.data.message ?? ""));

      toast.error(t(Object.values(res.response.data.errors).at(0) ?? "something_went_wrong"));
    },
    onSuccess: async (res: AxiosResponse<{ token: string; message: string; status: string }>) => {
      toast.success(t(res.data.message));
      // TO DO: AKO BUDES MORAO, TREBA RAZMISLIT DA UNUTAK OVE FUNKCIJE INVALIDIRAMO I USERA
      handleAuthTokenSet(res.data.token);
      navigate(PATHS.App);
    },
  });

  const handleErrors = (data: FieldErrors<OnboardingType>) => {
    toast.error(Object.values(data)?.at(0)?.message);
  };

  return { mutateAsync, handleErrors };
};
