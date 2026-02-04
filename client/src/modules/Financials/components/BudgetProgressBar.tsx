import type { Budget } from "@/models/Budget.ts";
import { cn } from "@/lib/utils.ts";

export const BudgetProgressBar = ({ budget }: { budget: Budget }) => {
  const progress = budget.progress / budget.price > 1 ? 100 : (budget.progress / budget.price) * 100;

  console.log(progress);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs mt-2">
        {budget.progress}€ / {budget.price}€
      </p>
      <div className="bg-white border-neutral-200 border w-full h-2 rounded-full  mb-2">
        <div className={cn(`h-2 bg-cinco rounded-full`, progress ? 0 && `${progress}%` : "w-0")}></div>
      </div>
    </div>
  );
};
