import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { PATHS } from "@/router/paths.ts";

export const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full ">
      <span className="text-9xl font-black text-cinco  tracking-widest">404</span>
      <span className="text-2xl font-light text-seis ">{t("page_not_found")}</span>
      <Button className="mt-8" onClick={() => navigate(PATHS.App)}>
        <ArrowLeft /> {t("back_to_homepage")}
      </Button>
    </div>
  );
};
