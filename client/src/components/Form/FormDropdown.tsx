import { Dropdown, Input } from "@/components";
import { type FieldValue, type FieldValues, type Path, type PathValue, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import type { JSX, ReactElement } from "react";

interface FormDropdownOptionsShape<T> {
  label: string;
  icon?: JSX.Element;
  handler?: VoidFunction;
  value: PathValue<T, Path<T>>;
}

interface PropTypes<T> {
  trigger?: string;
  options: FormDropdownOptionsShape<T>[];
  label?: string;
  name: Path<T>;
  required?: boolean;
  customTrigger?: ReactElement;
  selectMultiple?: boolean;
}

export function FormDropdown<T extends FieldValues>({
  label,
  options,
  trigger,
  name,
  required = true,
  customTrigger,
  selectMultiple = false,
}: PropTypes<T>) {
  const { t } = useTranslation();
  const {
    setValue,
    watch,
    register,
    formState: { errors },
  } = useFormContext<T>();
  const selectedValue = watch(name);
  const selectedOption = options.find((o) => o.value === selectedValue);

  const optionsWithUpdateHandlers = options.map((e) => ({
    ...e,
    handler: () => {
      if (selectMultiple) {
        const current = (selectedValue ?? []) as unknown as FieldValue<T>[];
        const newValue = current.some((c) => c === e.value) ? current.filter((c) => c !== e.value) : [...current, e.value];
        setValue(name, newValue as unknown as FieldValue<T>);
        return;
      }

      setValue(name, e.value as FieldValue<T>);
    },
  }));
  return (
    <Dropdown
      trigger={
        customTrigger ? (
          customTrigger
        ) : (
          <Input
            className={cn("cursor-pointer", errors[name] && "border-destructive placeholder:text-destructive text-destructive bg-red-50")}
            placeholder={trigger}
            readOnly
            value={selectedOption?.label}
          />
        )
      }
      selectedOptions={selectMultiple ? selectedValue : []}
      options={optionsWithUpdateHandlers}
      label={label}
      {...register(name, {
        required: { value: required, message: t(`${name}_required`) },
      })}
    />
  );
}
