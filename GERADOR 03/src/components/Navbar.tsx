"use client";

import React from "react";
import {
  Sparkles,
  BookOpen,
  AlertTriangle,
  BarChart3,
  Settings,
  HelpCircle,
  History,
  FileUp,
} from "lucide-react";
import { FontControl, FontSettings } from "./FontControl";

export const MAIN_TABS = [
  { id: "generator", label: "Gerador", short: "Gerar", icon: Sparkles },
  { id: "pdf", label: "Importar PDF", short: "PDF", icon: FileUp },
  { id: "caderno-erros", label: "Caderno de Erros", short: "Erros", icon: AlertTriangle },
  { id: "stats", label: "Desempenho", short: "Desempenho", icon: BarChart3 },
  { id: "history", label: "Histórico", short: "Histórico", icon: History },
] as const;

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  apiKeySet: boolean;
  totalAnswered: number;
  overallAccuracy: number;
  fontSettings: FontSettings;
  onFontChange: (settings: FontSettings) => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenHelp,
  apiKeySet,
  totalAnswered,
  overallAccuracy,
  fontSettings,
  onFontChange,
}: NavbarProps) {
  return (
    <header className="no-print sticky top-0 z-40">
      {/* Premium top header */}
      <div className="bg-slate-950 text-white border-b border-slate-800/80 shadow-lg shadow-slate-950/10">
        {/* Gold premium line */}
        <div
          className="h-0.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, #c9a227 0%, #e9c659 25%, #c9a227 50%, #8a6d1b 100%)",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand */}
            <button
              onClick={() => setActiveTab("generator")}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400/30 group-hover:scale-105 transition-transform">
                <BookOpen className="w-[18px] h-[18px]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-[15px] tracking-tight text-white">
                    Especialista
                    <span className="font-black" style={{ color: "#e9c659" }}>
                      {" "}
                      FCC
                    </span>
                  </span>
                  <span className="hidden sm:inline text-[9px] bg-white/10 text-amber-200 border border-amber-400/30 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Nível Médio
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5 hidden xs:block sm:block">
                  Raio-X & Questões Inéditas
                </p>
              </div>
            </button>

            {/* Desktop Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {MAIN_TABS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-white/10 text-white ring-1 ring-white/15"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : ""}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">
              <FontControl settings={fontSettings} onChange={onFontChange} variant="dark" />

              <button
                onClick={onOpenHelp}
                title="Diretrizes FCC"
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-slate-800 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={onOpenSettings}
                title="Configurações"
                className="relative flex w-9 h-9 items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-slate-800 transition-colors cursor-pointer"
              >
                <Settings className="w-[18px] h-[18px]" />
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                    apiKeySet ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact status strip (desktop) */}
      {totalAnswered > 0 && (
        <div className="hidden md:block bg-slate-900/80 border-b border-slate-800/60 text-[11px] text-slate-400">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong className="text-slate-200">{totalAnswered}</strong> questões resolvidas •
              Taxa de acerto:{" "}
              <strong className="text-emerald-400">{overallAccuracy}%</strong> • Padrão FCC Nível Médio
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
