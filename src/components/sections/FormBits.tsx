"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { maskPhone } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Cross } from "@/components/orthodox/Cross";

export const fieldClass = "h-11 bg-white/75 text-base border-input focus-visible:border-lapis";

export function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="label-sc text-[0.95rem] text-ink">
        {label}
        {required ? <span className="text-cinnabar" aria-hidden="true">*</span> : <span className="text-[0.8rem] font-normal text-ink-faint">({t("form.optional")})</span>}
      </Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[0.85rem] text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[0.88rem] text-cinnabar" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ id, value, onChange, error, type = "text", autoComplete, placeholder, hint }: { id: string; value: string; onChange: (v: string) => void; error?: string; type?: string; autoComplete?: string; placeholder?: string; hint?: boolean }) {
  return (
    <Input
      id={id}
      type={type}
      value={value}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      className={fieldClass}
    />
  );
}

export function PhoneInput({ id, value, onChange, error }: { id: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <Input
      id={id}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      placeholder="(000)-000-0000"
      value={value}
      onChange={(e) => onChange(maskPhone(e.target.value))}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : `${id}-hint`}
      className={cn(fieldClass, "tabular-nums")}
      maxLength={14}
    />
  );
}

export function TextArea({ id, value, onChange, error, rows = 4, placeholder }: { id: string; value: string; onChange: (v: string) => void; error?: string; rows?: number; placeholder?: string }) {
  return (
    <Textarea
      id={id}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className="min-h-28 bg-white/75 text-base"
    />
  );
}

export function SuccessDialog({ open, onClose, title, text, reference, action }: { open: boolean; onClose: () => void; title: string; text: string; reference?: string; action?: { href: string; label: string } }) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border border-[#d5bd8c] bg-vellum p-6 text-center sm:max-w-md">
        <div className="grid justify-items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-verdigris/15 text-verdigris">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </span>
          <DialogTitle className="font-heading text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-base text-ink-soft">{text}</DialogDescription>
          {reference && (
            <p className="label-sc rounded border border-dashed border-ochre px-3 py-1 text-sm">
              {t("form.reference")}: {reference}
            </p>
          )}
          <p className="text-[0.85rem] text-ink-faint">{t("sample.noData")}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {action && (
              <Link href={action.href} onClick={onClose} className="btn-lavra btn-primary">
                {action.label}
              </Link>
            )}
            <button type="button" onClick={onClose} className={action ? "btn-lavra btn-ghost" : "btn-lavra btn-primary"}>
              <Cross variant="byzantine" className="size-3.5" />
              {t("action.close")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
