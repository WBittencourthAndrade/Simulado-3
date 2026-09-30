"use client";

import React from "react";
import { Minus, Plus, Type } from "lucide-react";

export interface FontSettings {
  size: number; // px
  family: "sans" | "serif";
}

interface FontControlProps {
  settings: FontSettings;
  onChange: (settings: FontSettings) => void;
  variant?: "light" | "dark";
}

export function FontControl({ settings, onChange, variant = "dark" }: FontControlProps) {
  const isDark = variant === "dark";

  const base = isDark
    ? "text-slate-300 hover:text-white hover:bg-slate-800"
    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100";

  const divider = isDark ? "bg-slate-700" : "bg-slate-300";

  const dec = () => onChange({ ...settings, size: Math.max(13, settings.size - 1) });
  const inc = () => onChange({ ...settings, size: Math.min(21, settings.size + 1) });
  const toggleFamily = () =>
    onChange({ ...settings, family: settings.family === "serif" ? "sans" : "serif" });

  return (
    <div
      className={`flex items-center gap-0.5 rounded-xl p-0.5 border ${
        isDark ? "border-slate-700 bg-slate-900/60" : "border-slate-300 bg-white"
      }`}
      title="Ajustar fonte (tamanho e estilo)"
    >
      <button
        type="button"
        onClick={dec}
        disabled={settings.size <= 13}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 cursor-pointer ${base}`}
        aria-label="Diminuir fonte"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span
        className={`min-w-[2.5rem] text-center text-[11px] font-bold tabular-nums ${
          isDark ? "text-slate-200" : "text-slate-700"
        }`}
      >
        {settings.size}px
      </span>

      <button
        type="button"
        onClick={inc}
        disabled={settings.size >= 21}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 cursor-pointer ${base}`}
        aria-label="Aumentar fonte"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className={`w-px h-5 mx-0.5 ${divider}`} />

      <button
        type="button"
        onClick={toggleFamily}
        className={`w-9 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${base}`}
        aria-label="Alternar entre fonte serifada e sans-serif"
        title={settings.family === "serif" ? "Fonte: Serifada (clique para sem serifa)" : "Fonte: Sem serifa (clique para serifada)"}
      >
        <span
          className="text-[13px] font-black leading-none"
          style={{ fontFamily: settings.family === "serif" ? 'Georgia, "Times New Roman", serif' : "inherit" }}
        >
          Aa
        </span>
      </button>
    </div>
  );
}
