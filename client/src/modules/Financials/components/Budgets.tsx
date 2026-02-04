import { BudgetProgressBar, CreateEditBudgetModal } from "@/modules/Financials/components";
import { useBudgets } from "@/modules/Financials/hooks";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components";
import { useTranslation } from "react-i18next";
import { DotsThree } from "phosphor-react";
import { useState } from "react";
import type { Budget } from "@/models/Budget.ts";

export const Budgets = () => {
  const { t } = useTranslation();
  const { budgets } = useBudgets();

  const [selectedBudgetItem, setSelectedBudgetItem] = useState<Budget | null>(null);

  return (
    <div className=" flex-1 h-full">
      <CreateEditBudgetModal selectedBudgetItem={selectedBudgetItem} setSelectedBudgetItem={setSelectedBudgetItem} />

      <Table className="mt-8">
        <TableHeader>
          <TableRow>
            <TableHead>{t("budget_name")}</TableHead>
            <TableHead>{t("price")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets?.map((budget) => (
            <TableRow>
              <TableCell>{budget.name}</TableCell>
              <TableCell>
                <BudgetProgressBar budget={budget} />
              </TableCell>
              <TableCell className="flex justify-end items-center">
                <Button variant="ghost" onClick={() => setSelectedBudgetItem(budget)}>
                  <DotsThree />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
