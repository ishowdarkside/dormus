import { type ChangeEvent, useState } from "react";
import { emailRegex } from "@/utils/common.ts";
import { requestMagicToken, validatePhoneNumberService } from "@/modules/Auth/services.ts";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const useLogin = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isEmailInput, setIsEmailInput] = useState(true);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const isSubmitButtonDisabled = (isEmailInput && !email) || (!isEmailInput && (!region || !phoneNumber));

  const handlePhoneNumberChange = (e: string) => setPhoneNumber(e);
  const handleRegionChange = (e: string) => setRegion(e);
  const switchInputType = () => setIsEmailInput((curr) => !curr);
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

  const validateMail = () => emailRegex.test(email);

  const { mutateAsync: handleLoginLinkMutation } = useMutation({
    mutationFn: async () => {
      if (isEmailInput && !validateMail()) throw new Error(t("invalid_email"));

      if (isEmailInput) {
        return await requestMagicToken({ identifier: email, lang: localStorage.getItem("preferences-language") });
      }

      const response = await validatePhoneNumberService({ phone_number: phoneNumber, region: region });
      if (!response.data.is_valid) throw new Error(t("invalid_as_per_region"));
      return await requestMagicToken({ identifier: phoneNumber, region: region, lang: localStorage.getItem("preferences-language") });
    },

    onError: (err) => {
      toast.error(err.message);
    },
    onSuccess: (res) => {
      if (res?.data.status === "success") setIsEmailSent(true);
    },
  });
  return {
    email,
    region,
    handleEmailChange,
    switchInputType,
    isEmailInput,
    handlePhoneNumberChange,
    handleRegionChange,
    handleLoginLinkMutation,
    isSubmitButtonDisabled,
    isEmailSent,
  };
};
