"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { value, setValue } as any)
          : child
      )}
    </div>
  );
}

export function TabsList({ className, value, setValue, ...props }: any) {
  return (
    <div
      className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1", className)}
      {...props}
    >
      {React.Children.map(props.children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { currentValue: value, setValue } as any)
          : child
      )}
    </div>
  );
}

export function TabsTrigger({ value, currentValue, setValue, className, ...props }: any) {
  const isActive = value === currentValue;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-all",
        isActive ? "bg-white shadow-sm" : "text-gray-600 hover:text-gray-900",
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    />
  );
}

export function TabsContent({ value, currentValue, className, ...props }: any) {
  if (value !== currentValue) return null;
  return <div className={cn("mt-2", className)} {...props} />;
}
