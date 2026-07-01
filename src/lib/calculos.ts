// Lógica de cálculo e geração de mensagens da Calculadora de Descontos.
// Centraliza parsing de valores, formatação, montagem das opções e dos textos,
// evitando duplicação e divergências de comportamento entre as abas.

export interface DescontosSetor {
  quitacao: number;
  juncao: number;
  semestral: number;
  anual: number;
  pixAutomatico?: number;
  cartaoRecorrente?: number;
}

export interface DescontosAcordo {
  quitacao: number;
  juncao: number;
  atrasoParcelaVencer: number;
}

/**
 * Percentual de ACRÉSCIMO do PIX Automático (pagamento recorrente) por setor PLAY.
 * Ex.: PLAY 2 = 20% → uma dívida de R$ 2.500 é apresentada como R$ 3.000.
 * PLAY 1 não tem acréscimo.
 */
export const PERCENT_PIX_AUTO_PLAY: Record<string, number> = {
  "PLAY 1": 0,
  "PLAY 2": 20,
  "PLAY 3": 30,
  "PLAY 4": 40,
  "PLAY 5": 50,
  "PLAY 6": 60,
};

export type OpcaoId =
  | "quitacaoPix"
  | "quitacaoCartao"
  | "juncao"
  | "semestral"
  | "anual"
  | "pixAutomatico"
  | "cartaoRecorrente"
  | "regularizar";

/** Uma opção de pagamento já calculada e pronta para entrar na mensagem. */
export interface OpcaoCalculada {
  id: OpcaoId;
  /** Rótulo curto exibido no checkbox de seleção. */
  label: string;
  /** Texto da opção SEM o prefixo do número (vem após "*<emoji> - "). */
  conteudo: string;
}

/**
 * Converte um valor monetário em string (formato BR) para number.
 * Aceita: "1000", "1.000", "1000,00", "1.000,00".
 * O ponto é sempre tratado como separador de milhar e a vírgula como decimal,
 * conforme os formatos aceitos pela interface. Retorna 0 para valores inválidos.
 */
export function parseValorMonetario(valor: string | number | null | undefined): number {
  if (valor === null || valor === undefined) return 0;
  const texto = String(valor).trim();
  if (!texto) return 0;
  const normalizado = texto.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

/** Formata um number como moeda BR sem símbolo: 1234.5 -> "1234,50". */
export function formatBRL(valor: number): string {
  if (!Number.isFinite(valor)) return "0,00";
  return valor.toFixed(2).replace(".", ",");
}

/** Aplica um desconto percentual e retorna o valor já com desconto. */
export function aplicarDesconto(valor: number, percentual: number): number {
  return valor * (1 - percentual / 100);
}

/** Aplica um acréscimo percentual e retorna o valor já acrescido. */
export function aplicarAcrescimo(valor: number, percentual: number): number {
  return valor * (1 + percentual / 100);
}

const EMOJIS_NUMERO = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

/** Retorna o emoji numérico correspondente (1..9), com fallback para números maiores. */
export function getEmojiNumber(num: number): string {
  return EMOJIS_NUMERO[num - 1] ?? `${num}️⃣`;
}

const NOMES_MES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** Nome do mês atual e do próximo, em português, com base na data informada. */
export function mesAtualEProximo(data: Date = new Date()): { atual: string; proximo: string } {
  const indice = data.getMonth();
  return { atual: NOMES_MES[indice], proximo: NOMES_MES[(indice + 1) % 12] };
}

export interface ParamsOpcoes {
  setor: string;
  valorTotalNum: number;
  valorParcelaNum: number;
  parcelasAtrasoNum: number;
  descontosSetor: DescontosSetor;
}

/**
 * Monta a lista de opções de pagamento aplicáveis ao setor/valores informados.
 * Retorna apenas as opções que fazem sentido (já filtradas pelas regras de negócio);
 * a seleção de quais entram na mensagem final é responsabilidade de quem chama.
 */
export function construirOpcoes(p: ParamsOpcoes): OpcaoCalculada[] {
  const { setor, valorTotalNum, valorParcelaNum, parcelasAtrasoNum, descontosSetor } = p;

  const temParcela = valorParcelaNum > 0;
  const totalLogicoParcelas = temParcela ? Math.round(valorTotalNum / valorParcelaNum) : 0;
  const podeExibirSemestral = totalLogicoParcelas >= 6 && descontosSetor.semestral > 0;
  const podeExibirAnual = totalLogicoParcelas >= 12 && descontosSetor.anual > 0;

  const opcoes: OpcaoCalculada[] = [];

  // 1. QUITAÇÃO PIX
  if (descontosSetor.quitacao > 0) {
    const comDesconto = aplicarDesconto(valorTotalNum, descontosSetor.quitacao);
    opcoes.push({
      id: "quitacaoPix",
      label: "Quitação à vista (PIX/Boleto)",
      conteudo: `Quitação* à vista no *BOLETO* ou *PIX* de *R$ ${formatBRL(valorTotalNum)}* por apenas *R$ ${formatBRL(comDesconto)}*\n\n`,
    });
  }

  // 2. QUITAÇÃO CARTÃO
  if (descontosSetor.quitacao > 0) {
    const comDesconto = aplicarDesconto(valorTotalNum, descontosSetor.quitacao);
    const parcelado12x = comDesconto / 12;
    opcoes.push({
      id: "quitacaoCartao",
      label: "Quitação no cartão (12x)",
      conteudo: `Quitação* no *Cartão de Crédito* ficando em até *12x de R$ ${formatBRL(parcelado12x)}* por mês. (Podendo ser cartão de terceiros)\n\n`,
    });
  }

  // 3. JUNÇÃO
  if (descontosSetor.juncao > 0 && temParcela) {
    if (setor === "EM DIA") {
      const { atual, proximo } = mesAtualEProximo();
      const duasParcelas = valorParcelaNum * 2;
      const comDesconto = aplicarDesconto(duasParcelas, descontosSetor.juncao);
      opcoes.push({
        id: "juncao",
        label: "Parcelas do mês (junção)",
        conteudo: `Parcelas do mês* (${atual} + ${proximo} com desconto) de *R$ ${formatBRL(duasParcelas)}* por *R$ ${formatBRL(comDesconto)}* Vencimento: *HOJE*\n\n`,
      });
    } else if (parcelasAtrasoNum >= 1) {
      // Junção: engloba qualquer quantidade de parcelas em atraso (N em atraso + 1 a vencer)
      const totalJuncao = valorParcelaNum * parcelasAtrasoNum + valorParcelaNum;
      const comDesconto = aplicarDesconto(totalJuncao, descontosSetor.juncao);
      opcoes.push({
        id: "juncao",
        label: "Junção (atraso + a vencer)",
        conteudo: `Junção* (${parcelasAtrasoNum} parcelas em atraso + 1 a vencer) de *R$ ${formatBRL(totalJuncao)}* por *R$ ${formatBRL(comDesconto)}* Vencimento: *HOJE*\n\n`,
      });
    }
  }

  // 4. SEMESTRAL
  if (descontosSetor.semestral > 0 && podeExibirSemestral) {
    const seisParcelas = valorParcelaNum * 6;
    const comDesconto = aplicarDesconto(seisParcelas, descontosSetor.semestral);
    opcoes.push({
      id: "semestral",
      label: "Semestral (6 parcelas)",
      conteudo: `Semestral* (6 parcelas) de *R$ ${formatBRL(seisParcelas)}* por *R$ ${formatBRL(comDesconto)}* (PIX ou cartão de crédito)\n\n`,
    });
  }

  // 5. ANUAL
  if (descontosSetor.anual > 0 && podeExibirAnual) {
    const dozeParcelas = valorParcelaNum * 12;
    const comDesconto = aplicarDesconto(dozeParcelas, descontosSetor.anual);
    opcoes.push({
      id: "anual",
      label: "Anuidade (12 parcelas)",
      conteudo: `Anuidade* (12 parcelas) de *R$ ${formatBRL(dozeParcelas)}* por *R$ ${formatBRL(comDesconto)}* (PIX ou cartão de crédito)\n\n`,
    });
  }

  // 6. PIX AUTOMÁTICO
  if (setor === "EM DIA") {
    // EM DIA: PIX Automático com DESCONTO (lógica original)
    if (temParcela && descontosSetor.pixAutomatico && descontosSetor.pixAutomatico > 0) {
      const comDesconto = aplicarDesconto(valorTotalNum, descontosSetor.pixAutomatico);
      const numeroParcelas = Math.ceil(valorTotalNum / valorParcelaNum);
      const novaParcela = comDesconto / numeroParcelas;
      opcoes.push({
        id: "pixAutomatico",
        label: "PIX Automático",
        conteudo: `PIX Automático* com desconto: de *R$ ${formatBRL(valorTotalNum)}* por *R$ ${formatBRL(comDesconto)}*\nFicaria em ${numeroParcelas}x de R$ ${formatBRL(novaParcela)} (em vez de R$ ${formatBRL(valorParcelaNum)})\n\n`,
      });
    }
  } else {
    // PLAYs: PIX Automático com ACRÉSCIMO por setor, no mesmo modelo de mensagem do EM DIA.
    const percent = PERCENT_PIX_AUTO_PLAY[setor] ?? 0;
    const comAcrescimo = aplicarAcrescimo(valorTotalNum, percent);
    if (temParcela) {
      const numeroParcelas = Math.ceil(valorTotalNum / valorParcelaNum);
      const novaParcela = comAcrescimo / numeroParcelas;
      opcoes.push({
        id: "pixAutomatico",
        label: "PIX Automático",
        conteudo: `PIX Automático* com desconto: de *R$ ${formatBRL(valorTotalNum)}* por *R$ ${formatBRL(comAcrescimo)}*\nFicaria em ${numeroParcelas}x de R$ ${formatBRL(novaParcela)} (em vez de R$ ${formatBRL(valorParcelaNum)})\n\n`,
      });
    } else {
      const parcela12x = comAcrescimo / 12;
      opcoes.push({
        id: "pixAutomatico",
        label: "PIX Automático",
        conteudo: `PIX Automático* com desconto: de *R$ ${formatBRL(valorTotalNum)}* por *R$ ${formatBRL(comAcrescimo)}*\nFicaria em até 12x de R$ ${formatBRL(parcela12x)}\n\n`,
      });
    }
  }

  // 7. CARTÃO RECORRENTE (apenas EM DIA)
  if (setor === "EM DIA" && temParcela && descontosSetor.cartaoRecorrente && descontosSetor.cartaoRecorrente > 0) {
    const comDesconto = aplicarDesconto(valorTotalNum, descontosSetor.cartaoRecorrente);
    const numeroParcelas = Math.ceil(valorTotalNum / valorParcelaNum);
    const novaParcela = comDesconto / numeroParcelas;
    opcoes.push({
      id: "cartaoRecorrente",
      label: "Cartão Recorrente",
      conteudo: `Cartão Recorrente* com desconto: de *R$ ${formatBRL(valorTotalNum)}* por *R$ ${formatBRL(comDesconto)}*\nFicaria em ${numeroParcelas}x de R$ ${formatBRL(novaParcela)} no cartão\n\n`,
    });
  }

  // 8. REGULARIZAR PARCELAS EM ATRASO
  if (temParcela && parcelasAtrasoNum > 0 && setor !== "EM DIA") {
    const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;
    opcoes.push({
      id: "regularizar",
      label: "Regularizar parcelas em atraso",
      conteudo: `Regularizar parcelas em atraso* no valor de *R$ ${formatBRL(valorParcelasAtraso)}* (PIX ou cartão de crédito)\n\n`,
    });
  }

  return opcoes;
}

/**
 * Monta a mensagem principal numerando apenas as opções ativas (na ordem de `opcoes`)
 * e finalizando com a Contraproposta.
 */
export function montarMensagemPrincipal(
  setor: string,
  opcoes: OpcaoCalculada[],
  ativos: OpcaoId[],
): string {
  let mensagem =
    setor === "EM DIA"
      ? "Segue as propostas COM descontos para te auxiliar :)\n\n"
      : "Segue as propostas que temos hoje vigentes para seu contrato:\n\n";

  const ativosSet = new Set(ativos);
  let numero = 1;
  for (const opcao of opcoes) {
    if (!ativosSet.has(opcao.id)) continue;
    mensagem += `*${getEmojiNumber(numero)} - ${opcao.conteudo}`;
    numero++;
  }

  mensagem += `*${getEmojiNumber(numero)} - Contraproposta.*`;
  return mensagem;
}

/** Mensagens diretas/urgentes usadas pelos setores PLAY 3 em diante. */
export function gerarMensagemSetor3EmDiante(
  numeroMensagem: number,
  valorTotalNum: number,
  descontosSetor: DescontosSetor,
): string {
  const valorComDesconto = aplicarDesconto(valorTotalNum, descontosSetor.quitacao);
  const valorParcelado12x = valorComDesconto / 12;

  switch (numeroMensagem) {
    case 1:
      return `📌 Valor atualizado do débito: ~R$ ${formatBRL(valorTotalNum)}~

1️⃣ PIX por apenas *R$ ${formatBRL(valorComDesconto)}*

2️⃣ Cartão de crédito parcelado em até *12x de R$ ${formatBRL(valorParcelado12x)}*

3️⃣ Quero fazer uma contraproposta e negociar agora!

⚠️ URGENTE! O não retorno a esta proposta poderá resultar na continuidade das medidas cabíveis em seu CPF.

*Qual forma de pagamento vamos concluir?*`;

    case 2:
      return `🔴 ATENÇÃO: Situação crítica detectada!

Valor em aberto: *R$ ${formatBRL(valorTotalNum)}*

💰 OFERTA ESPECIAL:
• Quitação à vista: *R$ ${formatBRL(valorComDesconto)}*
• Parcelamento facilitado: *12x R$ ${formatBRL(valorParcelado12x)}*

⏰ Esta proposta expira em 24h!

*Confirme sua opção para regularizar hoje mesmo.*`;

    case 3:
      return `🚨 Última oportunidade de negociação!

Débito total: R$ ${formatBRL(valorTotalNum)}

🎯 CONDIÇÕES FINAIS:
💳 PIX: R$ ${formatBRL(valorComDesconto)}
💳 Cartão: 12x R$ ${formatBRL(valorParcelado12x)}

⚠️ Após hoje, o caso seguirá para as medidas legais cabíveis.

*Qual opção escolhe para encerrar definitivamente?*`;

    default:
      return "";
  }
}

/** Mensagens explicativas/institucionais usadas pelo setor PLAY 2. */
export function gerarMensagemSetor2EmDiante(
  numeroMensagem: number,
  valorTotalNum: number,
  valorParcelaNum: number,
  descontosSetor: DescontosSetor,
  parcelasAtrasoNum: number,
): string {
  const valorComDesconto = aplicarDesconto(valorTotalNum, descontosSetor.quitacao);
  const valorParcelado12x = valorComDesconto / 12;
  const valorJuncao = aplicarDesconto(
    valorParcelaNum * parcelasAtrasoNum + valorParcelaNum,
    descontosSetor.juncao,
  );
  const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;

  switch (numeroMensagem) {
    case 1:
      return `Para evitar restrições e manter seu *nome limpo*, liberamos *condições especiais de negociação* para regularizar seu contrato com a empresa.

### *Opções de pagamento disponíveis:*

1️⃣ Quitação de todas parcelas via PIX R$ *${formatBRL(valorTotalNum)}* → R$ *${formatBRL(valorComDesconto)}*

2️⃣ Quitação total no cartão de crédito (podendo ser de terceiros) em até 12x → *R$ ${formatBRL(valorParcelado12x)}*

3️⃣ Junção (parcelas em atraso + a vencer com desconto) → *R$ ${formatBRL(valorJuncao)}*

4️⃣ Regularização apenas das parcelas em atraso sem juros → *R$ ${formatBRL(valorParcelasAtraso)}*

💳 *Escolha a melhor opção e garanta a paralisação das cobranças hoje mesmo.*

📲 *0800 777 2020 Pagueplay*

✨ *Ao pagar hoje, você elimina encargos, taxas e finaliza o pedido de possível processo.* Essa é a *oportunidade de resolver sua situação* e *garantir seu certificado 🎓* sem preocupações futuras.`;

    case 2:
      return `Aviso que finaliza HOJE o prazo para *CONCILIAÇÃO AMIGÁVEL* ou manutenção do acordo formalizado do contrato com a empresa.

Sua documentação foi classificada com urgência para despacho no valor de *R$ ${formatBRL(valorTotalNum)}* + taxas.

### ✅ Opções de resolução imediata:

1️⃣ Quitação de TODAS as parcelas via PIX por *R$ ${formatBRL(valorComDesconto)}*

2️⃣ Cartão de crédito (próprio ou terceiros) em até *12x de R$ ${formatBRL(valorParcelado12x)}*

3️⃣ Junção (parcelas em atraso + a vencer) por *R$ ${formatBRL(valorJuncao)}*

4️⃣ Regularização das parcelas em atraso sem juros por *R$ ${formatBRL(valorParcelasAtraso)}*

⚠️ *Prazo final: HOJE*`;

    case 3:
      return `🚨 NOTIFICAÇÃO FINAL - Processo em andamento

Valor consolidado: R$ ${formatBRL(valorTotalNum)}

🔴 MEDIDAS IMEDIATAS DISPONÍVEIS:

• Acordo total PIX: *R$ ${formatBRL(valorComDesconto)}*
• Parcelamento cartão: *12x R$ ${formatBRL(valorParcelado12x)}*
• Regularização parcial: *R$ ${formatBRL(valorParcelasAtraso)}*

⏱️ Prazo para resposta: Até o final do dia

*Qual ação será tomada para evitar prosseguimento?*`;

    default:
      return "";
  }
}
