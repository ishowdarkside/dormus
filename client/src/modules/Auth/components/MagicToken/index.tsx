import { LoadingSpinner } from "@/components";
import { useConsumeMagicToken } from "@/modules/Auth/hooks";

export const MagicToken = () => {
  useConsumeMagicToken();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
};
