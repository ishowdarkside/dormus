import { useTranslation } from "react-i18next";
import { Bills, Budgets } from "@/modules/Financials/components";

export const Financials = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto h-full">
      <h2 className="text-3xl mb-8">{t("financials")}</h2>
      <div className="flex h-full gap-12">
        <Bills />
        <Budgets />
      </div>
    </div>
  );
};
