import type { InputHTMLAttributes } from "react";
import { type FieldValue, type FieldValues, type Path, useFormContext } from "react-hook-form";
import { Switch } from "@/components";

interface PropTypes<T> extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>;
}

export function FormSwitch<T extends FieldValues>({ name }: PropTypes<T>) {
  const { setValue, watch } = useFormContext();
  return <Switch onCheckedChange={(e) => setValue(name, e as FieldValue<T>)} defaultChecked={watch(name)} />;
}
