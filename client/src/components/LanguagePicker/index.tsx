import { Button, Dropdown } from "@/components";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export const LanguagePicker = () => {
  const { t, i18n } = useTranslation();

  const languageOptions = [
    {
      label: t("bosnian"),
      value: "bs",
      handler: () => {
        i18n.changeLanguage("bs");
        localStorage.setItem("preferences-language", "bs");
      },
    },
    {
      label: t("english"),
      value: "en",
      handler: () => {
        i18n.changeLanguage("en");
        localStorage.setItem("preferences-language", "en");
      },
    },
  ];

  return (
    <Dropdown
      trigger={
        <Button variant="secondary">
          <Globe /> {t("choose_your_language")}
        </Button>
      }
      options={languageOptions}
    />
  );
};
