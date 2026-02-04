import { useTranslation } from "react-i18next";
import { Button, Input, RegionPicker } from "@/components";
import { useLogin } from "@/modules/Auth/hooks";
import { ArrowLeft } from "lucide-react";

interface PropTypes {
  onNavigateBack: VoidFunction;
}
export const Login = ({ onNavigateBack }: PropTypes) => {
  const { t } = useTranslation();
  const {
    email,
    handleEmailChange,
    handleRegionChange,
    handlePhoneNumberChange,
    switchInputType,
    isEmailInput,
    handleLoginLinkMutation,
    isSubmitButtonDisabled,
    isEmailSent,
  } = useLogin();

  if (isEmailSent)
    return (
      <div className="max-w-113 mx-auto w-full   h-full flex items-center">
        <div className="w-full">
          <h2 className="text-[32px] mb-4">{t("login_email_sent")}</h2>
          <p className="text-neutral-600">{t("login_email_sent_description")}</p>

          <div className="flex gap-2 mt-6">
            <Button onClick={onNavigateBack}>
              <ArrowLeft />
              {t("back_to_homepage")}
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-113 mx-auto w-full   h-full flex items-center">
      <div className="w-full">
        <h2 className="text-[32px] mb-4">{t("get_login_link")}</h2>
        <p className="text-neutral-600">{t("get_login_link_desc")}</p>

        <div className="mt-4">
          {isEmailInput && <Input placeholder={t("email")} value={email} onChange={handleEmailChange} />}
          {!isEmailInput && <RegionPicker handleSelectRegion={handleRegionChange} handlePhoneNumber={handlePhoneNumberChange} />}
        </div>
        <span onClick={switchInputType} className="underline text-cinco mt-2 block cursor-pointer text-sm">
          {t(isEmailInput ? "continue_with_phone_number" : "continue_with_email")}
        </span>

        <div className="flex gap-2 mt-6">
          <Button onClick={onNavigateBack} variant="outline" className="flex-1">
            {t("back")}
          </Button>

          <Button disabled={isSubmitButtonDisabled} onClick={() => handleLoginLinkMutation()} className="flex-1">
            {t("continue")}
          </Button>
        </div>
      </div>
    </div>
  );
};
