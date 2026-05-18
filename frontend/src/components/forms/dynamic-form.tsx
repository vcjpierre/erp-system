"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "tel" | "date";
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, unknown>) => void;
  submitLabel?: string;
  loading?: boolean;
}

export function DynamicForm({ fields, onSubmit, submitLabel = "Submit", loading }: DynamicFormProps) {
  const shape: Record<string, z.ZodType> = {};
  fields.forEach((f) => {
    let validator: z.ZodTypeAny = z.string();
    if (f.required) validator = (validator as z.ZodString).min(1, `${f.label} is required`);
    if (f.minLength) validator = (validator as z.ZodString).min(f.minLength);
    if (f.maxLength) validator = (validator as z.ZodString).max(f.maxLength);
    if (f.pattern) validator = (validator as z.ZodString).regex(f.pattern);
    if (f.type === "email") validator = (validator as z.ZodString).email();
    if (f.type === "number") validator = z.coerce.number();
    shape[f.name] = validator;
  });

  const schema = z.object(shape);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={form.handleSubmit((data) => onSubmit(data as Record<string, unknown>))} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            {...form.register(field.name)}
          />
          {form.formState.errors[field.name] && (
            <p className="text-xs text-destructive">
              {form.formState.errors[field.name]?.message as string}
            </p>
          )}
        </div>
      ))}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : submitLabel}
      </Button>
    </form>
  );
}
