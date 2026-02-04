import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import { useAuthToken } from "@/hooks";

export const Waitlist = () => {
  const { t } = useTranslation();
  const { handleAuthTokenRemove } = useAuthToken();

  const handleCancellation = async () => {
    await handleAuthTokenRemove({ redirectToAuth: true });
  };

  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      <img src="/waitlist.svg" className="max-w-[300px] mb-8" />
      <h2 className="text-4xl max-w-[700px]  leading-13 text-center">{t("account_created_not_active")}</h2>
      <div className="text-center mt-4 text-neutral-500 font-light">
        <p>{t("account_created_not_active_description")}</p>
        <p>{t("once_approved_refresh")}</p>
      </div>
      <Button onClick={handleCancellation} className="mt-16">
        {t("cancel_go_back")}
      </Button>
    </div>
  );
};
