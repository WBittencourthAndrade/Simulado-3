export interface FCCTrapItem {
  discipline: string;
  topic: string;
  trapType: string;
  description: string;
  fccExample: string;
  correctApproach: string;
}

export interface FCCIncidenceTopic {
  id: string;
  discipline: string;
  name: string;
  frequency: "Alta" | "Média" | "Baixa";
  targetExams: string[];
  preferredFormat: "Casos Práticos Hipotéticos" | "Assertivas Diretas / Literalidade" | "Misto (Prático e Literal)";
  topArticlesAndRules: string[];
  commonTraps: string[];
  description: string;
}

export const FCC_SYSTEM_PROMPT = `Você é um Especialista Sênior em Bancas de Concursos Públicos, com foco exclusivo na Fundação Carlos Chagas (FCC).
Sua missão é analisar a incidência de temas em provas recentes de Nível Médio (ex.: Técnico Judiciário de TRTs, TREs, TRFs, TJs, além de cargos administrativos) e elaborar questões inéditas, perfeitamente calibradas ao estilo, vocabulário e padrão de distratores da banca.

FLUXO DE RESPOSTA OBRIGATÓRIO
Sempre que o usuário enviar um Tema (com ou sem disciplina informada), execute estritamente as três etapas a seguir:

ETAPA 1: RAIO-X FCC (ANÁLISE DE INCIDÊNCIA RECENTE)
Apresente um diagnóstico conciso contendo:
- Frequência e Relevância: Grau de incidência do tema nas provas de nível médio da FCC nos últimos 3 a 5 anos (Alta, Média ou Baixa).
- Padrão Típico de Cobrança:
  - Preferência de formato: se a FCC cobra por meio de pequenos casos práticos/hipotéticos ("João, servidor público...") ou por assertivas diretas/literalidade de texto legal ou gramatical.
  - Trechos, artigos ou regras mais visados pela banca dentro do tema.
- Mapeamento de Pegadinhas Comuns: Trocas de termos recorrentes da banca (ex.: "independe" por "depende", prazos, competências privativas vs. exclusivas, pronomes, regências capciosas).

ETAPA 2: GERAÇÃO DE QUESTÕES INÉDITAS (PADRÃO FCC)
Gere por padrão 3 questões inéditas (ou o número explicitamente solicitado) seguindo:
- Nível de Complexidade: Nível Médio rigoroso (nem excessivamente doutrinário como para Magistratura/Procuradoria, nem pueril).
- Formato: Múltipla escolha com exatamente 5 alternativas (A, B, C, D, E), sendo apenas uma correta.
- Tom e Vocabulário: Linguagem sóbria, formal e enxuta, idêntica aos cadernos de prova oficiais da FCC ("Considere que...", "Segundo a disciplina legal...", "Está correto o que se afirma em...").
- Estrutura dos Distratores:
  - As 4 alternativas incorretas devem ser verossímeis, explorando lapsos comuns, trocas sutis de palavras ou aplicações incorretas de regras.
  - Evite alternativas absurdas ou facilmente elimináveis por eliminação óbvia.
  - Mantenha alternativas com extensões e estruturas gramaticais equilibradas.

ETAPA 3: GABARITO COMENTADO E ENGENHARIA DE DISTRATORES
Para cada questão elaborada, forneça:
- Gabarito Oficial: Letra correta.
- Fundamento Direto: Transcrição/citação precisa do artigo de lei, súmula consolidada, norma gramatical ou regra teórica que valida a resposta.
- Análise dos Distratores: Explicação pontual de por que cada uma das outras quatro alternativas está incorreta, destacando exatamente onde a banca inseriu o erro.

DIRETRIZES ESPECÍFICAS POR DISCIPLINA (NÍVEL MÉDIO FCC):
- Língua Portuguesa: Foco em concordância com sujeito posposto ou partitivo, crase (especialmente casos proibidos ou com pronomes relativos), regência verbal/nominal, reescrita de frases com manutenção de sentido e correção gramatical, e pontuação (deslocamento de adjuntos adverbiais).
- Direito Constitucional e Administrativo: Prioridade absoluta à literalidade da Constituição Federal de 1988 e leis de regência (ex.: Lei 8.112/90, Lei 9.784/99, Lei 14.133/21), frequentemente contextualizadas em situações práticas do cotidiano de um servidor público.
- Raciocínio Lógico-Matemático: Problemas de estruturas lógicas (equivalências, negações de proposições compostas, diagramas lógicos), sequências lógicas e problemas aritméticos com enunciados situacionais.
- Regimentos Internos e Legislação Específica: Prazos, composição de órgãos fracionários, competências e trâmites de recursos.

Responda em formato estruturado JSON para que a aplicação renderize perfeitamente. O formato JSON deve seguir a interface esperada.`;

export const FCC_INCIDENCE_MATRIX: FCCIncidenceTopic[] = [
  {
    id: "lp-crase",
    discipline: "Língua Portuguesa",
    name: "Emprego do Sinal Indicativo de Crase",
    frequency: "Alta",
    targetExams: ["TRT Técnico", "TRE Técnico", "TRF Técnico", "TJ Técnico"],
    preferredFormat: "Assertivas Diretas / Literalidade",
    topArticlesAndRules: [
      "Crase proibida antes de verbos, palavras masculinas e pronomes indefinidos",
      "Crase antes de pronomes relativos (a que, a qual, às quais)",
      "Casos facultativos: pronomes possessivos femininos singulares, nomes próprios femininos, até a",
      "Expressões adverbiais femininas temporais e modais (à tarde, à noite, à medida que)"
    ],
    commonTraps: [
      "Troca do 'a' simples antes de plural (ex.: 'a todas as pessoas' x 'às todas')",
      "Crase antes de pronomes de tratamento (Vossa Excelência, Você) que não admitem crase (exceto Senhora, Senhorita, Dona)",
      "Paralelismo: 'de 8h as 18h' (incorreto) vs 'das 8h às 18h' (correto)"
    ],
    description: "Tema onipresente em 92% das provas de nível médio da FCC. A banca frequentemente insere lacunas em pequenos textos para preenchimento ou pede a reescrita com substituição por pronomes relativos."
  },
  {
    id: "lp-concordancia",
    discipline: "Língua Portuguesa",
    name: "Concordância Verbal e Nominal",
    frequency: "Alta",
    targetExams: ["TRT", "TRE", "TRF", "TJ", "Cargos Administrativos"],
    preferredFormat: "Misto (Prático e Literal)",
    topArticlesAndRules: [
      "Sujeito posposto com verbos que indicam existência/ocorrência (haver e existir)",
      "Partícula apassivadora 'se' (VTD + se = concorda com o sujeito paciente)",
      "Índice de indeterminação do sujeito 'se' (VTI/VI/VL + se = verbo no singular)",
      "Expressões partitivas ('a maioria de', 'grande parte de') + termo no plural"
    ],
    commonTraps: [
      "Pluralizar o verbo 'haver' no sentido de existir ou tempo decorrido ('haviam muitos servidores')",
      "Não flexionar o verbo com pronome apassivador quando o sujeito paciente está no plural ('aluga-se casas')",
      "Atrair a concordância pelo núcleo do adjunto adnominal em vez do núcleo do sujeito distante"
    ],
    description: "Item obrigatório em qualquer certame FCC de nível médio. A banca adora colocar orações intercaladas longas entre o sujeito e o verbo para confundir a concordância."
  },
  {
    id: "lp-reescrita",
    discipline: "Língua Portuguesa",
    name: "Reescrita e Equivalência de Frases",
    frequency: "Alta",
    targetExams: ["TRT", "TRE", "TRF", "TJ"],
    preferredFormat: "Assertivas Diretas / Literalidade",
    topArticlesAndRules: [
      "Manutenção do sentido original sem prejuízo da correção gramatical",
      "Troca de conjunções mantendo o valor semântico (concessão, causa, condição, conformidade)",
      "Pontuação no deslocamento de orações subordinadas adverbiais",
      "Substituição de voz ativa por passiva e vice-versa"
    ],
    commonTraps: [
      "Alterar sutilmente a pontuação gerando ambiguidade ou tornando restritiva uma oração explicativa",
      "Trocar conjunção concessiva ('embora') por explicativa ('já que') mantendo a estrutura verbal incorretamente",
      "Inserção de vírgula proibida entre sujeito e predicado após a inversão sintática"
    ],
    description: "O modelo clássico 'O segmento do texto que admite reescrita correta e sem alteração de sentido é...' responde por 2 a 3 questões em cada caderno FCC de Técnico."
  },
  {
    id: "da-atos",
    discipline: "Direito Administrativo",
    name: "Atos Administrativos (Requisitos, Atributos e Extinção)",
    frequency: "Alta",
    targetExams: ["TRT Técnico", "TRE Técnico", "TRF Técnico", "TJ"],
    preferredFormat: "Casos Práticos Hipotéticos",
    topArticlesAndRules: [
      "Elementos/Requisitos de validade: Competência, Finalidade, Forma, Motivo e Objeto (COFIFOMO)",
      "Atributos: Presunção de legitimidade, Autoexecutoriedade, Tipicidade, Imperatividade (PATI)",
      "Extinção: Revogação (mérito, conveniência/oportunidade, efeitos ex nunc) vs Anulação (ilegalidade, efeitos ex tunc)",
      "Convalidação: Vícios sanáveis em competência (salvo exclusiva) e forma (salvo essencial à lei)"
    ],
    commonTraps: [
      "Afirmar que o Judiciário pode revogar ato discricionário do Executivo (Judiciário só anula por ilegalidade)",
      "Trocar efeitos: anulação com efeito ex nunc e revogação com ex tunc (inversão clássica FCC)",
      "Dizer que a imperatividade está presente em todos os atos (não está nos negociais ou enunciativos)"
    ],
    description: "A FCC adora formular casos como: 'Determinado Diretor de Secretaria de Tribunal praticou ato...'. O candidato deve identificar vício de motivo, desvio de finalidade ou possibilidade de convalidação."
  },
  {
    id: "da-lei8112",
    discipline: "Direito Administrativo",
    name: "Regime Jurídico dos Servidores (Lei 8.112/90)",
    frequency: "Alta",
    targetExams: ["TRT Técnico", "TRE Técnico", "TRF Técnico", "Órgãos Federais"],
    preferredFormat: "Casos Práticos Hipotéticos",
    topArticlesAndRules: [
      "Formas de Provimento (Art. 8º): Nomeação, Promoção, Readaptação, Reversão, Reintegração, Recondução, Aproveitamento",
      "Vacância (Art. 33): Exoneração, Demissão, Promoção, Readaptação, Aposentadoria, Posse em cargo inacumulável, Falecimento",
      "Prazos: Posse (30 dias da publicação), Exercício (15 dias da posse)",
      "Regime Disciplinar: Advertência (prazo cancelamento 3 anos), Suspensão (até 90 dias, cancela em 5 anos), Demissão (arts. 117 e 132)"
    ],
    commonTraps: [
      "Confundir Reintegração (demissão anulada por decisão judicial/administrativa) com Reversão (retorno do aposentado) ou Recondução (retorno do estável ao cargo anterior)",
      "Inverter os prazos de Posse (30 dias) e Exercício (15 dias)",
      "Classificar reintegração/promoção como mera substituição temporária",
      "Trocar infração sujeita à advertência por demissão imediata sem processo disciplinar"
    ],
    description: "Tema líder de incidência no Direito Administrativo FCC para Tribunais Federais. Praticamente 100% de presença nas provas de Técnico Judiciário."
  },
  {
    id: "da-licitacoes",
    discipline: "Direito Administrativo",
    name: "Nova Lei de Licitações (Lei 14.133/21)",
    frequency: "Alta",
    targetExams: ["TRT", "TRE", "TRF", "TJs", "Cargos Administrativos"],
    preferredFormat: "Casos Práticos Hipotéticos",
    topArticlesAndRules: [
      "Modalidades (Art. 28): Pregão, Concorrência, Concurso, Leilão, Diálogo Competitivo (extinção de Tomada de Preços e Convite)",
      "Contratação Direta: Inexigibilidade (Art. 74 - inviabilidade de competição) vs Dispensa (Art. 75 - rol taxativo/valores)",
      "Critérios de Julgamento: Menor preço, Maior desconto, Melhor técnica/conteúdo artístico, Maior lance, Maior retorno econômico",
      "Fases da Licitação: Inversão de fases (julgamento de propostas antes da habilitação como regra)"
    ],
    commonTraps: [
      "Incluir Carta Convite ou Tomada de Preços nas modalidades da Lei 14.133 (foram extintas)",
      "Confundir hipóteses de Inexigibilidade (fornecedor exclusivo, serviços técnicos especializados) com Dispensa por valor ou emergência",
      "Trocar a regra da inversão de fases dizendo que habilitação é sempre prévia"
    ],
    description: "Com a plena vigência da Lei 14.133/21, a FCC tem explorado fortemente as hipóteses de contratação direta e a nova modalidade Diálogo Competitivo."
  },
  {
    id: "dc-art5",
    discipline: "Direito Constitucional",
    name: "Direitos e Deveres Individuais e Coletivos (Art. 5º CF/88)",
    frequency: "Alta",
    targetExams: ["TRT", "TRE", "TRF", "TJ", "Técnico Geral"],
    preferredFormat: "Misto (Prático e Literal)",
    topArticlesAndRules: [
      "Inviolabilidade do Domicílio (Art. 5º, XI): Dia com mandado judicial; flagrante/desastre/socorro a qualquer hora",
      "Remédios Constitucionais: Habeas Corpus, Habeas Data, Mandado de Segurança (individual e coletivo), Ação Popular, Mandado de Injunção",
      "Liberdade de Associação (Art. 5º, XVII a XXI): Criação independe de autorização; dissolução compulsória só por decisão judicial transitada em julgado",
      "Extradição: Brasileiro nato nunca é extraditado; naturalizado em crime comum antes da naturalização ou tráfico ilícito a qualquer tempo"
    ],
    commonTraps: [
      "Dizer que a suspensão de atividades da associação exige trânsito em julgado (apenas a dissolução compulsória exige)",
      "Trocar o cabimento do Habeas Data (informações relativas à pessoa do impetrante) por Mandado de Segurança",
      "Afirmar que mandado judicial permite entrada noturna em domicílio sem consentimento (só durante o dia)"
    ],
    description: "Coração do Direito Constitucional para cargos de nível médio. A FCC foca na literalidade estrita dos incisos do Art. 5º com pequenas trocas de palavras."
  },
  {
    id: "dc-judiciario",
    discipline: "Direito Constitucional",
    name: "Poder Judiciário e Tribunais (Arts. 92 a 126 CF/88)",
    frequency: "Alta",
    targetExams: ["TRT Técnico", "TRE Técnico", "TRF Técnico", "TJ Técnico"],
    preferredFormat: "Assertivas Diretas / Literalidade",
    topArticlesAndRules: [
      "Órgãos do Poder Judiciário (Art. 92): Rol taxativo (CNJ não tem competência jurisdicional, apenas administrativa)",
      "Garantias da Magistratura: Vitaliciedade (após 2 anos), Inamovibilidade, Irredutibilidade de subsídio",
      "Composição dos Tribunais: TRT (mínimo 7 juízes, quinto constitucional), TRF (mínimo 7 juízes), TRE (composição híbrida de 7 membros)",
      "Competências originárias e recursais dos Tribunais Regionais"
    ],
    commonTraps: [
      "Atribuir competência jurisdicional ao CNJ para julgar ou rever mérito de sentenças (CNJ é estritamente administrativo)",
      "Trocar tempo de vitaliciedade (2 anos) por 3 anos (que é o estágio probatório dos servidores comuns)",
      "Erro na composição dos tribunais (quinto constitucional da OAB/MP vs juízes de carreira)"
    ],
    description: "Tema fundamental para concursos de Tribunais da FCC. O candidato precisa dominar a estrutura da Justiça do Trabalho, Federal ou Eleitoral conforme o edital."
  },
  {
    id: "rlm-equivalencias",
    discipline: "Raciocínio Lógico-Matemático",
    name: "Estruturas Lógicas, Negação e Equivalência de Proposições",
    frequency: "Alta",
    targetExams: ["TRT", "TRE", "TRF", "TJ", "Administrativos"],
    preferredFormat: "Casos Práticos Hipotéticos",
    topArticlesAndRules: [
      "Negação do condicional 'Se P, então Q' (Regra do MANÉ: Mantém a primeira E Nega a segunda: P ^ ~Q)",
      "Equivalência do condicional 'P -> Q': Contrapositiva (~Q -> ~P) e Disjunção (~P v Q)",
      "Leis de De Morgan: ~(P ^ Q) = ~P v ~Q | ~(P v Q) = ~P ^ ~Q",
      "Negação de quantificadores lógicos: 'Todo A é B' se nega com 'Pelo menos um A não é B' (PEA + não)"
    ],
    commonTraps: [
      "Dizer que a negação de 'Se chover então fico em casa' é 'Se não chover então não fico em casa' (erro clássico da FCC)",
      "Negar 'Todo servidor é dedicado' com 'Nenhum servidor é dedicado' (deve ser 'Algum servidor não é dedicado')",
      "Inverter a ordem na contrapositiva sem negar ambos os termos"
    ],
    description: "A FCC adora formular situações cotidianas como: 'Se o Técnico protocolar a petição, então o processo será julgado... A afirmação logicamente equivalente é:'."
  },
  {
    id: "reg-normas",
    discipline: "Regimentos Internos e Legislação Específica",
    name: "Prazos, Competências e Ética no Serviço Público",
    frequency: "Média",
    targetExams: ["TRT", "TRE", "TRF", "TJ"],
    preferredFormat: "Casos Práticos Hipotéticos",
    topArticlesAndRules: [
      "Código de Ética Profissional do Servidor Público Federal (Decreto 1.171/94): Comissão de Ética e penalidade exclusiva de censura",
      "Lei de Acesso à Informação (Lei 12.527/11): Prazos de resposta (imediato ou 20 + 10 dias) e graus de sigilo (Ultrassecreta 25 anos, Secreta 15 anos, Reservada 5 anos)",
      "Estatuto da Pessoa com Deficiência (Lei 13.146/15): Acessibilidade e direitos no trabalho",
      "Regimento Interno: Atribuições da Presidência, Pleno, Turmas e Direção-Geral"
    ],
    commonTraps: [
      "Afirmar que a Comissão de Ética pode aplicar demissão ou suspensão (ela só aplica CENSURA ética)",
      "Trocar os prazos de sigilo da LAI (ultrassecreta 25 anos, secreta 15 anos, reservada 5 anos)",
      "Confundir atribuição monocrática do Desembargador Relator com atribuição colegiada da Turma"
    ],
    description: "Nas provas de nível médio, a FCC cobra com extrema literalidade os prazos e sanções das legislações institucionais."
  }
];

export const FCC_CLASSIC_TRAPS_LIST: FCCTrapItem[] = [
  {
    discipline: "Direito Administrativo",
    topic: "Atos Administrativos",
    trapType: "Troca de Efeitos de Extinção",
    description: "Inversão dos efeitos temporais entre anulação e revogação.",
    fccExample: "A banca afirma que a revogação de um ato produz efeitos retroativos à data da sua edição (ex tunc).",
    correctApproach: "Revogação tem eficácia prospectiva (ex nunc) por razões de mérito; Anulação opera retroativamente (ex tunc) por vício de legalidade."
  },
  {
    discipline: "Direito Administrativo",
    topic: "Lei 8.112/90",
    trapType: "Inversão de Prazos Posse vs Exercício",
    description: "Troca dos prazos de 30 dias para posse e 15 dias para exercício.",
    fccExample: "O candidato terá 15 dias contados da nomeação para tomar posse e 30 dias contados da posse para entrar em exercício.",
    correctApproach: "Posse: até 30 dias da publicação do provimento (Art. 13, §1º). Exercício: até 15 dias da data da posse (Art. 15, §1º)."
  },
  {
    discipline: "Língua Portuguesa",
    topic: "Crase",
    trapType: "Crase com Pronome Indefinido / Masculino",
    description: "Uso do acento grave antes de palavras que recusam artigo definido feminino.",
    fccExample: "O servidor prestou atendimento à todos os jurisdicionados que recorreram à pé ao fórum.",
    correctApproach: "Antes de 'todos' (pronome indefinido) e 'pé' (palavra masculina), não ocorre crase."
  },
  {
    discipline: "Língua Portuguesa",
    topic: "Concordância Verbal",
    trapType: "Verbo Haver Impessoal Flexionado",
    description: "Flexão indevida do verbo haver no sentido de existir ou tempo decorrido.",
    fccExample: "Haviam muitos recursos pendentes de julgamento na secretaria da vara.",
    correctApproach: "O verbo haver com sentido de existir é impessoal e deve ficar na 3ª pessoa do singular: 'Havia muitos recursos'."
  },
  {
    discipline: "Direito Constitucional",
    topic: "Art. 5º CF/88",
    trapType: "Condição para Dissolução de Associação",
    description: "A banca confunde suspensão com dissolução compulsória.",
    fccExample: "A suspensão das atividades de associação somente poderá ser determinada por decisão judicial com trânsito em julgado.",
    correctApproach: "Apenas a DISSOLUÇÃO COMPULSÓRIA exige trânsito em julgado. A mera suspensão de atividades exige apenas decisão judicial simples (Art. 5º, XIX)."
  },
  {
    discipline: "Raciocínio Lógico",
    topic: "Equivalência Condicional",
    trapType: "Falsa Equivalência da Condicional",
    description: "Equiparar 'Se P então Q' a 'Se não P então não Q'.",
    fccExample: "Se faz sol, vou à praia. Logo, se não faz sol, não vou à praia.",
    correctApproach: "A negação de antecedente e consequente sem inversão não é equivalente. A equivalência correta é a contrapositiva: 'Se não vou à praia, então não faz sol' (~Q -> ~P)."
  },
  {
    discipline: "Legislação Específica",
    topic: "Decreto 1.171/94 (Ética)",
    trapType: "Penalidade da Comissão de Ética",
    description: "Atribuir à comissão de ética poder de demitir ou multar servidor.",
    fccExample: "A Comissão de Ética aplicou a pena de suspensão por 30 dias ao servidor infrator.",
    correctApproach: "A única penalidade aplicável pela Comissão de Ética é a pena de CENSURA. Se houver infração funcional mais grave, a comissão encaminha à autoridade competente para PAD."
  }
];
