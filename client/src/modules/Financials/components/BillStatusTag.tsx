import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";
import { BillStatusPaid } from "@/models/Bill.ts";

export const BillStatusTag = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  return <div className={cn(status === BillStatusPaid ? "text-green-600 " : " text-red-600")}>{t(status)}</div>;
};
