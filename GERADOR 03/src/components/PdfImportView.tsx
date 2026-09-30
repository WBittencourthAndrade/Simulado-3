"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FileUp,
  FileText,
  UploadCloud,
  Brain,
  AlertCircle,
  ScanLine,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface PdfImportViewProps {
  apiKey: string;
  selectedModel: string;
  onStartSimulado: (questions: any[], title: string) => void;
}

export function PdfImportView({
  apiKey,
  selectedModel,
  onStartSimulado,
}: PdfImportViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [processingMsg, setProcessingMsg] = useState(
    "Lendo o arquivo PDF..."
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate informative processing messages
  useEffect(() => {
    if (!isProcessing) return;
    const msgs = [
      "Extraindo texto e questões do PDF...",
      "Identificando enunciados e 5 alternativas (A-E)...",
      "Processando o gabarito oficial e os motivos dos erros...",
      "Iniciando seu simulado interativo...",
    ];
    let i = 0;
    const int = setInterval(() => {
      i = (i + 1) % msgs.length;
      setProcessingMsg(msgs[i]);
    }, 2800);
    return () => clearInterval(int);
  }, [isProcessing]);

  const handleFile = async (file: File) => {
    setErrorMsg(null);

    if (!(file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
      setErrorMsg("Formato inválido. Por favor, envie um arquivo PDF.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Arquivo muito grande. O limite máximo é de 20 MB.");
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setProcessingMsg("Lendo o arquivo PDF...");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("apiKey", apiKey);
      fd.append("modelName", selectedModel);

      const res = await fetch("/api/fcc/import-pdfs", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Falha ao processar o PDF.");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("Nenhuma questão com 5 alternativas foi identificada no documento.");
      }

      // Direct start: no intermediate confirmation required
      onStartSimulado(data.questions, data.title || file.name.replace(/\.pdf$/i, ""));
    } catch (err: any) {
      setErrorMsg(err.message || "Não foi possível ler o PDF. Tente novamente.");
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6 pb-16 fcc-fade-in">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-5 sm:p-8 shadow-2xl border border-slate-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(700px 260px at 85% -10%, rgba(69,20,160,0.35), transparent 60%), radial-gradient(500px 240px at 0% 120%, rgba(201,162,39,0.12), transparent 60%)",
          }}
        />
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-amber-400/30 px-3 py-1 text-[11px] font-bold text-amber-200">
            <FileUp className="w-3.5 h-3.5" />
            <span>Importação Direta de Caderno</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Envie seu caderno em PDF para gerar o{" "}
            <span style={{ color: "#e9c659" }}>simulado interativo</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 fcc-text">
            O sistema faz a leitura com IA do seu PDF, identifica todas as questões, o gabarito oficial e
            os motivos dos erros de cada alternativa, iniciando imediatamente o simulado interativo.
          </p>
        </div>
      </section>

      {/* Upload Zone / Processing State */}
      {!isProcessing ? (
        <section className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60 p-5 sm:p-8 space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-14 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-blue-500 bg-blue-50/70 scale-[1.01]"
                : "border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/40"
            }`}
          >
            <div
              className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                dragOver ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
              }`}
            >
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-extrabold text-slate-900">
              Arraste seu PDF aqui ou clique para selecionar
            </h3>
            <p className="mt-1.5 text-xs text-slate-500">
              Cadernos de provas em PDF (digital ou escaneado) • até 20 MB
            </p>
            <div
              className="mt-5 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white text-sm font-extrabold shadow-lg shadow-blue-600/25"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #4338ca)" }}
            >
              <FileText className="w-4.5 h-4.5 text-amber-300" />
              <span>Selecionar Arquivo PDF</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
              <ScanLine className="w-4 h-4 text-blue-600" />
              <p className="font-bold text-slate-800">1. Leitura Automática</p>
              <p className="fcc-text">A IA extrai enunciados, opções e identifica o gabarito do PDF.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
              <Brain className="w-4 h-4 text-blue-600" />
              <p className="font-bold text-slate-800">2. Motivos dos Erros</p>
              <p className="fcc-text">Mapeia onde está o erro de cada distrator para mostrar ao responder.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <p className="font-bold text-slate-800">3. Início Imediato</p>
              <p className="fcc-text">Abre direto o simulado interativo com reflexo em todas as métricas.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </section>
      ) : (
        /* Processing state: automatic redirection as soon as it finishes */
        <section className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60 p-8 sm:p-14 text-center space-y-6 fcc-fade-in">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Arquivo: {fileName || "Caderno.pdf"}
            </span>
            <h3 className="mt-3 text-lg sm:text-xl font-black text-slate-900">
              Lendo seu caderno e gerando o simulado...
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 inline-flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>{processingMsg}</span>
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: "50%",
                  background: "linear-gradient(90deg, #4338ca, #1d4ed8)",
                  animation: "fccLoading 1.5s ease-in-out infinite alternate",
                }}
              />
            </div>
            <style>{`@keyframes fccLoading { from { margin-left: 0%; } to { margin-left: 50%; } }`}</style>
          </div>

          <p className="text-xs text-slate-400 fcc-text max-w-sm mx-auto">
            O simulado iniciará automaticamente assim que a leitura do PDF for concluída.
          </p>
        </section>
      )}
    </div>
  );
}
