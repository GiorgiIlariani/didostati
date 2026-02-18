"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type FormSelectOption = { value: string; label: string };

type FormSelectProps = {
  label: string;
  value: string;
  options: FormSelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  "aria-label"?: string;
};

export function FormSelect({
  label,
  value,
  options,
  onChange,
  required,
  placeholder = "Select…",
  "aria-label": ariaLabel,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const display = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-slate-300 font-semibold mb-2">
        {label}
        {required && <span className="text-orange-400 ml-0.5">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || label}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-left text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all hover:border-slate-600"
      >
        <span className={selectedOption ? "" : "text-slate-500"}>{display}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full py-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl shadow-black/30 max-h-56 overflow-auto"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-2.5 cursor-pointer transition-colors ${
                value === opt.value
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-slate-200 hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
