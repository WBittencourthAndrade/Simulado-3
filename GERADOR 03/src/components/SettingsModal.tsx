"use client";

import React, { useState } from "react";
import { X, Key, Cpu, Check, AlertCircle, Sparkles, Shield, RefreshCw, Download } from "lucide-react";
import { FontControl, FontSettings } from "./FontControl";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  fontSettings: FontSettings;
  onFontChange: (settings: FontSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  selectedModel,
  setSelectedModel,
  fontSettings,
  onFontChange,
}: SettingsModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(tempKey);
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    setTestMessage("Testando conexão com o motor Google Gemini...");

    try {
      const res = await fetch("/api/fcc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: "Atos Administrativos - Validação de Conexão",
          discipline: "Direito Administrativo",
          targetExam: "FCC Nível Médio",
          questionCount: 1,
          apiKey: tempKey,
          modelName: selectedModel,
        }),
      });

      if (res.ok) {
        setTestStatus("success");
        setTestMessage("Conexão bem-sucedida! Motor Gemini calibrado e operando no padrão FCC.");
      } else {
        const data = await res.json();
        setTestStatus("error");
        setTestMessage(data.message || data.error || "Falha na validação da chave.");
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestMessage(err.message || "Erro de rede ao conectar à API.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Configurações de IA & Gemini API</h3>
              <p className="text-[11px] text-slate-400">Calibração do Especialista Sênior FCC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* API Key */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              Chave da API Gemini (Google AI Studio)
            </label>
            <input
              type="password"
              placeholder="Cole sua chave da API Gemini..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
            />
            <p className="text-[11px] text-slate-500">
              Sua chave Gemini está configurada e protegida com segurança no servidor.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Modelo de Inteligência Artificial
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
            >
              <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Mais rápido & recomendado)</option>
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Alta precisão de distratores)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Equilibrado)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Última geração)</option>
            </select>
          </div>

          {/* Font Controls */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tipografia de Leitura (Questões & Gabarito)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <FontControl settings={fontSettings} onChange={onFontChange} variant="light" />
              <span className="text-[11px] text-slate-500 leading-relaxed flex-1 min-w-[160px]">
                Ajuste o tamanho e o estilo (sem serifa ou serifada) das questões. A preferência é
                salva automaticamente neste dispositivo.
              </span>
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus !== "idle" && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                testStatus === "testing"
                  ? "bg-blue-50 text-blue-900 border border-blue-200"
                  : testStatus === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "bg-rose-50 text-rose-900 border border-rose-200"
              }`}
            >
              {testStatus === "testing" && (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0 mt-0.5" />
              )}
              {testStatus === "success" && (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {testStatus === "error" && (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">
                <span className="font-bold block">
                  {testStatus === "testing"
                    ? "Testando Conexão..."
                    : testStatus === "success"
                    ? "Tudo Pronto!"
                    : "Atenção:"}
                </span>
                <span>{testMessage}</span>
              </div>
            </div>
          )}

          {/* Fallback Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-[11px] text-slate-600 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              O sistema conta com motor autônomo inteligente de questões específicas por tema caso a API atinja limites momentâneos de cota da Google.
            </span>
          </div>

          {/* HTML permanente */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-indigo-900">
              <Download className="w-3.5 h-3.5" />
              <span>Versão HTML permanente (arquivo único)</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              Baixe um arquivo único que funciona direto no navegador, sem servidor e sem banco de
              dados — com gerador de questões, importação de PDF, simulado pausável, caderno de erros e
              exportação dos seus dados.
            </p>
            <a
              href="/especialista-fcc.html"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Abrir / Baixar versão HTML permanente</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 flex items-center justify-between border-t border-slate-200">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === "testing"}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
          >
            Testar Conexão
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
