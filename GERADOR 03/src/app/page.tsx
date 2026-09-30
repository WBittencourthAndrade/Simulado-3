"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar, MAIN_TABS } from "@/components/Navbar";
import { FontSettings } from "@/components/FontControl";
import { GeneratorView } from "@/components/GeneratorView";
import { PdfImportView } from "@/components/PdfImportView";
import { SimuladoView, SavedQuestion } from "@/components/SimuladoView";
import { CadernoErrosView } from "@/components/CadernoErrosView";
import { StatsView } from "@/components/StatsView";
import { HistoryView } from "@/components/HistoryView";
import { SettingsModal } from "@/components/SettingsModal";
import { PrintBookletModal } from "@/components/PrintBookletModal";
import { GuidelinesModal } from "@/components/GuidelinesModal";
import { Settings, FileUp } from "lucide-react";

const DEFAULT_FONT: FontSettings = { size: 16, family: "sans" };

export default function Home() {
  const [activeTab, setActiveTab] = useState("generator");

  // AI Configuration
  // Chave do cliente é opcional (override). Vazia = usa a chave do servidor (.env).
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");

  // Font settings (persisted)
  const [fontSettings, setFontSettings] = useState<FontSettings>(DEFAULT_FONT);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [printModalData, setPrintModalData] = useState<{
    theme: string;
    rayX: any;
    questions: any[];
  } | null>(null);

  // Active simulado session
  const [pdfSimulado, setPdfSimulado] = useState<{
    questions: SavedQuestion[];
    title: string;
    sessionId?: number;
  } | null>(null);

  // Global quick stats
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);

  // Load font settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fcc-font-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.size === "number" &&
          (parsed.family === "sans" || parsed.family === "serif")
        ) {
          setFontSettings(parsed);
        }
      }
    } catch {
      /* ignore */
    }
    setFontLoaded(true);
  }, []);

  // Apply font settings to the document root
  useEffect(() => {
    if (!fontLoaded) return;
    const root = document.documentElement;
    root.style.setProperty("--fcc-fs", `${fontSettings.size}px`);
    root.style.setProperty(
      "--fcc-ff",
      fontSettings.family === "serif"
        ? 'Georgia, Cambria, "Times New Roman", serif'
        : 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    );
    try {
      localStorage.setItem("fcc-font-settings", JSON.stringify(fontSettings));
    } catch {
      /* ignore */
    }
  }, [fontSettings, fontLoaded]);

  const fetchGlobalStats = useCallback(async () => {
    try {
      const res = await fetch("/api/fcc/stats");
      if (res.ok) {
        const data = await res.json();
        setTotalAnswered(data.stats?.totalAnswered || 0);
        setOverallAccuracy(data.stats?.overallAccuracy || 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Premium Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsGuidelinesOpen(true)}
        apiKeySet={true}
        totalAnswered={totalAnswered}
        overallAccuracy={overallAccuracy}
        fontSettings={fontSettings}
        onFontChange={setFontSettings}
      />

      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-28 md:pb-16">
        {activeTab === "generator" && (
          <GeneratorView
            onOpenPrintModal={(data) => setPrintModalData(data)}
            apiKey={apiKey}
            selectedModel={selectedModel}
            onAnswerSubmitted={fetchGlobalStats}
          />
        )}

        {activeTab === "pdf" && (
          <PdfImportView
            apiKey={apiKey}
            selectedModel={selectedModel}
            onStartSimulado={(questions, title) => {
              const sessId = (questions[0] as any)?.sessionId;
              setPdfSimulado({
                questions: questions as SavedQuestion[],
                title,
                sessionId: sessId,
              });
              handleTabChange("simulado");
            }}
          />
        )}

        {activeTab === "simulado" &&
          (pdfSimulado ? (
            <SimuladoView
              questions={pdfSimulado.questions}
              title={pdfSimulado.title}
              sessionId={pdfSimulado.sessionId}
              onTitleChange={(newTitle) => {
                setPdfSimulado((prev) => (prev ? { ...prev, title: newTitle } : null));
              }}
              onExit={() => handleTabChange("history")}
              onAnswerSubmitted={fetchGlobalStats}
            />
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm max-w-md mx-auto my-8">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Nenhum simulado ativo</h3>
              <p className="text-xs text-slate-500 fcc-text">
                Importe um caderno em PDF ou selecione um caderno no Histórico para responder.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleTabChange("pdf")}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Importar PDF
                </button>
                <button
                  onClick={() => handleTabChange("history")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Ver Histórico
                </button>
              </div>
            </div>
          ))}

        {activeTab === "caderno-erros" && (
          <CadernoErrosView
            onGoToGenerator={() => handleTabChange("generator")}
            onRefreshStats={fetchGlobalStats}
          />
        )}

        {activeTab === "stats" && (
          <StatsView onGoToGenerator={() => handleTabChange("generator")} />
        )}

        {activeTab === "history" && (
          <HistoryView
            onGoToGenerator={() => handleTabChange("generator")}
            onStartSimulado={(questions, title, sessionId) => {
              setPdfSimulado({
                questions: questions as unknown as SavedQuestion[],
                title,
                sessionId,
              });
              handleTabChange("simulado");
            }}
            onRefreshStats={fetchGlobalStats}
          />
        )}
      </main>

      {/* Premium bottom navigation (mobile only) */}
      <nav className="no-print md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
        <div className="flex items-stretch justify-around px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {MAIN_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 sm:px-3 py-1.5 min-w-[64px] transition-colors cursor-pointer ${
                  isActive ? "text-blue-700" : "text-slate-500"
                }`}
              >
                <span
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? "bg-blue-50" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isActive ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  {item.short}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-xl px-2 sm:px-3 py-1.5 min-w-[64px] text-slate-500 transition-colors cursor-pointer"
          >
            <span className="p-1.5 rounded-lg bg-slate-50">
              <Settings className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold">Ajustes</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        fontSettings={fontSettings}
        onFontChange={setFontSettings}
      />

      <PrintBookletModal
        isOpen={!!printModalData}
        onClose={() => setPrintModalData(null)}
        data={printModalData}
      />

      <GuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      {/* Footer (desktop) */}
      <footer className="no-print hidden md:block bg-slate-950 text-slate-500 py-6 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">Especialista FCC</span>
            <span style={{ color: "#c9a227" }}>•</span>
            <span>Nível Médio — TRTs, TREs, TRFs, TJs e Administrativos</span>
          </div>
          <div className="text-slate-500">
            Raio-X de incidência • Questões inéditas • Engenharia de distratores
          </div>
        </div>
      </footer>
    </div>
  );
}
