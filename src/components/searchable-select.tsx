"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  colorHex?: string | null;
  textColorHex?: string | null;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  required = false,
  disabled = false,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
      )
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(val: string) {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setSearch("");
  }

  function handleOpen() {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-left
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed bg-white
          ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : ""}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 flex-1 min-w-0">
            {selected.colorHex && (
              <span
                className="inline-block w-4 h-4 rounded-sm flex-shrink-0"
                style={{ backgroundColor: selected.colorHex, color: selected.textColorHex || "#fff" }}
              />
            )}
            <span className="truncate">{selected.label}</span>
          </span>
        ) : (
          <span className="text-slate-400 flex-1">{placeholder}</span>
        )}
        {value && !required ? (
          <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 flex-shrink-0" onClick={handleClear} />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Hidden native input for form required validation */}
      {required && <input type="text" value={value} required tabIndex={-1} className="absolute opacity-0 h-0 w-0" readOnly />}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer..."
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-400 text-center">Aucun résultat</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors
                    ${option.value === value ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"}`}
                >
                  {option.colorHex && (
                    <span
                      className="inline-flex items-center justify-center w-6 h-5 rounded text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: option.colorHex, color: option.textColorHex || "#fff" }}
                    >
                      {option.label.split(" ")[0]?.slice(0, 3)}
                    </span>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-xs text-slate-400 flex-shrink-0">{option.sublabel}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
