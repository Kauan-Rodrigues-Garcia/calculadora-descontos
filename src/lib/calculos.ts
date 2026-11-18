// Lógica de cálculo e geração de mensagens da Calculadora de Descontos.
// Tudo aqui é função pura, sem React, e é testado em tests/calculos.test.ts.

export const SETORES = ["EM DIA", "PLAY 1", "PLAY 2", "PLAY 3", "PLAY 4", "PLAY 5", "PLAY 6"];

export interface DescontosSetor {
  quitacao: number;
  juncao: number;
  /** Desconto sobre uma parcela. */
  parcela: number;
  semestral: number;
  anual: number;
  /** Desconto sobre o total, pago em parcelas pelo PIX Automático. */
  pixAutomatico: number;
  /** Só existe no EM DIA. */
  cartaoRecorrente?: number;
}

export interface DescontosAcordo {
  quitacao: number;
  juncao: number;
  atrasoParcelaVencer: number;
}

/**
 * Percentuais de fábrica. Valem até alguém mudar na aba Configurações.
 * Parcela e PIX Automático: 8% no PLAY 1 e 0% nos demais.
 */
export const DESCONTOS_PADRAO: Record<string, DescontosSetor> = {
  "EM DIA": { quitacao: 20, juncao: 5, parcela: 0, semestral: 6, anual: 12, pixAutomatico: 0, cartaoRecorrente: 8 },
  "PLAY 1": { quitacao: 25, juncao: 12, parcela: 8, semestral: 8, anual: 18, pixAutomatico: 8 },
  "PLAY 2": { quitacao: 35, juncao: 18, parcela: 0, semestral: 18, anual: 25, pixAutomatico: 0 },
  "PLAY 3": { quitacao: 45, juncao: 15, parcela: 0, semestral: 0, anual: 0, pixAutomatico: 0 },
  "PLAY 4": { quitacao: 45, juncao: 15, parcela: 0, semestral: 0, anual: 0, pixAutomatico: 0 },
  "PLAY 5": { quitacao: 45, juncao: 15, parcela: 0, semestral: 0, anual: 0, pixAutomatico: 0 },
  "PLAY 6": { quitacao: 45, juncao: 15, parcela: 0, semestral: 0, anual: 0, pixAutomatico: 0 },
};

export const DESCONTOS_ACORDO_PADRAO: DescontosAcordo = {
  quitacao: 30,
  juncao: 10,
  atrasoParcelaVencer: 5,
};

/** Campos da tela de configuração, na ordem em que aparecem. */
export const CAMPOS_DESCONTO: { chave: keyof DescontosSetor; rotulo: string; ajuda: string }[] = [
  { chave: "quitacao", rotulo: "Quitação", ajuda: "À vista no PIX ou boleto, e no cartão em até 12x." },
  { chave: "juncao", rotulo: "Junção", ajuda: "Parcelas em atraso + a que vai vencer. No EM DIA: mês atual + próximo." },
  { chave: "parcela", rotulo: "Desconto na parcela", ajuda: "Uma parcela com desconto. Com 0%, a opção vem desmarcada." },
  { chave: "semestral", rotulo: "Semestral", ajuda: "6 parcelas. Só aparece se o contrato tiver 6 ou mais." },
  { chave: "anual", rotulo: "Anual", ajuda: "12 parcelas. Só aparece se o contrato tiver 12 ou mais." },
  { chave: "pixAutomatico", rotulo: "PIX Automático", ajuda: "Desconto no total, dividido nas parcelas. Com 0%, vem desmarcado." },
  { chave: "cartaoRecorrente", rotulo: "Cartão recorrente", ajuda: "Desconto no total, cobrado todo mês no cartão." },
];

// ── Percentuais ──────────────────────────────────────────────────────────────

/** Prende um percentual entre 0 e 100. Devolve null se não for número. */
export function limitarPercentual(valor: unknown): number | null {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return null;
  return Math.min(100, Math.max(0, valor));
}

function comoObjeto(valor: unknown): Record<string, unknown> {
  return valor && typeof valor === "object" ? (valor as Record<string, unknown>) : {};
}

/**
 * Junta o que estava salvo no navegador com os padrões de fábrica.
 * Chave que falta (setor novo, desconto novo) vem do padrão; valor salvo fora
 * de 0–100 é preso no limite; lixo é descartado.
 */
export function mesclarDescontosSetor(salvo: unknown): Record<string, DescontosSetor> {
  const obj = comoObjeto(salvo);
  const resultado: Record<string, DescontosSetor> = {};
  for (const setor of SETORES) {
    const padrao = DESCONTOS_PADRAO[setor];
    const doSetor = comoObjeto(obj[setor]);
    const final: DescontosSetor = { ...padrao };
    for (const chave of Object.keys(padrao) as (keyof DescontosSetor)[]) {
      const v = limitarPercentual(doSetor[chave]);
      if (v !== null) final[chave] = v;
    }
    resultado[setor] = final;
  }
  return resultado;
}

export function mesclarDescontosAcordo(salvo: unknown): DescontosAcordo {
  const obj = comoObjeto(salvo);
  const final: DescontosAcordo = { ...DESCONTOS_ACORDO_PADRAO };
  for (const chave of Object.keys(final) as (keyof DescontosAcordo)[]) {
    const v = limitarPercentual(obj[chave]);
    if (v !== null) final[chave] = v;
  }
  return final;
}

// ── Dinheiro ─────────────────────────────────────────────────────────────────

/**
 * Lê dinheiro digitado em português. Devolve null quando não dá para ter
 * certeza do valor, em vez de chutar.
 *
 *   "1.000,00" "1000,00" "1000" "R$ 1.000,00"  → 1000
 *   "1.000"  "1.234.567"                       → ponto de milhar
 *   "1234.56"  "1.5"                           → ponto decimal (1 ou 2 casas)
 *   "1.234.56"  "2,500"  "abc"  "-50"          → null
 */
export function lerValorMonetario(texto: string | null | undefined): number | null {
  if (texto === null || texto === undefined) return null;
  const limpo = String(texto).replace(/R\$/gi, "").replace(/\s/g, "");
  if (!limpo || !/^[\d.,]+$/.test(limpo)) return null;

  let normalizado: string;
  if (limpo.includes(",")) {
    const partes = limpo.split(",");
    if (partes.length > 2) return null;
    const [inteiro, decimal] = partes;
    if (decimal.length > 2) return null;
    if (inteiro.includes(".") && !/^\d{1,3}(\.\d{3})+$/.test(inteiro)) return null;
    normalizado = `${inteiro.replace(/\./g, "") || "0"}.${decimal || "0"}`;
  } else if (limpo.includes(".")) {
    if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) normalizado = limpo.replace(/\./g, "");
    else if (/^\d+\.\d{1,2}$/.test(limpo)) normalizado = limpo;
    else return null;
  } else {
    normalizado = limpo;
  }

  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

/** Arredonda para centavo, meio centavo para cima (0,575 → 0,58). */
export function arredondarCentavos(valor: number): number {
  return Math.round(Number((valor * 100).toFixed(6))) / 100;
}

/** 1234.5 → "1.234,50" (sem o "R$", que a mensagem já escreve). */
export function formatBRL(valor: number): string {
  if (!Number.isFinite(valor)) return "0,00";
  return arredondarCentavos(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Valor já com o desconto, arredondado para centavo. */
export function aplicarDesconto(valor: number, percentual: number): number {
  return arredondarCentavos(valor * (1 - percentual / 100));
}

/**
 * Quantas parcelas o total representa. Arredonda para o inteiro mais perto,
 * porque o total em aberto costuma vir com centavos de juros: 1.000,01 em
 * parcelas de 100 são 10 parcelas, não 11.
 */
export function numeroDeParcelas(valorTotal: number, valorParcela: number): number {
  if (!(valorParcela > 0)) return 0;
  return Math.max(1, Math.round(valorTotal / valorParcela));
}

// ── Entradas ─────────────────────────────────────────────────────────────────

export function setorUsaParcela(setor: string): boolean {
  return setor !== "PLAY 6";
}

export function setorUsaAtraso(setor: string): boolean {
  return setor !== "PLAY 6" && setor !== "EM DIA";
}

export interface EntradasCalculo {
  valorTotal: string;
  valorParcela: string;
  parcelasAtraso: string;
}

export type CampoEntrada = "setor" | "valorTotal" | "valorParcela" | "parcelasAtraso";

export type ResultadoValidacao =
  | { ok: true; valorTotalNum: number; valorParcelaNum: number; parcelasAtrasoNum: number }
  | { ok: false; erros: Partial<Record<CampoEntrada, string>> };

const ERRO_FORMATO = "Valor não reconhecido. Use 1.000,00 ou 1000,00.";

function validarDinheiro(texto: string, vazio: string, nome: string): { valor: number } | { erro: string } {
  if (!texto.trim()) return { erro: vazio };
  const valor = lerValorMonetario(texto);
  if (valor === null) return { erro: ERRO_FORMATO };
  if (valor <= 0) return { erro: `${nome} precisa ser maior que zero.` };
  return { valor };
}

/** Confere o que foi digitado. Campo escondido para o setor é ignorado. */
export function validarEntradas(setor: string, e: EntradasCalculo): ResultadoValidacao {
  const erros: Partial<Record<CampoEntrada, string>> = {};
  if (!setor) erros.setor = "Escolha o setor do cliente.";

  const total = validarDinheiro(e.valorTotal, "Informe o valor total em aberto.", "O valor total");
  if ("erro" in total) erros.valorTotal = total.erro;

  let parcela = 0;
  if (setorUsaParcela(setor)) {
    const r = validarDinheiro(e.valorParcela, "Informe o valor da parcela.", "A parcela");
    if ("erro" in r) erros.valorParcela = r.erro;
    else parcela = r.valor;
  }

  let atraso = 0;
  if (setorUsaAtraso(setor)) {
    const texto = e.parcelasAtraso.trim();
    if (texto && !/^\d+$/.test(texto)) erros.parcelasAtraso = "Use um número inteiro, como 0, 1 ou 2.";
    else atraso = texto ? parseInt(texto, 10) : 0;
  }

  if (Object.keys(erros).length > 0) return { ok: false, erros };
  return { ok: true, valorTotalNum: (total as { valor: number }).valor, valorParcelaNum: parcela, parcelasAtrasoNum: atraso };
}

// ── Opções de pagamento ──────────────────────────────────────────────────────

const EMOJIS_NUMERO = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

/** Emoji numérico (1..10), com fallback para números maiores. */
export function getEmojiNumber(num: number): string {
  return EMOJIS_NUMERO[num - 1] ?? `${num}.`;
}

const NOMES_MES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** Nome do mês atual e do próximo, em português. */
export function mesAtualEProximo(data: Date = new Date()): { atual: string; proximo: string } {
  const indice = data.getMonth();
  return { atual: NOMES_MES[indice], proximo: NOMES_MES[(indice + 1) % 12] };
}

export type OpcaoId =
  | "quitacaoPix"
  | "quitacaoCartao"
  | "juncao"
  | "parcela"
  | "semestral"
  | "anual"
  | "pixAutomatico"
  | "cartaoRecorrente"
  | "regularizar";

/** Uma opção de pagamento já calculada. */
export interface OpcaoCalculada {
  id: OpcaoId;
  /** Nome curto, na lista de opções da tela. */
  label: string;
  /** Percentual aplicado; null quando a opção não tem desconto por natureza. */
  percentual: number | null;
  /** Valor antes do desconto (null quando não há "de → por"). */
  valorOriginal: number | null;
  /** Valor que o cliente paga, como aparece na tela. */
  valorFinal: number;
  /** Complemento para a tela, ex.: "10x de R$ 92,00". */
  detalhe?: string;
  /** Texto na mensagem principal, sem o "*<emoji> - " do começo. */
  conteudo: string;
  /** Uma linha, usada nas mensagens 2 e 3. */
  resumo: string;
  /** Se a opção já vem marcada. Parcela e PIX Automático com 0% vêm desmarcados. */
  ativaPorPadrao: boolean;
}

export interface ParamsOpcoes {
  setor: string;
  valorTotalNum: number;
  valorParcelaNum: number;
  parcelasAtrasoNum: number;
  descontosSetor: DescontosSetor;
  data?: Date;
}

const R = (v: number) => `R$ ${formatBRL(v)}`;

/**
 * Monta as opções que fazem sentido para o setor e os valores informados.
 * A ordem aqui é a ordem da mensagem.
 */
export function construirOpcoes(p: ParamsOpcoes): OpcaoCalculada[] {
  const { setor, valorTotalNum, valorParcelaNum, parcelasAtrasoNum, descontosSetor: d } = p;
  const temParcela = valorParcelaNum > 0;
  const parcelasDoContrato = numeroDeParcelas(valorTotalNum, valorParcelaNum);
  const opcoes: OpcaoCalculada[] = [];

  // Quitação (PIX/boleto e cartão)
  if (d.quitacao > 0) {
    const comDesconto = aplicarDesconto(valorTotalNum, d.quitacao);
    const parcela12x = comDesconto / 12;
    opcoes.push({
      id: "quitacaoPix",
      label: "Quitação à vista (PIX/boleto)",
      percentual: d.quitacao,
      valorOriginal: valorTotalNum,
      valorFinal: comDesconto,
      conteudo: `Quitação* à vista no *BOLETO* ou *PIX* de *${R(valorTotalNum)}* por apenas *${R(comDesconto)}*`,
      resumo: `Quitação à vista no PIX por *${R(comDesconto)}*`,
      ativaPorPadrao: true,
    });
    opcoes.push({
      id: "quitacaoCartao",
      label: "Quitação no cartão (12x)",
      percentual: d.quitacao,
      valorOriginal: valorTotalNum,
      valorFinal: comDesconto,
      detalhe: `12x de ${R(parcela12x)}`,
      conteudo: `Quitação* no *Cartão de Crédito* ficando em até *12x de ${R(parcela12x)}* por mês. (Podendo ser cartão de terceiros)`,
      resumo: `Cartão de crédito (próprio ou de terceiros) em até *12x de ${R(parcela12x)}*`,
      ativaPorPadrao: true,
    });
  }

  // Junção
  if (d.juncao > 0 && temParcela) {
    if (setor === "EM DIA") {
      const { atual, proximo } = mesAtualEProximo(p.data);
      const duas = valorParcelaNum * 2;
      const comDesconto = aplicarDesconto(duas, d.juncao);
      opcoes.push({
        id: "juncao",
        label: "Parcelas do mês (junção)",
        percentual: d.juncao,
        valorOriginal: duas,
        valorFinal: comDesconto,
        conteudo: `Parcelas do mês* (${atual} + ${proximo} com desconto) de *${R(duas)}* por *${R(comDesconto)}* Vencimento: *HOJE*`,
        resumo: `Parcelas de ${atual} + ${proximo} por *${R(comDesconto)}*`,
        ativaPorPadrao: true,
      });
    } else if (parcelasAtrasoNum >= 1) {
      const total = valorParcelaNum * (parcelasAtrasoNum + 1);
      const comDesconto = aplicarDesconto(total, d.juncao);
      const emAtraso = parcelasAtrasoNum === 1 ? "1 parcela em atraso" : `${parcelasAtrasoNum} parcelas em atraso`;
      opcoes.push({
        id: "juncao",
        label: "Junção (atraso + a vencer)",
        percentual: d.juncao,
        valorOriginal: total,
        valorFinal: comDesconto,
        conteudo: `Junção* (${emAtraso} + 1 a vencer) de *${R(total)}* por *${R(comDesconto)}* Vencimento: *HOJE*`,
        resumo: `Junção (${emAtraso} + 1 a vencer) por *${R(comDesconto)}*`,
        ativaPorPadrao: true,
      });
    }
  }

  // Desconto na parcela — aparece sempre que há parcela; com 0% vem desmarcado.
  if (temParcela) {
    const comDesconto = aplicarDesconto(valorParcelaNum, d.parcela);
    const temDesconto = d.parcela > 0;
    opcoes.push({
      id: "parcela",
      label: "Parcela com desconto",
      percentual: d.parcela,
      valorOriginal: temDesconto ? valorParcelaNum : null,
      valorFinal: comDesconto,
      conteudo: temDesconto
        ? `Parcela* com desconto de *${R(valorParcelaNum)}* por *${R(comDesconto)}* Vencimento: *HOJE*`
        : `Parcela* no valor de *${R(valorParcelaNum)}* Vencimento: *HOJE*`,
      resumo: temDesconto ? `Parcela com desconto por *${R(comDesconto)}*` : `Parcela de *${R(valorParcelaNum)}*`,
      ativaPorPadrao: temDesconto,
    });
  }

  // Semestral e anual
  if (d.semestral > 0 && parcelasDoContrato >= 6) {
    const seis = valorParcelaNum * 6;
    const comDesconto = aplicarDesconto(seis, d.semestral);
    opcoes.push({
      id: "semestral",
      label: "Semestral (6 parcelas)",
      percentual: d.semestral,
      valorOriginal: seis,
      valorFinal: comDesconto,
      conteudo: `Semestral* (6 parcelas) de *${R(seis)}* por *${R(comDesconto)}* (PIX ou cartão de crédito)`,
      resumo: `Semestral (6 parcelas) por *${R(comDesconto)}*`,
      ativaPorPadrao: true,
    });
  }
  if (d.anual > 0 && parcelasDoContrato >= 12) {
    const doze = valorParcelaNum * 12;
    const comDesconto = aplicarDesconto(doze, d.anual);
    opcoes.push({
      id: "anual",
      label: "Anuidade (12 parcelas)",
      percentual: d.anual,
      valorOriginal: doze,
      valorFinal: comDesconto,
      conteudo: `Anuidade* (12 parcelas) de *${R(doze)}* por *${R(comDesconto)}* (PIX ou cartão de crédito)`,
      resumo: `Anuidade (12 parcelas) por *${R(comDesconto)}*`,
      ativaPorPadrao: true,
    });
  }

  // PIX Automático — desconto no total, em todos os setores; com 0% vem desmarcado.
  {
    const comDesconto = aplicarDesconto(valorTotalNum, d.pixAutomatico);
    const temDesconto = d.pixAutomatico > 0;
    const n = temParcela ? parcelasDoContrato : 12;
    const novaParcela = comDesconto / n;
    const linhaParcelas = temParcela
      ? `Ficaria em ${n}x de ${R(novaParcela)}${temDesconto ? ` (em vez de ${R(valorParcelaNum)})` : ""}`
      : `Ficaria em até 12x de ${R(novaParcela)}`;
    opcoes.push({
      id: "pixAutomatico",
      label: "PIX Automático",
      percentual: d.pixAutomatico,
      valorOriginal: temDesconto ? valorTotalNum : null,
      valorFinal: comDesconto,
      detalhe: `${temParcela ? "" : "até "}${n}x de ${R(novaParcela)}`,
      conteudo: temDesconto
        ? `PIX Automático* com desconto: de *${R(valorTotalNum)}* por *${R(comDesconto)}*\n${linhaParcelas}`
        : `PIX Automático* no valor de *${R(valorTotalNum)}*\n${linhaParcelas}`,
      resumo: `PIX Automático em ${temParcela ? "" : "até "}*${n}x de ${R(novaParcela)}*`,
      ativaPorPadrao: temDesconto,
    });
  }

  // Cartão recorrente (só EM DIA)
  if (setor === "EM DIA" && temParcela && (d.cartaoRecorrente ?? 0) > 0) {
    const comDesconto = aplicarDesconto(valorTotalNum, d.cartaoRecorrente!);
    const novaParcela = comDesconto / parcelasDoContrato;
    opcoes.push({
      id: "cartaoRecorrente",
      label: "Cartão recorrente",
      percentual: d.cartaoRecorrente!,
      valorOriginal: valorTotalNum,
      valorFinal: comDesconto,
      detalhe: `${parcelasDoContrato}x de ${R(novaParcela)}`,
      conteudo: `Cartão Recorrente* com desconto: de *${R(valorTotalNum)}* por *${R(comDesconto)}*\nFicaria em ${parcelasDoContrato}x de ${R(novaParcela)} no cartão`,
      resumo: `Cartão recorrente em *${parcelasDoContrato}x de ${R(novaParcela)}*`,
      ativaPorPadrao: true,
    });
  }

  // Regularizar parcelas em atraso
  if (temParcela && parcelasAtrasoNum > 0 && setor !== "EM DIA") {
    const valor = valorParcelaNum * parcelasAtrasoNum;
    opcoes.push({
      id: "regularizar",
      label: "Regularizar parcelas em atraso",
      percentual: null,
      valorOriginal: null,
      valorFinal: valor,
      conteudo: `Regularizar parcelas em atraso* no valor de *${R(valor)}* (PIX ou cartão de crédito)`,
      resumo: `Regularização das parcelas em atraso sem juros por *${R(valor)}*`,
      ativaPorPadrao: true,
    });
  }

  return opcoes;
}

/** Quais opções vêm marcadas logo depois do cálculo. */
export function opcoesAtivasPorPadrao(opcoes: OpcaoCalculada[]): OpcaoId[] {
  return opcoes.filter((o) => o.ativaPorPadrao).map((o) => o.id);
}

// ── Mensagens ────────────────────────────────────────────────────────────────

/** Setores que têm 3 versões de mensagem (as outras duas mais duras). */
export function setorTemVariantes(setor: string): boolean {
  return ["PLAY 2", "PLAY 3", "PLAY 4", "PLAY 5", "PLAY 6"].includes(setor);
}

function selecionadas(opcoes: OpcaoCalculada[], ativos: OpcaoId[]): OpcaoCalculada[] {
  const set = new Set(ativos);
  return opcoes.filter((o) => set.has(o.id));
}

/** Mensagem 1: as opções marcadas, numeradas, terminando na contraproposta. */
export function montarMensagemPrincipal(setor: string, opcoes: OpcaoCalculada[], ativos: OpcaoId[]): string {
  let mensagem =
    setor === "EM DIA"
      ? "Segue as propostas COM descontos para te auxiliar :)\n\n"
      : "Segue as propostas que temos hoje vigentes para seu contrato:\n\n";

  let numero = 1;
  for (const opcao of selecionadas(opcoes, ativos)) {
    mensagem += `*${getEmojiNumber(numero)} - ${opcao.conteudo}\n\n`;
    numero++;
  }
  mensagem += `*${getEmojiNumber(numero)} - Contraproposta.*`;
  return mensagem;
}

function itensDasVariantes(opcoes: OpcaoCalculada[], ativos: OpcaoId[]): string[] {
  const itens = selecionadas(opcoes, ativos).map((o) => o.resumo);
  return itens.length > 0 ? itens : ["Contraproposta: diga quanto consegue pagar"];
}

const numerados = (itens: string[]) => itens.map((t, i) => `${getEmojiNumber(i + 1)} ${t}`).join("\n\n");
const marcadores = (itens: string[]) => itens.map((t) => `• ${t}`).join("\n");

/** Mensagens 2 e 3 do PLAY 2 (tom institucional). */
function variantePlay2(variante: number, valorTotalNum: number, itens: string[]): string {
  if (variante === 2) {
    return `Aviso que finaliza HOJE o prazo para *CONCILIAÇÃO AMIGÁVEL* ou manutenção do acordo formalizado do contrato com a empresa.

Sua documentação foi classificada com urgência para despacho no valor de *${R(valorTotalNum)}* + taxas.

### ✅ Opções de resolução imediata:

${numerados(itens)}

⚠️ *Prazo final: HOJE*`;
  }
  return `🚨 NOTIFICAÇÃO FINAL - Processo em andamento

Valor consolidado: ${R(valorTotalNum)}

🔴 MEDIDAS IMEDIATAS DISPONÍVEIS:

${marcadores(itens)}

⏱️ Prazo para resposta: Até o final do dia

*Qual ação será tomada para evitar prosseguimento?*`;
}

/** Mensagens 2 e 3 do PLAY 3 em diante (tom urgente). */
function variantePlay3(variante: number, valorTotalNum: number, itens: string[]): string {
  if (variante === 2) {
    return `🔴 ATENÇÃO: Situação crítica detectada!

Valor em aberto: *${R(valorTotalNum)}*

💰 OFERTA ESPECIAL:
${marcadores(itens)}

⏰ Esta proposta expira em 24h!

*Confirme sua opção para regularizar hoje mesmo.*`;
  }
  return `🚨 Última oportunidade de negociação!

Débito total: ${R(valorTotalNum)}

🎯 CONDIÇÕES FINAIS:
${marcadores(itens)}

⚠️ Após hoje, o caso seguirá para as medidas legais cabíveis.

*Qual opção escolhe para encerrar definitivamente?*`;
}

/**
 * A mensagem pronta para copiar. As três versões usam as mesmas opções
 * marcadas: desmarcar uma tira ela de todas.
 */
export function montarMensagem(
  setor: string,
  variante: number,
  opcoes: OpcaoCalculada[],
  ativos: OpcaoId[],
  valorTotalNum: number,
): string {
  if (variante === 1 || !setorTemVariantes(setor)) return montarMensagemPrincipal(setor, opcoes, ativos);
  const itens = itensDasVariantes(opcoes, ativos);
  return setor === "PLAY 2"
    ? variantePlay2(variante, valorTotalNum, itens)
    : variantePlay3(variante, valorTotalNum, itens);
}

// ── Acordos ativos ───────────────────────────────────────────────────────────

export type ResultadoValidacaoAcordo =
  | { ok: true; valorParcelaNum: number; parcelasRestantesNum: number }
  | { ok: false; erros: Partial<Record<"valorParcela" | "parcelasRestantes", string>> };

export function validarAcordo(valorParcela: string, parcelasRestantes: string): ResultadoValidacaoAcordo {
  const erros: Partial<Record<"valorParcela" | "parcelasRestantes", string>> = {};
  const parcela = validarDinheiro(valorParcela, "Informe o valor da parcela.", "A parcela");
  if ("erro" in parcela) erros.valorParcela = parcela.erro;

  const texto = parcelasRestantes.trim();
  let restantes = 0;
  if (!texto) erros.parcelasRestantes = "Informe quantas parcelas faltam.";
  else if (!/^\d+$/.test(texto) || parseInt(texto, 10) < 1) erros.parcelasRestantes = "Use um número inteiro a partir de 1.";
  else restantes = parseInt(texto, 10);

  if (Object.keys(erros).length > 0) return { ok: false, erros };
  return { ok: true, valorParcelaNum: (parcela as { valor: number }).valor, parcelasRestantesNum: restantes };
}

/** Mensagem para o cliente que já tem acordo ativo e em dia. */
export function gerarMensagemAcordoAtivo(
  valorParcelaNum: number,
  parcelasRestantesNum: number,
  d: DescontosAcordo,
): string {
  const total = valorParcelaNum * parcelasRestantesNum;
  let mensagem = "Segue as opções para seu acordo ativo:\n\n";
  let n = 1;

  if (d.quitacao > 0 && total > 0) {
    const comDesconto = aplicarDesconto(total, d.quitacao);
    mensagem += `*${n} - QUITAÇÃO* no boleto à vista ou PIX: *${R(comDesconto)}* vencimento *HOJE*\n`;
    mensagem += `Economia de *${R(total - comDesconto)}*\n\n`;
    n++;
    mensagem += `*${n} - QUITAÇÃO* no Cartão de crédito: até em *12x de ${R(comDesconto / 12)}* podendo ser de terceiros\n\n`;
    n++;
  }
  if (d.juncao > 0) {
    const juncao = aplicarDesconto(valorParcelaNum * 2, d.juncao);
    mensagem += `*${n} - Parcela a vencer + próximo mês* por *${R(juncao)}* via pix/cartão *HOJE*\n\n`;
    n++;
  }
  if (d.atrasoParcelaVencer > 0) {
    const parcela = aplicarDesconto(valorParcelaNum, d.atrasoParcelaVencer);
    mensagem += `*${n} - Parcela a vencer* por *${R(parcela)}* via pix/cartão *HOJE*\n\n`;
    n++;
  }

  mensagem += "*Qual a melhor opção para negociar hoje e antecipar seu acordo?*";
  return mensagem;
}
