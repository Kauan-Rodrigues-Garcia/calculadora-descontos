// Roda com: npm test   (node --test, sem dependência extra)
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  lerValorMonetario,
  formatBRL,
  aplicarDesconto,
  numeroDeParcelas,
  validarEntradas,
  construirOpcoes,
  opcoesAtivasPorPadrao,
  montarMensagem,
  mesclarDescontosSetor,
  mesclarDescontosAcordo,
  validarAcordo,
  gerarMensagemAcordoAtivo,
  DESCONTOS_PADRAO,
  SETORES,
} from "../src/lib/calculos.ts";
import type { DescontosSetor, OpcaoId } from "../src/lib/calculos.ts";

const NOV = new Date(2026, 10, 18);

function opcoes(setor: string, total: number, parcela: number, atraso = 0, d?: Partial<DescontosSetor>) {
  return construirOpcoes({
    setor,
    valorTotalNum: total,
    valorParcelaNum: parcela,
    parcelasAtrasoNum: atraso,
    descontosSetor: { ...DESCONTOS_PADRAO[setor], ...d },
    data: NOV,
  });
}
const ids = (lista: { id: OpcaoId }[]) => lista.map((o) => o.id);
const opcao = (lista: ReturnType<typeof opcoes>, id: OpcaoId) => lista.find((o) => o.id === id)!;

describe("lerValorMonetario", () => {
  it("aceita os formatos que a pessoa digita", () => {
    assert.equal(lerValorMonetario("1000"), 1000);
    assert.equal(lerValorMonetario("1.000"), 1000);
    assert.equal(lerValorMonetario("1000,00"), 1000);
    assert.equal(lerValorMonetario("1.000,00"), 1000);
    assert.equal(lerValorMonetario("R$ 1.000,00"), 1000);
    assert.equal(lerValorMonetario(" 1.234.567,8 "), 1234567.8);
  });
  it("ponto com 1 ou 2 casas é decimal (valor colado de planilha)", () => {
    assert.equal(lerValorMonetario("1234.56"), 1234.56);
    assert.equal(lerValorMonetario("1.5"), 1.5);
  });
  it("recusa o que é ambíguo ou não é dinheiro", () => {
    for (const t of ["", "abc", "-50", "1.234.56", "2,500", "1,2,3", "12.34.567"]) {
      assert.equal(lerValorMonetario(t), null, t);
    }
  });
});

describe("formatação e arredondamento", () => {
  it("usa ponto de milhar e vírgula decimal", () => {
    assert.equal(formatBRL(2500), "2.500,00");
    assert.equal(formatBRL(1234567.891), "1.234.567,89");
  });
  it("meio centavo arredonda para cima", () => {
    assert.equal(aplicarDesconto(1.15, 50), 0.58);
  });
  it("conta de parcelas ignora centavos de juros", () => {
    assert.equal(numeroDeParcelas(1000.01, 100), 10);
    assert.equal(numeroDeParcelas(1000, 0), 0);
  });
});

describe("validarEntradas", () => {
  it("valor em formato errado vira erro, não zero", () => {
    const r = validarEntradas("PLAY 2", { valorTotal: "1.234.56", valorParcela: "100", parcelasAtraso: "" });
    assert.equal(r.ok, false);
    if ("erros" in r) assert.match(r.erros.valorTotal!, /não reconhecido/);
  });
  it("exige parcela onde ela é usada e ignora onde não é", () => {
    const play2 = validarEntradas("PLAY 2", { valorTotal: "1000", valorParcela: "", parcelasAtraso: "" });
    assert.equal(play2.ok, false);
    const play6 = validarEntradas("PLAY 6", { valorTotal: "1000", valorParcela: "lixo", parcelasAtraso: "x" });
    assert.deepEqual(play6, { ok: true, valorTotalNum: 1000, valorParcelaNum: 0, parcelasAtrasoNum: 0 });
  });
  it("atraso precisa ser inteiro", () => {
    const r = validarEntradas("PLAY 1", { valorTotal: "1000", valorParcela: "100", parcelasAtraso: "1,5" });
    assert.equal(r.ok, false);
  });
  it("sem setor não calcula", () => {
    const r = validarEntradas("", { valorTotal: "1000", valorParcela: "100", parcelasAtraso: "" });
    assert.equal(r.ok, false);
  });
});

describe("padrões de parcela e PIX Automático", () => {
  it("PLAY 1 tem 8% nos dois; os demais setores 0%", () => {
    for (const setor of SETORES) {
      const esperado = setor === "PLAY 1" ? 8 : 0;
      assert.equal(DESCONTOS_PADRAO[setor].parcela, esperado, setor);
      assert.equal(DESCONTOS_PADRAO[setor].pixAutomatico, esperado, setor);
    }
  });

  it("PLAY 1: parcela e PIX Automático com desconto, já marcados", () => {
    const lista = opcoes("PLAY 1", 1000, 100);
    const parcela = opcao(lista, "parcela");
    assert.equal(parcela.valorFinal, 92);
    assert.equal(parcela.ativaPorPadrao, true);
    assert.match(parcela.conteudo, /de \*R\$ 100,00\* por \*R\$ 92,00\*/);

    const pix = opcao(lista, "pixAutomatico");
    assert.equal(pix.valorFinal, 920);
    assert.equal(pix.ativaPorPadrao, true);
    assert.match(pix.conteudo, /com desconto: de \*R\$ 1\.000,00\* por \*R\$ 920,00\*/);
    assert.match(pix.conteudo, /10x de R\$ 92,00 \(em vez de R\$ 100,00\)/);
  });

  it("PIX Automático nunca aumenta o valor", () => {
    for (const setor of SETORES) {
      const pix = opcao(opcoes(setor, 2500, 250), "pixAutomatico");
      assert.ok(pix.valorFinal <= 2500, setor);
    }
  });

  it("com 0% as duas opções aparecem desmarcadas e sem falar em desconto", () => {
    const lista = opcoes("PLAY 2", 2500, 250);
    for (const id of ["parcela", "pixAutomatico"] as OpcaoId[]) {
      const o = opcao(lista, id);
      assert.equal(o.ativaPorPadrao, false, id);
      assert.doesNotMatch(o.conteudo, /desconto/i, id);
    }
    const ativos = opcoesAtivasPorPadrao(lista);
    assert.ok(!ativos.includes("parcela") && !ativos.includes("pixAutomatico"));
    assert.doesNotMatch(montarMensagem("PLAY 2", 1, lista, ativos, 2500), /PIX Automático|Parcela\*/);
  });

  it("colocando percentual, a opção vem marcada", () => {
    const lista = opcoes("PLAY 3", 2500, 250, 0, { parcela: 10, pixAutomatico: 5 });
    const ativos = opcoesAtivasPorPadrao(lista);
    assert.ok(ativos.includes("parcela") && ativos.includes("pixAutomatico"));
    assert.equal(opcao(lista, "pixAutomatico").valorFinal, 2375);
  });

  it("PLAY 6 (sem parcela): PIX Automático em até 12x, sem opção de parcela", () => {
    const lista = opcoes("PLAY 6", 1200, 0, 0, { pixAutomatico: 10 });
    assert.ok(!ids(lista).includes("parcela"));
    assert.match(opcao(lista, "pixAutomatico").conteudo, /até 12x de R\$ 90,00/);
  });
});

describe("mensagens", () => {
  it("sem atraso, nenhuma versão oferece junção ou regularização de R$ 0,00", () => {
    const lista = opcoes("PLAY 2", 2500, 250, 0);
    const ativos = opcoesAtivasPorPadrao(lista);
    for (const v of [1, 2, 3]) {
      const m = montarMensagem("PLAY 2", v, lista, ativos, 2500);
      assert.doesNotMatch(m, /R\$ 0,00/, `versão ${v}`);
      assert.doesNotMatch(m, /Junção|Regulariza/, `versão ${v}`);
    }
  });

  it("desmarcar uma opção tira ela das três versões", () => {
    const lista = opcoes("PLAY 3", 2000, 200, 1);
    const ativos = opcoesAtivasPorPadrao(lista).filter((id) => id !== "quitacaoCartao");
    for (const v of [1, 2, 3]) {
      assert.doesNotMatch(montarMensagem("PLAY 3", v, lista, ativos, 2000), /12x/, `versão ${v}`);
    }
  });

  it("mensagem 1 numera só o que está marcado e fecha na contraproposta", () => {
    const lista = opcoes("PLAY 1", 1000, 100, 1);
    const m = montarMensagem("PLAY 1", 1, lista, ["quitacaoPix", "parcela"], 1000);
    assert.match(m, /\*1️⃣ - Quitação\*/);
    assert.match(m, /\*2️⃣ - Parcela\*/);
    assert.match(m, /\*3️⃣ - Contraproposta\.\*$/);
  });

  it("junção no singular com 1 parcela em atraso", () => {
    assert.match(opcao(opcoes("PLAY 1", 1000, 100, 1), "juncao").conteudo, /1 parcela em atraso \+ 1 a vencer/);
  });
});

describe("configuração salva no navegador", () => {
  it("completa o que falta com o padrão e prende em 0–100", () => {
    const salvo = { "PLAY 1": { quitacao: 30, juncao: 150, semestral: -5, anual: "x" } };
    const r = mesclarDescontosSetor(salvo);
    assert.equal(r["PLAY 1"].quitacao, 30);
    assert.equal(r["PLAY 1"].juncao, 100);
    assert.equal(r["PLAY 1"].semestral, 0);
    assert.equal(r["PLAY 1"].anual, DESCONTOS_PADRAO["PLAY 1"].anual);
    assert.equal(r["PLAY 1"].parcela, 8);
    assert.equal(r["PLAY 1"].pixAutomatico, 8);
    assert.deepEqual(Object.keys(r), SETORES);
  });
  it("aguenta lixo no lugar da configuração", () => {
    assert.deepEqual(mesclarDescontosSetor(null), mesclarDescontosSetor({}));
    assert.equal(mesclarDescontosAcordo("lixo").quitacao, 30);
  });
});

describe("acordos ativos", () => {
  it("valida e monta a mensagem com milhar", () => {
    const v = validarAcordo("199,90", "10");
    assert.deepEqual(v, { ok: true, valorParcelaNum: 199.9, parcelasRestantesNum: 10 });
    const m = gerarMensagemAcordoAtivo(199.9, 10, { quitacao: 30, juncao: 10, atrasoParcelaVencer: 5 });
    assert.match(m, /R\$ 1\.399,30/);
    assert.match(m, /Economia de \*R\$ 599,70\*/);
  });
  it("recusa parcela ou quantidade inválida", () => {
    assert.equal(validarAcordo("abc", "10").ok, false);
    assert.equal(validarAcordo("100", "0").ok, false);
  });
});
