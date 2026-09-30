"use client";

import React from "react";
import { X, ShieldCheck, Scale, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuidelinesModal({ isOpen, onClose }: GuidelinesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                Diretrizes do Especialista Sênior FCC
              </h3>
              <p className="text-[11px] text-slate-400">
                Padrão de Qualidade Oficial Nível Médio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Mandatory Flow */}
          <section className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <span>Fluxo de Resposta Obrigatório em 3 Etapas</span>
            </h4>

            <div className="space-y-3 pl-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-blue-900 block font-bold mb-1">
                  ETAPA 1: RAIO-X FCC (Análise de Incidência Recente)
                </strong>
                <p className="text-xs text-slate-600">
                  Diagnóstico dos últimos 3 a 5 anos contendo Frequência (Alta, Média ou Baixa),
                  Padrão Típico de Cobrança (casos práticos vs literalidade), artigos mais visados e mapeamento de pegadinhas comuns.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-blue-900 block font-bold mb-1">
                  ETAPA 2: Geração de Questões Inéditas (Padrão FCC)
                </strong>
                <p className="text-xs text-slate-600">
                  Elaboração de questões de Nível Médio rigoroso, com 5 alternativas (A, B, C, D, E), tom sóbrio e formal,
                  distratores verossímeis e balanceados sem alternativas absurdas.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-blue-900 block font-bold mb-1">
                  ETAPA 3: Gabarito Comentado e Engenharia de Distratores
                </strong>
                <p className="text-xs text-slate-600">
                  Gabarito oficial com letra, transcrição precisa do Fundamento Direto (artigo, súmula ou norma gramatical)
                  e análise pontual alternativa por alternativa indicando onde a banca armou a pegadinha.
                </p>
              </div>
            </div>
          </section>

          {/* Guidelines by Discipline */}
          <section className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <span>Diretrizes Específicas por Disciplina</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pl-2">
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <strong className="text-slate-900 font-bold block">
                  Língua Portuguesa
                </strong>
                <p className="text-slate-600">
                  Concordância com sujeito posposto e partitivo, crase proibida e facultativa, regência com pronome relativo, reescrita de frases com equivalência semântica e pontuação.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <strong className="text-slate-900 font-bold block">
                  Direito Constitucional & Administrativo
                </strong>
                <p className="text-slate-600">
                  Literalidade da CF/88 (Art. 5º, Poder Judiciário), Lei 8.112/90, Lei 9.784/99 e Lei 14.133/21 contextualizadas no cotidiano de servidores públicos.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <strong className="text-slate-900 font-bold block">
                  Raciocínio Lógico-Matemático
                </strong>
                <p className="text-slate-600">
                  Equivalências e contrapositiva, negações com Leis de De Morgan, diagramas lógicos, sequências e problemas aritméticos situacionais.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <strong className="text-slate-900 font-bold block">
                  Regimentos & Legislação
                </strong>
                <p className="text-slate-600">
                  Prazos e composições de órgãos de Tribunais (TRTs, TREs, TRFs), Código de Ética (Decreto 1.171/94) e Lei de Acesso à Informação (Lei 12.527/11).
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end border-t border-slate-200 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
