import { type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Input } from "@/components";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";

interface PropTypes<T> extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>;
  placeholder: string;
  regex?: RegExp;
  required?: boolean;
}

export function FormInput<T extends FieldValues>({ name, placeholder, regex, required = true, ...rest }: PropTypes<T>) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const obj =
    rest.type === "number"
      ? { valueAsNumber: true }
      : {
          pattern: regex
            ? {
                value: regex,
                message: t(`invalid_${name}`),
              }
            : undefined,
        };

  return (
    <Input
      placeholder={placeholder}
      {...rest}
      className={cn(errors[name] && "border-destructive placeholder:text-destructive bg-red-50")}
      {...register(name, {
        required: {
          value: required,
          message: t(`${name}_required`),
        },
        ...obj,
      })}
    />
  );
}
