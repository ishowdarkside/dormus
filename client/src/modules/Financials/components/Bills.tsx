import { useTranslation } from "react-i18next";
import { useBills } from "@/modules/Financials/hooks";
import { CreateEditBillModal } from "@/modules/Financials/components/CreateEditBillModal.tsx";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components";
import { format } from "date-fns";
import { BillStatusTag } from "@/modules/Financials/components/BillStatusTag.tsx";
import { DotsThree } from "phosphor-react";
import { useState } from "react";
import type { Bill } from "@/models/Bill.ts";

export const Bills = () => {
  const { t } = useTranslation();
  const { bills } = useBills();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  return (
    <>
      <div className="flex-1">
        <CreateEditBillModal selectedBill={selectedBill} setSelectedBill={setSelectedBill} />
        <Table className="mt-8">
          <TableHeader>
            <TableRow>
              <TableHead>{t("bill_name")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("due_date")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills?.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="truncate max-w-1">{bill.name}</TableCell>
                <TableCell>{bill.price}€</TableCell>
                <TableCell>
                  <BillStatusTag status={bill.status} />
                </TableCell>
                <TableCell>{format(bill.due_date, "dd MMM yyyy")}</TableCell>
                <TableCell className="flex justify-end">
                  <Button variant="ghost" onClick={() => setSelectedBill(bill)}>
                    <DotsThree size={24} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
