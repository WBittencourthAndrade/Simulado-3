"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  BookOpen,
  CheckCircle2,
  XCircle,
  FileCheck,
  Printer,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  Scale,
  Brain,
  Lightbulb,
  Check,
  Strikethrough,
  Quote,
} from "lucide-react";
import confetti from "canvas-confetti";

interface QuestionData {
  id?: number;
  orderIndex: number;
  discipline: string;
  theme: string;
  statement: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctOption: "A" | "B" | "C" | "D" | "E";
  directFoundation: string;
  distractorAnalysis: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  fccTrapType?: string;
}

interface RayXData {
  frequency: "Alta" | "Média" | "Baixa";
  typicalPattern: {
    formatPreference: string;
    targetArticles: string[];
    styleSummary: string;
  };
  trapMapping: Array<{
    trapName: string;
    description: string;
    example: string;
  }>;
  seniorTip: string;
}

interface GeneratorViewProps {
  onOpenPrintModal: (data: { theme: string; rayX: RayXData; questions: QuestionData[] }) => void;
  apiKey: string;
  selectedModel: string;
  onAnswerSubmitted?: () => void;
}

export function GeneratorView({
  onOpenPrintModal,
  apiKey,
  selectedModel,
  onAnswerSubmitted,
}: GeneratorViewProps) {
  const [themeInput, setThemeInput] = useState("");
  const [disciplineInput, setDisciplineInput] = useState("Geral");
  const [targetExamInput, setTargetExamInput] = useState(
    "FCC Nível Médio (Técnico Judiciário)"
  );
  const [questionCountInput, setQuestionCountInput] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeResult, setActiveResult] = useState<{
    theme: string;
    discipline: string;
    targetExam: string;
    rayX: RayXData;
    questions: QuestionData[];
    sessionId?: number;
  } | null>(null);

  const [userSelectedAnswers, setUserSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, boolean>>({});
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!themeInput.trim()) {
      setErrorMessage("Informe o tema desejado para o especialista analisar e gerar as questões.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    try {
      const response = await fetch("/api/fcc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: themeInput.trim(),
          discipline: disciplineInput,
          targetExam: targetExamInput,
          questionCount: questionCountInput,
          apiKey: apiKey,
          modelName: selectedModel,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Falha na geração");
      }

      const data = await response.json();
      setActiveResult({
        theme: themeInput,
        discipline: data.session?.discipline || disciplineInput,
        targetExam: data.session?.targetExam || targetExamInput,
        rayX: data.rayX,
        questions: data.questions,
        sessionId: data.sessionId,
      });

      setUserSelectedAnswers({});
      setShowExplanation({});
      setEliminatedOptions({});
    } catch (err: any) {
      console.error("Erro ao gerar:", err);
      setErrorMessage(err.message || "Não foi possível processar a geração. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = async (
    question: QuestionData,
    optionKey: "A" | "B" | "C" | "D" | "E"
  ) => {
    const qIndex = question.orderIndex;
    if (userSelectedAnswers[qIndex]) return;

    setUserSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionKey }));
    setShowExplanation((prev) => ({ ...prev, [qIndex]: true }));

    const isCorrect = optionKey === question.correctOption;
    if (isCorrect) {
      confetti({ particleCount: 55, spread: 65, origin: { y: 0.8 } });
    }

    if (question.id) {
      try {
        await fetch("/api/fcc/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            selectedOption: optionKey,
            timeSpentSeconds: 15,
          }),
        });
        if (onAnswerSubmitted) onAnswerSubmitted();
      } catch (err) {
        console.error("Error saving user answer:", err);
      }
    }
  };

  const toggleEliminate = (questionIndex: number, optionKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${questionIndex}-${optionKey}`;
    setEliminatedOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyAll = () => {
    if (!activeResult) return;

    let text = `========================================================\n`;
    text += `ESPECIALISTA FCC - RELATÓRIO OFICIAL DE QUESTÕES INÉDITAS\n`;
    text += `TEMA: ${activeResult.theme}\n`;
    text += `DISCIPLINA: ${activeResult.discipline} | ÓRGÃO ALVO: ${activeResult.targetExam}\n`;
    text += `========================================================\n\n`;

    text += `--- ETAPA 1: RAIO-X FCC (ANÁLISE DE INCIDÊNCIA) ---\n`;
    text += `Incidência Recente: ${activeResult.rayX.frequency}\n`;
    text += `Formato Típico: ${activeResult.rayX.typicalPattern.formatPreference}\n`;
    text += `Padrão de Cobrança: ${activeResult.rayX.typicalPattern.styleSummary}\n`;
    text += `Artigos/Regras Visados:\n${activeResult.rayX.typicalPattern.targetArticles
      .map((a) => `• ${a}`)
      .join("\n")}\n\n`;
    text += `Mapeamento de Pegadinhas Comuns:\n`;
    activeResult.rayX.trapMapping.forEach((trap) => {
      text += `• ${trap.trapName}: ${trap.description} (Ex: "${trap.example}")\n`;
    });
    text += `\nDica do Especialista: ${activeResult.rayX.seniorTip}\n\n`;

    text += `--- ETAPA 2: QUESTÕES INÉDITAS (PADRÃO FCC) ---\n\n`;
    activeResult.questions.forEach((q, idx) => {
      text += `QUESTÃO ${idx + 1} (${q.discipline})\n`;
      text += `${q.statement}\n\n`;
      text += `(A) ${q.options.A}\n`;
      text += `(B) ${q.options.B}\n`;
      text += `(C) ${q.options.C}\n`;
      text += `(D) ${q.options.D}\n`;
      text += `(E) ${q.options.E}\n\n`;
      text += `--- ETAPA 3: GABARITO E ENGENHARIA DE DISTRATORES ---\n`;
      text += `Gabarito Oficial: Letra (${q.correctOption})\n`;
      text += `Fundamento Direto: ${q.directFoundation}\n`;
      text += `Engenharia de Distratores:\n`;
      text += `(A) ${q.distractorAnalysis.A}\n`;
      text += `(B) ${q.distractorAnalysis.B}\n`;
      text += `(C) ${q.distractorAnalysis.C}\n`;
      text += `(D) ${q.distractorAnalysis.D}\n`;
      text += `(E) ${q.distractorAnalysis.E}\n`;
      text += `--------------------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 fcc-fade-in">
      {/* Premium Hero: the user's theme is the star */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-5 sm:p-8 shadow-2xl shadow-slate-950/20 border border-slate-800">
        {/* premium background accents */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(800px 300px at 85% -10%, rgba(37,99,235,0.25), transparent 60%), radial-gradient(500px 250px at 0% 120%, rgba(201,162,39,0.12), transparent 60%)",
          }}
        />
        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-amber-400/30 px-3 py-1 text-[11px] font-bold text-amber-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fundação Carlos Chagas • Nível Médio</span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-[34px] font-black tracking-tight text-white leading-[1.15]">
            Qual tema você quer dominar{" "}
            <span style={{ color: "#e9c659" }}>hoje</span>?
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed fcc-text">
            Informe o <strong className="text-slate-200">Tema</strong> desejado (e, se houver, a{" "}
            <strong className="text-slate-200">Disciplina</strong> e o{" "}
            <strong className="text-slate-200">Concurso/Órgão alvo</strong>). Exemplo:{" "}
            <span className="text-amber-300 font-mono text-[11px] sm:text-xs">
              Atos Administrativos — Técnico do TRT
            </span>{" "}
            ou{" "}
            <span className="text-amber-300 font-mono text-[11px] sm:text-xs">
              Crase — FCC Nível Médio
            </span>
            . Você receberá o Raio-X de incidência, questões inéditas e gabarito comentado.
          </p>
        </div>
      </section>

      {/* Generation Workspace — theme first */}
      <section className="rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/60 p-4 sm:p-7">
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* The main theme input — full width, prominent */}
          <div className="space-y-2">
            <label
              htmlFor="theme"
              className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700"
            >
              <Search className="w-4 h-4 text-blue-600" />
              Tema do estudo <span className="text-rose-500">*</span>
            </label>
            <input
              id="theme"
              type="text"
              autoFocus
              placeholder="Ex.: Licitação — Inexigibilidade vs Dispensa (Lei 14.133/21)"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              required
              className="w-full px-4 py-4 sm:py-4.5 rounded-2xl border-2 border-slate-200 bg-slate-50/60 text-slate-900 placeholder-slate-400 text-sm sm:text-base font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all"
            />
          </div>

          {/* Secondary fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="discipline"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Disciplina (opcional)
              </label>
              <select
                id="discipline"
                value={disciplineInput}
                onChange={(e) => setDisciplineInput(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
              >
                <option value="Geral">Auto-identificar</option>
                <option value="Língua Portuguesa">Língua Portuguesa</option>
                <option value="Direito Constitucional">Direito Constitucional</option>
                <option value="Direito Administrativo">Direito Administrativo</option>
                <option value="Raciocínio Lógico-Matemático">Raciocínio Lógico-Matemático</option>
                <option value="Regimentos Internos e Legislação Específica">
                  Regimentos & Legislação
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="targetExam"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Concurso / Órgão alvo (opcional)
              </label>
              <select
                id="targetExam"
                value={targetExamInput}
                onChange={(e) => setTargetExamInput(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
              >
                <option value="FCC Nível Médio (Técnico Judiciário)">FCC Nível Médio (Geral)</option>
                <option value="TRT - Técnico Judiciário (FCC)">TRT — Técnico Judiciário</option>
                <option value="TRE - Técnico Judiciário (FCC)">TRE — Técnico Judiciário</option>
                <option value="TRF - Técnico Judiciário (FCC)">TRF — Técnico Judiciário</option>
                <option value="TJ - Técnico Judiciário (FCC)">TJ — Técnico Judiciário</option>
                <option value="Cargos Administrativos (FCC)">Cargos Administrativos</option>
              </select>
            </div>
          </div>

          {/* Quantity + action */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-slate-600">Questões:</span>
              <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-100/70">
                {[1, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCountInput(num)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      questionCountInput === num
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {num}
                    {num === 3 ? " *" : ""}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                * padrão
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-white font-extrabold text-sm tracking-wide shadow-xl shadow-blue-600/25 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 55%, #1e3a8a 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Analisando padrão FCC...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 text-amber-300" />
                  <span>Gerar Raio-X + Questões Inéditas</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-xs sm:text-sm flex items-start gap-3 fcc-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso do Especialista</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}
      </section>

      {/* Loading stepper */}
      {isLoading && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60 p-6 sm:p-10 text-center fcc-fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Brain className="w-7 h-7 animate-pulse" />
          </div>
          <h3 className="mt-4 text-base font-extrabold text-slate-900">
            Redigindo questões no padrão FCC
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Calibrando vocabulário formal e fundamentos literais do seu tema...
          </p>

          <div className="mt-6 max-w-sm mx-auto space-y-2 text-left">
            {[
              { n: 1, label: "ETAPA 1 — Raio-X: incidência recente & pegadinhas" },
              { n: 2, label: "ETAPA 2 — Questões inéditas com distratores verossímeis" },
              { n: 3, label: "ETAPA 3 — Gabarito comentado & engenharia de distratores" },
            ].map((step) => (
              <div
                key={step.n}
                className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-medium transition-all ${
                  loadingStep >= step.n
                    ? "bg-blue-50 border-blue-200 text-blue-900 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    loadingStep >= step.n ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step.n}
                </span>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================ RESULTS ============================ */}
      {activeResult && !isLoading && (
        <div className="space-y-6 fcc-fade-in">
          {/* Sticky actions bar */}
          <div className="no-print sticky top-[72px] sm:top-[88px] z-30 rounded-2xl bg-slate-950/95 backdrop-blur border border-slate-800 shadow-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 shrink-0">
                Tema
              </span>
              <span className="font-bold text-white text-xs sm:text-sm truncate">
                {activeResult.theme}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-700 bg-white/5 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onOpenPrintModal({
                    theme: activeResult.theme,
                    rayX: activeResult.rayX,
                    questions: activeResult.questions,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-700 bg-white/5 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Exportar Caderno (PDF)</span>
              </button>
            </div>
          </div>

          {/* ETAPA 1 — RAIO-X */}
          <section className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
            <div
              className="px-5 sm:px-7 py-4.5 sm:py-5 text-white flex flex-wrap items-center justify-between gap-3"
              style={{
                background: "linear-gradient(120deg, #0f172a 0%, #1e3a8a 70%, #312e81 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-300/40 text-amber-300 font-black text-sm flex items-center justify-center">
                  1
                </span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-200">
                    Etapa 1
                  </span>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    Raio-X FCC • Incidência (3–5 anos)
                  </h2>
                </div>
              </div>

              <span
                className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-full border ${
                  activeResult.rayX.frequency === "Alta"
                    ? "bg-rose-500/15 text-rose-200 border-rose-400/40"
                    : activeResult.rayX.frequency === "Média"
                    ? "bg-amber-500/15 text-amber-200 border-amber-400/40"
                    : "bg-blue-500/15 text-blue-200 border-blue-400/40"
                }`}
              >
                Incidência: {activeResult.rayX.frequency}
              </span>
            </div>

            <div className="p-5 sm:p-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-[13px]">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>Padrão Típico de Cobrança</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>Formato preferido:</strong>{" "}
                    <span className="text-blue-700 font-bold">
                      {activeResult.rayX.typicalPattern.formatPreference}
                    </span>
                  </p>
                  <p className="fcc-text text-[13px] text-slate-600">
                    {activeResult.rayX.typicalPattern.styleSummary}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-[13px]">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Artigos & Regras mais visados</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {activeResult.rayX.typicalPattern.targetArticles.map((art, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-black mt-px">•</span>
                        <span>{art}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pegadinhas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-[13px]">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Pegadinhas Comuns da Banca neste tema</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeResult.rayX.trapMapping.map((trap, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-2"
                    >
                      <span className="flex items-start gap-1.5 text-xs font-bold text-amber-950">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                        <span>{trap.trapName}</span>
                      </span>
                      <p className="fcc-text text-[11.5px] text-amber-900/90">
                        {trap.description}
                      </p>
                      {trap.example && (
                        <div className="rounded-lg bg-white/80 border border-amber-200 p-2 text-[11px] text-amber-950 font-mono fcc-text">
                          <strong>Ex.:</strong> “{trap.example}”
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dica */}
              {activeResult.rayX.seniorTip && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-[13px] text-emerald-950">
                    <strong className="font-extrabold text-emerald-900 block mb-0.5">
                      Dica de Ouro do Especialista:
                    </strong>
                    <span className="fcc-text">{activeResult.rayX.seniorTip}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ETAPA 2 — QUESTÕES */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  2
                </span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-600">
                    Etapa 2
                  </span>
                  <h2 className="text-base sm:text-xl font-black tracking-tight text-slate-900">
                    Questões Inéditas ({activeResult.questions.length})
                  </h2>
                </div>
              </div>
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                5 alternativas • vocabulário oficial FCC
              </span>
            </div>

            {activeResult.questions.map((q, qIndex) => {
              const questionNumber = q.orderIndex || qIndex + 1;
              const userSelected = userSelectedAnswers[questionNumber];
              const isAnswered = !!userSelected;
              const isExplanationOpen = showExplanation[questionNumber];
              const optionLetters: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];

              return (
                <div
                  key={qIndex}
                  className="rounded-3xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-slate-50/90 border-b border-slate-200 px-4 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-[11px] text-white bg-slate-900 px-2.5 py-1 rounded-lg shrink-0">
                        QUESTÃO {questionNumber}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 truncate">
                        {q.discipline}
                      </span>
                    </div>

                    {q.fccTrapType && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-1 rounded-lg border border-amber-200 max-w-[60%] truncate">
                        Trap: {q.fccTrapType}
                      </span>
                    )}
                  </div>

                  <div className="p-4 sm:p-7 space-y-5">
                    {/* Statement (justified) */}
                    <div className="fcc-text text-slate-900 whitespace-pre-line">
                      {q.statement}
                    </div>

                    {/* Options (justified) */}
                    <div className="space-y-2.5 pt-1">
                      {optionLetters.map((letter) => {
                        const optionText = q.options[letter];
                        const isEliminated = !!eliminatedOptions[`${questionNumber}-${letter}`];
                        const isSelectedByUser = userSelected === letter;
                        const isCorrect = letter === q.correctOption;

                        let optionStyle =
                          "border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800";

                        if (isAnswered) {
                          if (isCorrect) {
                            optionStyle =
                              "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-1 ring-emerald-500";
                          } else if (isSelectedByUser && !isCorrect) {
                            optionStyle =
                              "border-rose-400 bg-rose-50/80 text-rose-950 font-medium ring-1 ring-rose-400";
                          } else {
                            optionStyle = "border-slate-200 bg-slate-50/50 text-slate-400";
                          }
                        }

                        return (
                          <div
                            key={letter}
                            onClick={() => handleSelectOption(q, letter)}
                            className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border text-sm transition-all cursor-pointer ${optionStyle} ${
                              isEliminated ? "option-eliminated" : ""
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${
                                isAnswered
                                  ? isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : isSelectedByUser
                                    ? "bg-rose-600 text-white"
                                    : "bg-slate-200 text-slate-600"
                                  : "bg-slate-100 group-hover:bg-blue-100 text-slate-700 group-hover:text-blue-700"
                              }`}
                            >
                              {letter}
                            </div>

                            <div className="flex-1 leading-relaxed fcc-text min-w-0">
                              {optionText}
                            </div>

                            {!isAnswered && (
                              <button
                                type="button"
                                title={isEliminated ? "Restaurar alternativa" : "Riscar alternativa"}
                                onClick={(e) => toggleEliminate(questionNumber, letter, e)}
                                className={`p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 ${
                                  isEliminated ? "text-amber-600" : ""
                                }`}
                              >
                                <Strikethrough className="w-4 h-4" />
                              </button>
                            )}

                            {isAnswered && isCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                            {isAnswered && isSelectedByUser && !isCorrect && (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500">
                        {!isAnswered ? (
                          <span>Toque na alternativa para responder ou risque para eliminar.</span>
                        ) : (
                          <span
                            className={`font-extrabold ${
                              userSelected === q.correctOption
                                ? "text-emerald-700"
                                : "text-rose-700"
                            }`}
                          >
                            {userSelected === q.correctOption
                              ? "✓ Correto!"
                              : `✕ Você marcou (${userSelected}) — gabarito oficial: (${q.correctOption})`}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowExplanation((prev) => ({
                            ...prev,
                            [questionNumber]: !prev[questionNumber],
                          }))
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
                      >
                        <span>
                          {isExplanationOpen
                            ? "Ocultar gabarito comentado"
                            : "Ver gabarito comentado (Etapa 3)"}
                        </span>
                        {isExplanationOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* ETAPA 3 */}
                    {isExplanationOpen && (
                      <div className="mt-2 pt-4 border-t-2 border-slate-200 space-y-4 bg-slate-50/80 -mx-4 sm:-mx-7 -mb-4 sm:-mb-7 p-4 sm:p-7 rounded-b-3xl fcc-fade-in">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                              3
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                              Etapa 3 • Gabarito & Engenharia de Distratores
                            </span>
                          </div>
                          <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-lg">
                            Gabarito: Letra ({q.correctOption})
                          </span>
                        </div>

                        {/* Fundamento */}
                        <div className="rounded-2xl bg-white border border-emerald-200 p-4 space-y-2">
                          <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-950 uppercase tracking-wide">
                            <Quote className="w-4 h-4 text-emerald-600" />
                            Fundamento Direto
                          </span>
                          <blockquote className="fcc-text text-xs text-slate-900 font-mono bg-emerald-50/50 p-3 rounded-xl border-l-4 border-emerald-500 whitespace-pre-line">
                            {q.directFoundation}
                          </blockquote>
                        </div>

                        {/* Distratores */}
                        <div className="space-y-2">
                          <span className="block text-[11px] font-extrabold text-slate-900">
                            Por que cada alternativa está (in)correta:
                          </span>
                          {optionLetters.map((optLetter) => {
                            const isTheCorrectOne = optLetter === q.correctOption;
                            return (
                              <div
                                key={optLetter}
                                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                                  isTheCorrectOne
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                                    : "bg-white border-slate-200 text-slate-700"
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span
                                    className={`font-black px-2 py-0.5 rounded text-[11px] shrink-0 ${
                                      isTheCorrectOne
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-200 text-slate-700"
                                    }`}
                                  >
                                    ({optLetter})
                                  </span>
                                  <div className="fcc-text">
                                    <span className="font-bold mr-1">
                                      {isTheCorrectOne ? "CORRETA." : "INCORRETA."}
                                    </span>
                                    {q.distractorAnalysis[optLetter]}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
}
