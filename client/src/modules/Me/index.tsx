import { Button, LanguagePicker } from "@/components";
import { useTranslation } from "react-i18next";
import { useAuthToken } from "@/hooks";

export const Me = () => {
  const { t } = useTranslation();
  const { handleAuthTokenRemove } = useAuthToken();

  return (
    <div className="flex flex-col items-start gap-5">
      <LanguagePicker />
      <Button
        onClick={async () => {
          await handleAuthTokenRemove({ redirectToAuth: true });
        }}
      >
        {t("logout")}
      </Button>
    </div>
  );
};
