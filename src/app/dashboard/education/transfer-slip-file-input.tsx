"use client";

import type { ChangeEvent } from "react";
import { useId, useRef, useState } from "react";

export function TransferSlipFileInput() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFileName(event.currentTarget.files?.[0]?.name ?? "");
  }

  return (
    <div className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/32 px-3 py-2 text-sm text-white/72">
      <input
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only pointer-events-none"
        id={inputId}
        name="slip"
        onChange={handleFileChange}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <button
        aria-controls={inputId}
        className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-white px-3 text-xs font-bold text-black transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/28"
        onClick={openFilePicker}
        type="button"
      >
        Choose File
      </button>
      <span aria-live="polite" className="min-w-0 select-none truncate text-sm font-semibold text-white/72">
        {fileName || "No file chosen"}
      </span>
    </div>
  );
}
