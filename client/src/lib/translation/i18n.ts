import en from "@/lib/translation/en.json";
import bs from "@/lib/translation/bs.json";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const acceptedLangs = ["en", "bs"];
const retrieveLangPreference = () => {
  const preference = localStorage.getItem("preferences-language");
  if (!preference || !acceptedLangs.includes(preference)) return "en";

  return preference;
};
const resources = {
  en: {
    translation: en,
  },
  bs: {
    translation: bs,
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: retrieveLangPreference(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
