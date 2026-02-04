import { useFormContext } from "react-hook-form";
import type { OnboardingType } from "@/modules/Auth/types.ts";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const useFamilyNameScreen = ({ onNavigateNext }: { onNavigateNext: VoidFunction }) => {
  const { watch } = useFormContext<OnboardingType>();
  const { t } = useTranslation();

  const familyName = watch("family_name");
  const handleNextScreen = () => {
    if (familyName.length < 5) {
      toast.error(t("family_name_insufficient_length"));
      return;
    }
    onNavigateNext();
  };

  return { handleNextScreen };
};
