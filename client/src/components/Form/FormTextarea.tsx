import { type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Textarea } from "@/components";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";

interface PropTypes<T> extends InputHTMLAttributes<HTMLTextAreaElement> {
  name: Path<T>;
  placeholder: string;
  regex?: RegExp;
  required?: boolean;
}

export function FormTextarea<T extends FieldValues>({ name, placeholder, regex, required = true, ...rest }: PropTypes<T>) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  return (
    <Textarea
      placeholder={placeholder}
      {...rest}
      className={cn(errors[name] && "border-destructive placeholder:text-destructive bg-red-50", rest.className ?? "")}
      {...register(name, {
        required: {
          value: required,
          message: t(`${name}_required`),
        },
      })}
    />
  );
}
