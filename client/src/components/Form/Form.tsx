import type { ReactNode } from "react";
import { type DefaultValues, type FieldValues, FormProvider, useForm } from "react-hook-form";

interface PropTypes<T> {
  defaultValues?: DefaultValues<T>;
  children: ReactNode;
  onSubmit?: (data: T) => void;
}

export function Form<T extends FieldValues>({ children, defaultValues, onSubmit }: PropTypes<T>) {
  const methods = useForm<T>({
    defaultValues: defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  return (
    <FormProvider {...methods}>
      <form className="h-full " onSubmit={methods.handleSubmit((data) => onSubmit?.(data))}>
        {children}
      </form>
    </FormProvider>
  );
}
