import { Button, FormInput } from "@/components";
import type { JoinOnboardingType } from "@/modules/Auth/types.ts";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";

interface IInviteCodeProps {
  onNavigateToLoginScreen: VoidFunction;
  onNavigateNext: VoidFunction;
  onNavigateBack: VoidFunction;
}

export const OnboardingInviteCode = ({ onNavigateBack, onNavigateToLoginScreen, onNavigateNext }: IInviteCodeProps) => {
  const { t } = useTranslation();
  const { watch } = useFormContext<JoinOnboardingType>();

  const handlerNext = () => {
    const inviteCode = watch("invite_token");
    if (!inviteCode || inviteCode.length !== 8) return toast.error(t("input_valid_invite_code"));
    onNavigateNext();
  };

  return (
    <div className="w-full">
      <h2 className="text-[32px] mb-4">{t("enter_invite_code")}</h2>
      <p className="text-neutral-600">{t("enter_invite_code_desc")}</p>

      <div className="mt-4">
        <FormInput<JoinOnboardingType> name="invite_token" placeholder={t("invite_code_placeholder")} />
      </div>
      <span className=" mt-2 block  text-sm">
        {t("already_member_join_screen")}
        <span onClick={onNavigateToLoginScreen} className="cursor-pointer underline text-cinco">
          {t("get_login_link")}
        </span>
      </span>

      <div className="flex gap-2 mt-6">
        <Button onClick={onNavigateBack} variant="outline" className="flex-1">
          {t("back")}
        </Button>

        <Button onClick={handlerNext} className="flex-1">
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};
