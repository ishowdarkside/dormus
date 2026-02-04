import { TaskPriority } from "@/models/Kabanan.ts";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils.ts";

interface TaskPriorityLabelProps {
  priority: TaskPriority;
}

export const TaskPriorityLabel = ({ priority }: TaskPriorityLabelProps) => {
  const { t } = useTranslation();

  const priorityMapper = {
    [TaskPriority.TaskPriorityHigh]: t("high"),
    [TaskPriority.TaskPriorityLow]: t("low"),
    [TaskPriority.TaskPriorityMedium]: t("medium"),
  };

  const style = cn(
    "text-xs uppercase py-1 px-4 border rounded-full",
    priority === TaskPriority.TaskPriorityLow && "text-[#008236] bg-[#008236]/10 border-[#008236]",
    priority === TaskPriority.TaskPriorityMedium && "text-[#1447E6] bg-[#1447E6]/10 border-[#1447E6]",
    priority === TaskPriority.TaskPriorityHigh && "text-[#C70036] bg-[#C70036]/10 border-[#C70036]",
  );
  return <div className={style}>{priorityMapper[priority]}</div>;
};
