import { Join, Login, Signup } from "@/modules/Auth/components";
import { useAuth } from "@/modules/Auth/hooks";
import { ACTIVE_SCREEN } from "@/modules/Auth/types.ts";
import { LanguagePicker } from "@/components";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const Auth = () => {
  const { activeScreen, navigateToLoginScreen, navigateToStartScreen, navigateToJoinScreen } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = `Dormus - ${t("start_your_journey")}`;
  }, [i18n.language]);
  return (
    <div className="flex h-full">
      <div className="bg-[url('/layer_bg.jpg')] p-6 max-w-150 w-full bg-cover bg-center">
        <LanguagePicker />
      </div>
      <div className="flex-1">
        {activeScreen === ACTIVE_SCREEN.Register && <Signup onNavigateToJoinScreen={navigateToJoinScreen} />}
        {activeScreen === ACTIVE_SCREEN.Join && (
          <Join onNavigateBack={navigateToStartScreen} onNavigateToLoginScreen={navigateToLoginScreen} />
        )}
        {activeScreen === ACTIVE_SCREEN.Login && <Login onNavigateBack={navigateToStartScreen} />}
      </div>
    </div>
  );
};
