import { Button, FormInput } from "@/components";
import { useTranslation } from "react-i18next";
import type { OnboardingType } from "@/modules/Auth/types.ts";
import { useFamilyNameScreen } from "@/modules/Auth/components/Signup/hooks";

interface PropTypes {
  onNavigateNext: VoidFunction;
  onNavigateToLogin: VoidFunction;
}

export const FamilyNameScreen = ({ onNavigateNext, onNavigateToLogin }: PropTypes) => {
  const { t } = useTranslation();
  const { handleNextScreen } = useFamilyNameScreen({ onNavigateNext });

  return (
    <>
      <h2 className="text-[32px] text-center">
        {t("welcome_to")}
        <span className="text-cuatro font-titles text-[48px] leading-none"> Dormus</span>
      </h2>
      <p className="text-center text-xl font-light leading-none mb-6">{t("where_my_roots_are")}</p>
      <FormInput<OnboardingType> name="family_name" placeholder={t("family_name")} />
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={onNavigateToLogin}>
          {t("already_user")}
        </Button>
        <Button className="flex-1" onClick={handleNextScreen}>
          {t("continue")}
        </Button>
      </div>
    </>
  );
};
