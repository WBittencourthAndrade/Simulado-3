"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  BookOpen,
  Filter,
  Search,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

interface MistakeItem {
  answer: {
    id: number;
    questionId: number;
    selectedOption: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
    answeredAt: string;
    notes?: string;
  };
  question: {
    id: number;
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
  };
}

interface CadernoErrosViewProps {
  onGoToGenerator: () => void;
  onRefreshStats?: () => void;
}

export function CadernoErrosView({ onGoToGenerator, onRefreshStats }: CadernoErrosViewProps) {
  const [errorsList, setErrorsList] = useState<MistakeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiscipline, setSelectedDiscipline] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [retryAnswer, setRetryAnswer] = useState<Record<number, string>>({});
  const [retryStatus, setRetryStatus] = useState<Record<number, "correct" | "wrong">>({});

  const fetchErrors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/fcc/caderno-erros");
      if (res.ok) {
        const data = await res.json();
        setErrorsList(data.errors || []);
      }
    } catch (err) {
      console.error("Failed to load errors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const handleRetrySelect = (questionId: number, optionLetter: string, correctLetter: string) => {
    setRetryAnswer((prev) => ({ ...prev, [questionId]: optionLetter }));
    const isCorrect = optionLetter === correctLetter;

    setRetryStatus((prev) => ({
      ...prev,
      [questionId]: isCorrect ? "correct" : "wrong",
    }));

    if (isCorrect) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  const filteredErrors = errorsList.filter((item) => {
    if (!item.question) return false;
    const matchesSearch =
      item.question.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.question.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.question.fccTrapType || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDisc =
      selectedDiscipline === "Todas" || item.question.discipline === selectedDiscipline;

    return matchesSearch && matchesDisc;
  });

  const disciplines = [
    "Todas",
    "Língua Portuguesa",
    "Direito Constitucional",
    "Direito Administrativo",
    "Raciocínio Lógico-Matemático",
    "Regimentos Internos e Legislação Específica",
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold px-3 py-1 rounded-full">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Caderno de Erros Inteligente</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Engenharia de Erros & Neutralização de Pegadinhas
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Todas as questões em que você caiu nos distratores da FCC são registradas aqui.
            Revise os fundamentos jurídicos e gramaticais para nunca mais errar o mesmo padrão em prova.
          </p>
        </div>
      </section>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Buscar por texto, tema ou tipo de pegadinha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {disciplines.map((disc) => (
            <button
              key={disc}
              onClick={() => setSelectedDiscipline(disc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDiscipline === disc
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {disc}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          Carregando histórico de erros...
        </div>
      ) : filteredErrors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Nenhum Erro Registrado!
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Você ainda não errou nenhuma questão ou ainda não respondeu questões nesta disciplina. Continue praticando!
          </p>
          <button
            onClick={onGoToGenerator}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Gerar Novas Questões FCC
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total de Questões para Revisão: {filteredErrors.length}
          </div>

          {filteredErrors.map((item, idx) => {
            const q = item.question;
            const qId = q.id;
            const chosenEarlier = item.answer.selectedOption;
            const currentRetry = retryAnswer[qId];
            const status = retryStatus[qId];
            const optionLetters: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-rose-50/60 border-b border-rose-100 px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-md">
                      ERRO #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {q.discipline}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {q.theme}
                    </span>
                  </div>

                  {q.fccTrapType && (
                    <span className="text-[11px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded border border-amber-300">
                      Pegadinha: {q.fccTrapType}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 space-y-5">
                  <div className="fcc-text text-slate-800 whitespace-pre-line">
                    {q.statement}
                  </div>

                  {/* Options with Retry Capability */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-semibold text-slate-500 flex items-center justify-between mb-1">
                      <span>Clique para refazer a questão:</span>
                      <span className="text-rose-600">
                        Sua resposta anterior foi: <strong>({chosenEarlier})</strong>
                      </span>
                    </div>

                    {optionLetters.map((letter) => {
                      const optionText = q.options[letter];
                      const isCorrect = letter === q.correctOption;
                      const isSelected = currentRetry === letter;

                      let style = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";

                      if (currentRetry) {
                        if (isCorrect) {
                          style = "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium";
                        } else if (isSelected && !isCorrect) {
                          style = "border-rose-400 bg-rose-50 text-rose-950 font-medium";
                        } else {
                          style = "border-slate-200 bg-slate-50/50 text-slate-400";
                        }
                      }

                      return (
                        <div
                          key={letter}
                          onClick={() => handleRetrySelect(qId, letter, q.correctOption)}
                          className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer ${style}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              currentRetry
                                ? isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : isSelected
                                  ? "bg-rose-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 leading-relaxed fcc-text">{optionText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback on retry */}
                  {status && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        status === "correct"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-rose-100 text-rose-900 border border-rose-300"
                      }`}
                    >
                      {status === "correct" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Excelente! Você acertou a questão ao refazer.</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Ainda incorreta. O gabarito oficial é a letra ({q.correctOption}).</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Etapa 3 Fundamentação e Distratores */}
                  <div className="pt-4 border-t border-slate-200 space-y-3 bg-slate-50/70 -mx-6 -mb-6 p-6 rounded-b-2xl">
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1">
                      <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Fundamento Direto para Memorização:
                      </span>
                      <p className="font-mono bg-emerald-50/50 p-2 rounded-lg border-l-4 border-emerald-500 text-slate-800 whitespace-pre-line">
                        {q.directFoundation}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block">
                        Por que a alternativa anterior ({chosenEarlier}) estava incorreta:
                      </span>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-rose-950">
                        {q.distractorAnalysis[chosenEarlier as "A" | "B" | "C" | "D" | "E"] || "Distrator verossímil da banca."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
