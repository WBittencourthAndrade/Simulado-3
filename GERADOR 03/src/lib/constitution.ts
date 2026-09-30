// Expert Legal & Linguistic Foundations Database for FCC Contest Nível Médio
export const FOUNDATION_LIBRARY: Record<
  string,
  Array<{
    category: string;
    title: string;
    content: string;
    legalBasis: string;
    keyInsight: string;
  }>
> = {
  // --- DIREITO CONSTITUCIONAL (CF/88 & Art. 5º) ---
  "artigo-5-liberdades": [
    {
      category: "Habeas Data (Art. 5º, LXXII)",
      title: "Habeas Data (LXXII)",
      content:
        "Conceder-se-á habeas data: a) para assegurar o conhecimento de informações relativas à pessoa do impetrante, constantes de registros ou bancos de dados de entidades governamentais ou de caráter público; b) para retificar dados, quando o interessado não lhes pudesse ter acesso, sejam ou não privados.",
      legalBasis: "Art. 5º, incisos LXXII, 'a' e 'b', CF/88",
      keyInsight:
        "O Habeas Data é um remédio gratuito (Art. 5º, LXXVII), que pode ser impetrado por qualquer pessoa, com ou sem advogado. Diferença crucial: Habeas Corpus (LIBERDADE física), Habeas Data (LIBERDADE informativa / Dados pessoais) e Mandado de Segurança (Liberdade de PRAZO / Direito líquido e certo não ameaçado por ilegalidade ou abuso de poder).",
    },
    {
      category: "Ação Popular (Art. 5º, LXXIII)",
      title: "Ação Popular",
      content:
        "Qualquer cidadão é parte legítima para propor ação popular que vise a anular ato lesivo ao patrimônio público ou de entidade de que o Estado participe, à moralidade administrativa, ao meio ambiente e ao patrimônio histórico e cultural, ficando o autor, salvo comprovada má-fé, isento de custas judiciais e do ônus da sucumbência.",
      legalBasis: "Art. 5º, inciso LXXIII, CF/88",
      keyInsight:
        "Pessoas jurídicas não têm legitimidade ativa para propor Ação Popular (Súmula 365 do STF).",
    },
    {
      category: "Suspendenda de Associação (Art. 5º, XIX)",
      title: "Suspendenda e Dissolução Compulsória de Associação",
      content:
        "As associações só poderão ser compulsoriamente dissolvidas ou ter suas atividades suspensas por decisão judicial, exigindo-se, no primeiro caso, o trânsito em julgado.",
      legalBasis: "Art. 5º, inciso XIX, CF/88",
      keyInsight:
        "Pegadinha Clássica da FCC: a DISSOLUÇÃO COMPULSÓRIA exige trânsito em julgado; a mera SUSPENSÃO de atividades exige apenas decisão judicial, sem necessidade de trânsito em julgado.",
    },
    {
      category: "Mandado de Segurança (Art. 5º, LXX)",
      title: "Mandado de Segurança Individual",
      content:
        "LXX - Conceder-se-á mandado de segurança, salvo quando já interposto recurso ordinário, para proteger direito líquido e certo, não ameaçado por ilegalidade ou abuso de poder, contra ato omissão de autoridade pública ou agente dos três poderes de União, dos Estados, do Distrito Federal e Territórios, ou dos membros das forças armadas, ou dos tribunais de contas dos entes federativos, ou ainda de servidor público oficial ou em exercício na esfera privada regulada ou contratada pela União, ou entidade com delegação legislativa, e contra ato ilegal ou abuso de poder que atinge direito subjetivo coletivo ou difuso; o autor, salvo casos próprios, deverá ser assistido por advogado.",
      legalBasis: "Art. 5º, inciso LXX, CF/88",
      keyInsight:
        "Direito líquido e certo, sem necessidade de interposição de recurso administrativo prévio. Em casos de garantia da individualidade de ofensas aos direitos e garantias fundamentais, dispensa-se o advogado.",
    },
    {
      category: "Mandado de Segurança (Art. 5º, LXXIX)",
      title: "Mandado de Segurança Coletivo",
      content:
        "Conceder-se-á mandado de segurança coletivo quando atingirem entidades sindicais ou associações de classe, ou quando for certo, liminar ou judicialmente reconhecido, que interesses de entidades nacionais de defesa de direitos difusos sejam afetados pela omissão ou ilegalidade da autoridade administrativa.",
      legalBasis: "Art. 5º, inciso LXXIX, CF/88",
      keyInsight:
        "Diferente do MS individual (coeso com LXX), o MS COLETIVO destina-se a proteger interesses difusos coletivos (dano ambiental, consumidor, Ordem Profissional, funcionários, patrimônio público).",
    },
    {
      category: "Mandado de Injunção (Art. 5º, LXXI)",
      title: "Mandado de Injunção",
      content:
        "Conceder-se-á mandado de injunção, sempre que fosse possível, na vigência de regulamentação legal, se dificultando ou adiando o ordenamento da vida jurídica da sociedade ou a sua manifestação na vida nacional.",
      legalBasis: "Art. 5º, inciso LXXI, CF/88",
      keyInsight:
        "Em matéria criminal, exige o esgotamento da via administrativa antes de sua impetração. Em matéria trabalhista ou previdenciária, não exige prévia tentativa de acesso ao órgão administrativo.",
    },
    {
      category: "Direitos Fundamentais (Art. 5º)",
      title: "Liberdade de Expressão e Privacidade",
      content:
        "Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.",
      legalBasis: "Art. 5º, caput e incisos, CF/88",
      keyInsight:
        "Liberdade de expressão, de consciência (crença religiosa não será objeto de restrição de direitos ou discriminação) e livre defesa dos interesses de qualquer pessoa ou grupo.",
    },
  ],

  // --- DIREITO ADMINISTRATIVO (Atos Administrativos & Lei 8.112/90) ---
  "atos-administrativos": [
    {
      category: "Extinção de Atos Administrativos",
      title: "Revogação vs Anulação de Atos Administrativos",
      content:
        "Revogação: Extinção do ato administrativo por razões subjetivas (conveniência e oportunidade) e não por vício de legalidade. Suas consequências são PROSPECTIVAS (efeitos ex nunc), não alcançando efeitos retroativos ao passado. A revogação alcança tanto atos genéricos quanto individuais.\nAnulação: Extinção do ato administrativo por razão de ILEGALIDADE (desvio de competência, forma, finalidade, motivo, objeto ou contra procedimento formal). Suas consequências são RETROATIVAS (efeitos ex tunc), anulando a jurídida-facto e a eficácia histórica do ato, salvo se o ato for novado ou convalidável.",
      legalBasis: "Art. 65 da Lei Federal nº 8.112/1990 (Regime Jurídico dos Servidores Públicos Civis); Doutrina Consolidada de Direito Administrativo.",
      keyInsight:
        "Pegadinha Classificada da FCC: Afirmar que a Revogação produz efeitos ex tunc ou que a Anulação tem efeitos ex nunc.",
    },
    {
      category: "Vícios dos Atos Administrativos",
      title: "Desvio de Competência, Forma, Finalidade, Motivo e Objeto",
      content:
        "O Ato Administrativo Válido exige os elementos clássicos (O.S.C.O.M.E.F.O): Órgão Competente, Subjetivo (Procedimento Formal), Objeto Verossímil e Lícito, Motivo Verossímil, Forma Legal e Adequada, Finalidade Alcançada e Oportunidade.\nVício de Competência: Quando o órgão praticante da jurisdição não tem competência legal, se submeter a ofício de controle ou subordinação hierárquica.\nVício de Forma: Quando o agente praticante descumpriu as formalidades legais rigorosas (Lei 9.784/99, Lei 8.429/92, Regimento Interno ou Edital), podendo gerar convalidação expressa ou implícita no caso de incompetência não exclusiva ou forma não essencial.",
      legalBasis: "Art. 57 da Lei Federal nº 8.112/1990; Doutrina de Direito Administrativo.",
      keyInsight:
        "O Desvio de Competência por escopo (incompetência em razão do limite numérico ou das atribuições específicas) não sofre convalidação, tratando-se de incompetência privativa de matéria. Todavia, a incompetência imediata sobre eventualidade factual (jurisdição relativa) permite convalidação expressa ou implícita.",
    },
  ],

  "regime-servidores-lei-8112": [
    {
      category: "Institutos de Provimento de Cargo (Art. 8º)",
      title: "Reintegração vs Reversão vs Recondução",
      content:
        "REINTEGRAÇÃO (Art. 8º, VI e § 1º e § 2º da Lei 8.112/90): Instituto aplicado ao servidor estável cuja DEMISSÃO tenha sido anulada por decisão administrativa ou judicial transitada em julgado. O servidor reintegrado receberá todas as vantagens pecuniárias, estando assegurada a anuência judicial em caso de conflito de provimentos; se o cargo estiver ocupado por servidor estável, este será reconduzido ao cargo de origem, sem direito a indenização, aproveitado em outro cargo ou posto em disponibilidade.\nREVERSÃO (Art. 8º, V e § 1º e § 2º): Instituto aplicado ao servidor que recebeu benefício de APOSENTADORIA e que perde o direito ao gozo daquela aposentadoria por decretamento de remissão ou por extinção da obrigação de dar-lhe continuidade.\nRECONDUÇÃO (Art. 8º, IV): Instituto aplicado ao servidor estável que está no final do prazo de ESTÁGIO PROBATÓRIO e é mantido no cargo, ou a ele reintegrado, por não ser aprovado.",
      legalBasis: "Art. 8º, incisos IV, V e VI e parágrafos da Lei Federal nº 8.112/1990.",
      keyInsight:
        "A REVERSÃO recai sobre aposentados em que houve a perda de direito à aposentadoria; a RECONDUÇÃO exige presença de estágio probatório; a REINTEGRAÇÃO recai sobre demissão anulada.",
    },
    {
      category: "Regime Disciplinar (Arts. 116 a 133)",
      title: "Censure vs Advertência vs Suspensão vs Demissão",
      content:
        "ADVERTÊNCIA (Art. 115, IV): Sanção censuratória aplicável a servidores que, sem dolo, descumprirem normas de conduta, sujeitos a evento cancelamento da punição após 3 anos, salvo reaplicação.\nCENSURA (Art. 115, I e Art. 134): Sanção disciplinar exclusiva e típica da Comissão de Ética Profissional (Decreto 1.171/94). Aplica-se pena de censura e direito de recorrer.\nSUSPENSÃO (Art. 115, II e Art. 117, III): Pena de 10 a 90 dias de suspensão, sem direito a remuneração, aplicável a quem praticar inverdade ou agressão de natureza grave.\nDEMISSÃO (Art. 115, III e Art. 132, caput e §§): Aplica-se nos casos de ABANDONO DE CARGO ou crime doloso resultante de peculado, concussão ou corrupção, sem direito a reintegração, sendo somente permitida READAPTAÇÃO por limitação de capacidade ou acúmulo de privações.",
      legalBasis: "Art. 115, incisos I, II, III e IV; Art. 117; Art. 132 da Lei Federal nº 8.112/1990.",
      keyInsight:
        "O ABANDONO DE CARGO é hipótese autônoma de demissão imediata (não permite prévio procedimento administrativo), exigindo comprovação documental e intensa voz do processo administrativo.",
    },
  ],

  // --- DIREITO ADMINISTRATIVO (Lei 14.133/21 - Licitações e Contratos) ---
  "licitacoes-lei-14133": [
    {
      category: "Hipóteses de Contratação Direta (Art. 74 e 75)",
      title: "Inexigibilidade de Licitação (Art. 74 da Lei 14.133/21)",
      content:
        "Inexigível a licitação quando inviável a competição, em especial nos casos de:\nI - contratação de bens que possuam características específicas que somente poderá ser satisfeita por agentes económicos com autorização judicial, por cargo de confiança ou designação expressa, ou por pessoas físicas;\nII - contratação de obras e serviços de engenharia feitas nas várias modalidades previstas no Regimento Jurídico;\nIII - contratação dos seguintes serviços técnicos especializados de natureza predominantemente intelectual com profissionais ou empresas de notória especialização, vedada a inexigibilidade para serviços de publicidade e divulgação;\nIV - contratação de bens e serviços, ainda que multianuais, provenientes de processos licitatórios passados;\nV - contratação de imóveis para obtenção de serviços ou para instalação de empresas públicas, sociedades de economia mista e concessionárias;\nVI - contratação de bens ou serviços de empresa terceirizada por contrato de concessão ou de permissão; e\nVII - contratação de serviços técnicos especializados, com observância de artigo próprio, para quaisquer das modalidades licitatórias.\nParágrafo único: Nos casos de inexigibilidade por inviabilidade técnica, a justificativa deve ser precisa e detalhada.",
      legalBasis: "Art. 74 da Lei Federal nº 14.133/2021.",
      keyInsight:
        "A Lei 14.133/21 manteve a vedação expressa para INEXIGIBILIDADE em relação a SERVIÇOS DE DIVULGAÇÃO E PUBLICIDADE.",
    },
    {
      category: "Modalidades e Pregão (Art. 28 e 35)",
      title: "Critérios de Julgamento e Modalidade Pregão",
      content:
        "As modalidades estabelecidas pela lei são: (1) PREGÃO, (2) CONCORRÊNCIA, (3) CONCURSO, (4) LEILÃO, (5) DIÁLOGO COMPETITIVO e (6) ADMINISTRATIVA OU DIRETA (Art. 74/75).\nEm se tratando de PREGÃO (Art. 28): O objeto é bens e serviços comuns e padronizados, podendo incluir obras e serviços de engenharia. A modalidade é destinada à melhor ou mais conveniente solução para a contratação dos bens e serviços, de modo a garantir a contratação a quantidade e a qualidade exigidas pelo edital. Os critérios de julgamento no PREGÃO são: (I) menor preço; (II) maior desconto; e (III) melhor técnica ou conteúdo artístico (Art. 29, III).",
      legalBasis: "Art. 28 da Lei Federal nº 14.133/2021.",
      keyInsight:
        "As modalidades formais antigas foram extintas em favor das disposições oficiais da modalidade Unificada.",
    },
  ],

  // --- LÍNGUA PORTUGUESA (Concordância, Crase e Regência) ---
  "lingua-portuguesa": [
    {
      category: "Concordância Verbal",
      title: "Verbos com Sujeito Posposto",
      content:
        "Nos casos de inversão de sujeito na redação formal, o verbo deverá estar de acordo com o SUJEITO REAL, posicionado após a oração ou adjunto adverbial. Ex.: 'Ainda não fora declarada a decisão pelo tribunal' (singular).\nExceção concisa de preposição indireta: 'Ser-lhes deu grande louvor' ou 'Podendo-se aos examinados exigir-lhes a capacidade técnica e legal'.",
      legalBasis: "Manual de Redação e Norma da Gramática Prescritiva (FCC).",
      keyInsight:
        "O verbo deverá concordar com o núcleo do sujeito, ignorando o termo preposicionado anterior e a atração por adjunto como 'aos recursos'.",
    },
    {
      category: "Crase",
      title: "Regras Fundamentais da Crase Antes de Pronome Relativo",
      content:
        "Antes do Pronome Relativo que substitui nominal com preposição (que / quem / onde), o acento grave é colocado quando houver a presença de preposição regente exigida pelo verbo ou pela preposição nominal do anteposto:\nEx.: 'O gestor fez-se acompanhar de pessoa que orientasse a empresa.' (Sem crase antes de 'que' - não há preposição exigida anterior).\nEx.: 'O dirigente convocou a todos os interessados às quais o resultado foi entregue.' (Com crase antes de 'as quais').",
      legalBasis: "Manual de Redação e Norma da Gramática Prescritiva (FCC).",
      keyInsight:
        "A crase NÃO ocorre antes de PALAVRAS MASCULINAS, pronomes indefinidos em geral, pronomes de tratamento (Senhor, Senhora, Excelência), verbos no infinitivo ou substantivo masculino (pé, dia, nome).",
    },
  ],
};

export function findFoundationsForTheme(theme: string): Array<{
  category: string;
  title: string;
  content: string;
  legalBasis: string;
  keyInsight: string;
}> {
  const lower = theme.toLowerCase();
  const matched: Array<{
    category: string;
    title: string;
    content: string;
    legalBasis: string;
    keyInsight: string;
  }> = [];

  // Search exact keys
  if (
    lower.includes("art. 5") ||
    lower.includes("artigo 5") ||
    lower.includes("remédio") ||
    lower.includes("constitui")
  ) {
    matched.push(...FOUNDATION_LIBRARY["artigo-5-liberdades"]);
  }
  if (lower.includes("ato") || lower.includes("admin") || lower.includes("anula") || lower.includes("revoga")) {
    matched.push(...FOUNDATION_LIBRARY["atos-administrativos"]);
  }
  if (
    lower.includes("8.112") ||
    lower.includes("reintegra") ||
    lower.includes("reversão") ||
    lower.includes("vacância") ||
    lower.includes("aposentador")
  ) {
    matched.push(...FOUNDATION_LIBRARY["regime-servidores-lei-8112"]);
  }
  if (
    lower.includes("licita") ||
    lower.includes("14.133") ||
    lower.includes("inexigib") ||
    lower.includes("dispensa") ||
    lower.includes("pregão")
  ) {
    matched.push(...FOUNDATION_LIBRARY["licitacoes-lei-14133"]);
  }
  if (
    lower.includes("crase") ||
    lower.includes("concord") ||
    lower.includes("português") ||
    lower.includes("reescrit") ||
    lower.includes("sintaxe")
  ) {
    matched.push(...FOUNDATION_LIBRARY["lingua-portuguesa"]);
  }

  // If matched is empty, populate with relevant fallback structures for rigor
  if (matched.length === 0) {
    matched.push({
      category: "Aplicação Rigosa à Lei de Regência (Fundamento FCC)",
      title: `Conteúdo Jurisprudencial e Metodologia de Fundamentos (${theme})`,
      content:
        "Nos concursos da Fundação Carlos Chagas (FCC), a resposta oficial corresponde ao dispositivo legal literal rigoroso e jurisprudência sumulada pacificada dos Tribunais de Justiça e dos Tribunais Superiores. O gabarito sempre transcreve o verbatim do artigo legal ou a súmula consolidada que dispõe sobre o pano de fundo normativo de Nível Médio.",
      legalBasis: "Legislação vigente no âmbito jurídico administrativo e regimental federal.",
      keyInsight:
        "A banca FCC testa a literalidade clara do texto legal. Desconfie de qualquer alternativa que use a palavra 'depende' em vez de 'prescinde', ou 'ex tunc' em vez de 'ex nunc' na revisão de atos administrativos.",
    });
  }

  return matched;
}
