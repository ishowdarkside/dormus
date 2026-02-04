import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components";
import React, { type JSX, type ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export interface DropdownOptionShape {
  label?: string;
  value?: string | number;
  icon?: JSX.Element;
  handler?: VoidFunction;
}

interface PropTypes {
  trigger: ReactNode;
  label?: string;
  options: DropdownOptionShape[];
  selectedOptions?: any[];
}

export const Dropdown = ({ trigger, label, options, selectedOptions = [] }: PropTypes) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full max-h-75 max-w-112.5">
        {label && (
          <>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {options.map((option, index) => (
          <React.Fragment key={index}>
            <DropdownMenuItem
              onSelect={option.handler}
              className={cn(selectedOptions && selectedOptions.includes(option.value) && "bg-neutral-100")}
            >
              {option.icon ? option.icon : ""} {option.label}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
