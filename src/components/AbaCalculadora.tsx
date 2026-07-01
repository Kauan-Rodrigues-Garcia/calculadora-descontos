import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Calculator, Settings, Target, Plus } from "lucide-react";
import { type OpcaoCalculada, type OpcaoId } from "@/lib/calculos";
import { type UsuarioLogado } from "@/lib/auth";

interface AbaCalculadoraProps {
  isDark: boolean;
  setor: string;
  handleSetorChange: (setor: string) => void;
  usuarioLogado: UsuarioLogado | null;
  getSetoresPermitidos: () => string[];
  valorTotal: string;
  setValorTotal: (valor: string) => void;
  valorParcela: string;
  setValorParcela: (valor: string) => void;
  parcelasAtraso: string;
  setParcelasAtraso: (valor: string) => void;
  calcularTodosDescontos: () => void;
  limparTodosCampos: () => void;
  mensagem: string;
  mensagensCalculadas: { [key: number]: string };
  mensagemAtual: number;
  trocarMensagem: () => void;
  opcoesCalculadas: OpcaoCalculada[];
  opcoesAtivas: OpcaoId[];
  toggleOpcao: (id: OpcaoId) => void;
  copiarMensagem: () => void;
}

const AbaCalculadora = ({
  isDark,
  setor,
  handleSetorChange,
  usuarioLogado,
  getSetoresPermitidos,
  valorTotal,
  setValorTotal,
  valorParcela,
  setValorParcela,
  parcelasAtraso,
  setParcelasAtraso,
  calcularTodosDescontos,
  limparTodosCampos,
  mensagem,
  mensagensCalculadas,
  mensagemAtual,
  trocarMensagem,
  opcoesCalculadas,
  opcoesAtivas,
  toggleOpcao,
  copiarMensagem,
}: AbaCalculadoraProps) => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Formulário */}
      <Card className={`rounded-2xl border-0 shadow-lg ${
        isDark
          ? 'bg-slate-800 shadow-slate-900/50'
          : 'bg-white shadow-slate-200/50'
      }`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="setor" className={`text-sm font-semibold mb-2 block ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Setor *
            </Label>
            <Select
              value={setor}
              onValueChange={handleSetorChange}
              disabled={usuarioLogado?.perfil === 'setor'}
            >
              <SelectTrigger className={`h-12 rounded-xl border-2 transition-all ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white hover:border-blue-500 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 focus:border-blue-500'
              }`}>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent className={`rounded-xl ${
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                {getSetoresPermitidos().map((setorPermitido) => (
                  <SelectItem key={setorPermitido} value={setorPermitido}>
                    {setorPermitido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valorTotal" className={`text-sm font-semibold mb-2 block ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Valor Total em Aberto *
            </Label>
            <Input
              id="valorTotal"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="Ex: 1.000,00"
              className={`h-12 rounded-xl border-2 transition-all ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500 hover:border-blue-500 focus:border-blue-500'
              }`}
            />
            <p className={`text-xs mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Aceita: 1000 | 1.000 | 1000,00 | 1.000,00
            </p>
          </div>

          {setor !== "PLAY 6" ? (
            <div>
              <Label htmlFor="valorParcela" className={`text-sm font-semibold mb-2 block ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Valor da Parcela
              </Label>
              <Input
                id="valorParcela"
                value={valorParcela}
                onChange={(e) => setValorParcela(e.target.value)}
                placeholder="Ex: 199,90"
                className={`h-12 rounded-xl border-2 transition-all ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500 hover:border-blue-500 focus:border-blue-500'
                }`}
              />
              <p className={`text-xs mt-1 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Usado para calcular junções e parcelamentos
              </p>
            </div>
          ) : null}

          {setor !== "PLAY 6" && setor !== "EM DIA" ? (
            <div>
              <Label htmlFor="parcelasAtraso" className={`text-sm font-semibold mb-2 block ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Parcelas em Atraso
              </Label>
              <Input
                id="parcelasAtraso"
                type="number"
                value={parcelasAtraso}
                onChange={(e) => setParcelasAtraso(e.target.value)}
                placeholder="Ex: 2"
                className={`h-12 rounded-xl border-2 transition-all ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500 hover:border-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button
              onClick={calcularTodosDescontos}
              className={`flex-1 h-12 rounded-xl font-semibold text-base transition-all ${
                isDark
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25'
              }`}
            >
              <Calculator className="h-5 w-5 mr-2" />
              Calcular Descontos
            </Button>
            <Button
              onClick={limparTodosCampos}
              variant="outline"
              className={`h-12 px-4 rounded-xl font-semibold text-sm transition-all ${
                isDark
                  ? 'border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Target className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem Gerada */}
      <Card className={`rounded-2xl border-0 shadow-lg ${
        isDark
          ? 'bg-slate-800 shadow-slate-900/50'
          : 'bg-white shadow-slate-200/50'
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Mensagem Gerada
              {Object.keys(mensagensCalculadas).length > 0 && (
                <span className={`ml-2 text-sm font-normal px-2 py-1 rounded-full ${
                  isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  {mensagemAtual}/3
                </span>
              )}
            </CardTitle>
            {Object.keys(mensagensCalculadas).length > 0 && (
              <Button
                onClick={trocarMensagem}
                variant="outline"
                size="sm"
                className={`h-8 px-3 text-xs transition-all ${
                  isDark
                    ? 'border-blue-500 text-blue-400 hover:bg-blue-900/20'
                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                Trocar Mensagem
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {opcoesCalculadas.length > 0 && (
            <div className={`mb-4 p-4 rounded-2xl border ${
              isDark ? 'bg-slate-700/40 border-slate-600' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 ${
                isDark ? 'text-slate-300' : 'text-slate-500'
              }`}>
                <Settings className="h-3.5 w-3.5" />
                Opções incluídas na mensagem
              </p>
              <div className="flex flex-wrap gap-2">
                {opcoesCalculadas.map((opcao) => {
                  const ativo = opcoesAtivas.includes(opcao.id);
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      onClick={() => toggleOpcao(opcao.id)}
                      aria-pressed={ativo}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        ativo
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/25'
                          : isDark
                            ? 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white'
                            : 'bg-white border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      {ativo ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {opcao.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <Textarea
            value={mensagem}
            readOnly
            placeholder="A mensagem aparecerá aqui após o cálculo..."
            style={{ whiteSpace: 'pre-wrap' }}
            className={`min-h-[500px] rounded-xl border-2 font-mono text-sm transition-all ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500'
            }`}
          />
          <Button
            onClick={copiarMensagem}
            className={`w-full mt-4 h-12 rounded-xl font-semibold text-base transition-all ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
            }`}
            disabled={!mensagem}
          >
            <Copy className="h-5 w-5 mr-2" />
            Copiar Mensagem
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbaCalculadora;
