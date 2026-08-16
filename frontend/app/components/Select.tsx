"use client";

/**
 * Custom dropdown that fully replaces native <select>.
 *
 * Native selects delegate their open dropdown to the OS/browser, which mostly
 * ignores author CSS (this is especially true on macOS Safari/Chrome) — no
 * matter what we set on `.select-surface`, the popup can still render with
 * the wrong colors, wrong radius, or misaligned position. This component
 * renders its own listbox in React, so it always looks and behaves the same
 * everywhere.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  size?: "md" | "sm";
  "aria-label"?: string;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "აირჩიეთ",
  id,
  className = "",
  disabled = false,
  size = "md",
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reactId = useId();
  const listboxId = `${id || reactId}-listbox`;

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlighted] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [open, highlighted]);

  function openMenu() {
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function toggleMenu() {
    if (open) {
      setOpen(false);
    } else {
      openMenu();
    }
  }

  function commit(index: number) {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  }

  function nextEnabledIndex(from: number, dir: 1 | -1) {
    let i = from;
    for (let steps = 0; steps < options.length; steps++) {
      i += dir;
      if (i < 0) i = options.length - 1;
      if (i > options.length - 1) i = 0;
      if (!options[i]?.disabled) return i;
    }
    return from;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (
      ["ArrowDown", "ArrowUp", "Enter", " ", "Escape", "Home", "End"].includes(
        e.key,
      )
    ) {
      e.preventDefault();
    }
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        openMenu();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlighted((h) => nextEnabledIndex(h, 1));
    } else if (e.key === "ArrowUp") {
      setHighlighted((h) => nextEnabledIndex(h, -1));
    } else if (e.key === "Home") {
      setHighlighted(0);
    } else if (e.key === "End") {
      setHighlighted(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      commit(highlighted);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  const dense = size === "sm";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-slate-600 bg-slate-800 text-left text-slate-100 shadow-sm transition-colors hover:border-slate-500 hover:bg-slate-800/90 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/35 disabled:cursor-not-allowed disabled:opacity-50 ${
          dense
            ? "min-h-9.5 px-3 py-2 text-sm"
            : "min-h-12 px-4 py-3 text-base"
        } ${className}`.trim()}>
        <span className={`truncate ${!selected ? "text-slate-400" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className="ds-scale-in absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-1.5 shadow-xl shadow-black/40">
          {options.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-slate-500">
              არჩევანი არ არის
            </li>
          ) : (
            options.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled}
                onMouseEnter={() => !opt.disabled && setHighlighted(i)}
                onClick={() => commit(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  opt.disabled
                    ? "cursor-not-allowed text-slate-500"
                    : i === highlighted
                      ? "bg-orange-500/15 text-orange-300"
                      : "text-slate-200 hover:bg-slate-700/70"
                }`}>
                <span className="truncate">{opt.label}</span>
                {opt.value === value && (
                  <Check className="h-4 w-4 shrink-0 text-orange-400" />
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
