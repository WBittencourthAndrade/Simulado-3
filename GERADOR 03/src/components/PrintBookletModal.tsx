"use client";

import React, { useRef } from "react";
import { X, Printer, Download, BookOpen, ShieldCheck } from "lucide-react";

interface PrintBookletModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    theme: string;
    rayX: any;
    questions: any[];
  } | null;
}

export function PrintBookletModal({
  isOpen,
  onClose,
  data,
}: PrintBookletModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const optionLetters: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-white">
              Caderno Oficial de Prova FCC (Pronto para Impressão / PDF)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Booklet Body */}
        <div
          ref={printRef}
          className="p-8 sm:p-12 overflow-y-auto space-y-8 bg-white text-black font-serif text-sm leading-relaxed"
        >
          {/* FCC Official Contest Header */}
          <div className="border-4 border-black p-4 text-center space-y-2">
            <div className="font-sans font-black text-xl tracking-wider uppercase">
              FUNDAÇÃO CARLOS CHAGAS
            </div>
            <div className="font-sans font-bold text-sm uppercase text-slate-800">
              CONCURSO PÚBLICO • CARGOS DE NÍVEL MÉDIO / TÉCNICO JUDICIÁRIO
            </div>
            <div className="text-xs font-mono border-t border-b border-black py-1.5 font-bold">
              CADERNO DE QUESTÕES INÉDITAS • TEMA: {data.theme.toUpperCase()}
            </div>
            <div className="flex justify-between text-[11px] font-sans px-2 pt-1 font-semibold">
              <span>PROVA OBJETIVA</span>
              <span>DURAÇÃO RECOMENDADA: {Math.max(data.questions.length * 3, 10)} MINUTOS</span>
              <span>{data.questions.length} QUESTÕES</span>
            </div>
          </div>

          {/* Candidate instructions box */}
          <div className="border border-black p-3 text-[11px] space-y-1 font-sans bg-slate-50">
            <strong className="block font-bold uppercase">INSTRUÇÕES AO CANDIDATO:</strong>
            <p>1. Verifique se este caderno contém {data.questions.length} questões com 5 alternativas (A a E) cada.</p>
            <p>2. Para cada questão, existe apenas UMA resposta correta segundo as normas oficiais e jurisprudência.</p>
            <p>3. Utilize a folha de respostas ao final para marcação do gabarito definitivo.</p>
          </div>

          {/* Etapa 1 Summary for printing */}
          <div className="border-l-4 border-black pl-3 py-1 text-xs font-sans space-y-1 bg-slate-100/60 p-2">
            <span className="font-black uppercase text-[11px]">
              DIAGNÓSTICO FCC: Incidência Recente ({data.rayX.frequency}) • Formato: {data.rayX.typicalPattern?.formatPreference}
            </span>
            <p className="text-[11px] text-slate-700 leading-tight">
              {data.rayX.typicalPattern?.styleSummary}
            </p>
          </div>

          {/* Questions Section */}
          <div className="space-y-8 pt-4">
            {data.questions.map((q, idx) => (
              <div key={idx} className="space-y-3 pb-6 border-b border-slate-300">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-black text-base">
                    QUESTÃO {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-600 uppercase">
                    {q.discipline}
                  </span>
                </div>

                <div className="text-justify whitespace-pre-line text-[13px] leading-relaxed">
                  {q.statement}
                </div>

                <div className="space-y-2 pt-1 pl-2 text-[13px]">
                  {optionLetters.map((l) => (
                    <div key={l} className="flex items-start gap-2">
                      <span className="font-bold font-sans">({l})</span>
                      <span className="flex-1 leading-snug">{q.options[l]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Folha de Respostas para preenchimento */}
          <div className="page-break pt-8 space-y-4 font-sans border-t-2 border-black">
            <div className="text-center font-bold text-sm uppercase tracking-wider">
              FOLHA DE RESPOSTAS (GRADE DE GABARITO FCC)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto border border-black p-4">
              {data.questions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200">
                  <span className="font-bold">Q{idx + 1}:</span>
                  <div className="flex items-center gap-3">
                    {optionLetters.map((l) => (
                      <span
                        key={l}
                        className="w-5 h-5 rounded-full border border-black flex items-center justify-center text-[10px] font-bold"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ETAPA 3: GABARITO COMENTADO & ENGENHARIA DE DISTRATORES (FINAL DA PROVA) */}
          <div className="page-break pt-8 space-y-6 font-sans">
            <div className="border-b-2 border-black pb-2 text-center">
              <h2 className="text-base font-black uppercase tracking-wider">
                GABARITO OFICIAL COMENTADO & ENGENHARIA DE DISTRATORES (ETAPA 3)
              </h2>
              <span className="text-xs text-slate-600">Fundamentação Jurídica e Gramatical Padrão FCC</span>
            </div>

            <div className="space-y-6">
              {data.questions.map((q, idx) => (
                <div key={idx} className="border border-slate-300 p-4 rounded-lg space-y-3 text-xs bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">
                      QUESTÃO {idx + 1}
                    </span>
                    <span className="font-black bg-black text-white px-3 py-0.5 rounded text-xs">
                      GABARITO: ({q.correctOption})
                    </span>
                  </div>

                  <div className="space-y-1">
                    <strong className="block text-slate-900 font-bold">
                      Fundamento Direto:
                    </strong>
                    <blockquote className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] leading-relaxed">
                      {q.directFoundation}
                    </blockquote>
                  </div>

                  <div className="space-y-1">
                    <strong className="block text-slate-900 font-bold">
                      Análise Pontual dos Distratores:
                    </strong>
                    {optionLetters.map((l) => (
                      <div key={l} className="text-[11px] leading-tight">
                        <strong>({l})</strong> {q.distractorAnalysis[l]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
