import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-gold/25 bg-gold/5 p-6 text-center",
        className,
      )}
    >
      <FileText aria-hidden="true" className="mx-auto h-7 w-7 text-soft-gold" />
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-text-secondary">{description}</p>
    </div>
  );
}
