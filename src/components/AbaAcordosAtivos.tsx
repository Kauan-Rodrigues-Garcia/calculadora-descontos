import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Settings, BarChart3, FileText, Copy, Minus, Plus } from "lucide-react";
import { parseValorMonetario, formatBRL, type DescontosAcordo } from "@/lib/calculos";

interface AbaAcordosAtivosProps {
  isDark: boolean;
  descontosAcordosAtivos: DescontosAcordo;
  setDescontosAcordosAtivos: Dispatch<SetStateAction<DescontosAcordo>>;
  statusAcordo: string;
  setStatusAcordo: (valor: string) => void;
  valorParcelaAcordo: string;
  setValorParcelaAcordo: (valor: string) => void;
  parcelasRestantes: string;
  setParcelasRestantes: (valor: string) => void;
  isMinimized: boolean;
  setIsMinimized: Dispatch<SetStateAction<boolean>>;
  calcularAcordoAtivo: () => void;
  mensagemAcordo: string;
  copiarMensagemAcordo: () => void;
}

const AbaAcordosAtivos = ({
  isDark,
  descontosAcordosAtivos,
  setDescontosAcordosAtivos,
  statusAcordo,
  setStatusAcordo,
  valorParcelaAcordo,
  setValorParcelaAcordo,
  parcelasRestantes,
  setParcelasRestantes,
  isMinimized,
  setIsMinimized,
  calcularAcordoAtivo,
  mensagemAcordo,
  copiarMensagemAcordo,
}: AbaAcordosAtivosProps) => {
  return (
    <>
      <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
        <p className={`text-center font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          Use esta aba para atender clientes que entram em contato para fazer pagamentos de acordos ativos.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuração de Percentuais */}
        <Card className={`rounded-2xl border-0 shadow-lg ${isDark ? 'bg-slate-800 shadow-slate-900/50' : 'bg-white shadow-slate-200/50'}`}>
          <CardHeader className="pb-4">
            <CardTitle className={`flex items-center gap-3 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <div className={`p-2 rounded-xl ${isDark ? 'bg-orange-600' : 'bg-orange-600'}`}>
                <Settings className="h-5 w-5 text-white" />
              </div>
              Configurar Percentuais de Desconto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-6 rounded-xl border-2 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Acordos Ativos
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col justify-between">
                  <Label className={`text-xs font-semibold mt-auto mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Quitação (%)
                  </Label>
                  <Input
                    type="number"
                    value={descontosAcordosAtivos.quitacao}
                    onChange={(e) => {
                      const novoValor = parseFloat(e.target.value) || 0;
                      setDescontosAcordosAtivos(prev => ({ ...prev, quitacao: novoValor }));
                    }}
                    className={`h-10 rounded-lg border-2 text-center font-semibold ${isDark ? 'bg-slate-600 border-slate-500 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'}`}
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <Label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Junção (%): (parcela do mês + a vencer)
                  </Label>
                  <Input
                    type="number"
                    value={descontosAcordosAtivos.juncao}
                    onChange={(e) => {
                      const novoValor = parseFloat(e.target.value) || 0;
                      setDescontosAcordosAtivos(prev => ({ ...prev, juncao: novoValor }));
                    }}
                    className={`h-10 rounded-lg border-2 text-center font-semibold ${isDark ? 'bg-slate-600 border-slate-500 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'}`}
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <Label className={`text-xs mt-auto font-semibold mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Atraso/Parcela a Vencer (%)
                  </Label>
                  <Input
                    type="number"
                    value={descontosAcordosAtivos.atrasoParcelaVencer}
                    onChange={(e) => {
                      const novoValor = parseFloat(e.target.value) || 0;
                      setDescontosAcordosAtivos(prev => ({ ...prev, atrasoParcelaVencer: novoValor }));
                    }}
                    className={`h-10 rounded-lg border-2 text-center font-semibold ${isDark ? 'bg-slate-600 border-slate-500 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'}`}
                  />
                </div>
              </div>
            </div>

            {/* Status do Acordo */}
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="statusAcordo" className={`text-sm font-semibold mb-2 block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Status do Acordo:
                </Label>
                <Select value={statusAcordo} onValueChange={setStatusAcordo}>
                  <SelectTrigger className={`h-12 rounded-xl border-2 transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white hover:border-blue-500 focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 focus:border-blue-500'}`}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className={`rounded-xl ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>
                    <SelectItem value="Ativo (em dia)">Ativo (em dia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valorParcelaAcordo" className={`text-sm font-semibold mb-2 block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Valor da Parcela:
                  </Label>
                  <Input
                    id="valorParcelaAcordo"
                    value={valorParcelaAcordo}
                    onChange={(e) => setValorParcelaAcordo(e.target.value)}
                    placeholder="Ex: 199,90"
                    className={`h-12 rounded-xl border-2 transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500 hover:border-blue-500 focus:border-blue-500'}`}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="parcelasRestantes" className={`text-sm font-semibold mb-2 block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Parcelas Restantes:
                </Label>
                <Input
                  id="parcelasRestantes"
                  type="number"
                  value={parcelasRestantes}
                  onChange={(e) => setParcelasRestantes(e.target.value)}
                  placeholder="Ex: 5"
                  className={`h-12 rounded-xl border-2 transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500 hover:border-blue-500 focus:border-blue-500'}`}
                />
              </div>

              <Button
                onClick={calcularAcordoAtivo}
                className={`w-full h-12 rounded-xl font-semibold text-base transition-all ${isDark ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25'}`}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Gerar Opções de Acordo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo do Acordo e Mensagem */}
        <div className="space-y-6">
          {/* Resumo do Acordo - Minimizável */}
          <Card className={`rounded-2xl border-0 shadow-lg ${isDark ? 'bg-slate-800 shadow-slate-900/50' : 'bg-white shadow-slate-200/50'}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center gap-3 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-600' : 'bg-blue-600'}`}>
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  Situação do Acordo em Dia
                </CardTitle>
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  variant="ghost"
                  size="sm"
                  className={`${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  {isMinimized ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {!isMinimized && (
              <CardContent>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-700 border border-slate-600' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusAcordo === 'Ativo (em dia)' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {statusAcordo}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Parcelas restantes:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{parcelasRestantes || "0"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Valor por parcela:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>R$ {valorParcelaAcordo || "0,00"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Total a pagar:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        R$ {valorParcelaAcordo && parcelasRestantes ?
                          formatBRL(parseValorMonetario(valorParcelaAcordo) * parseInt(parcelasRestantes)) :
                          "0,00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Economia:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        R$ {valorParcelaAcordo && parcelasRestantes ?
                          formatBRL(parseValorMonetario(valorParcelaAcordo) * parseInt(parcelasRestantes) * descontosAcordosAtivos.quitacao / 100) :
                          "0,00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Desconto para Quitação:</span>
                      <span className={`font-semibold text-green-600`}>{descontosAcordosAtivos.quitacao}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Mensagem Gerada */}
          <Card className={`rounded-2xl border-0 shadow-lg ${isDark ? 'bg-slate-800 shadow-slate-900/50' : 'bg-white shadow-slate-200/50'}`}>
            <CardHeader className="pb-4">
              <CardTitle className={`flex items-center gap-3 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-600' : 'bg-purple-600'}`}>
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Opções de Negociação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={mensagemAcordo}
                readOnly
                placeholder="As opções de negociação aparecerão aqui após gerar..."
                style={{ whiteSpace: 'pre-wrap' }}
                className={`min-h-[400px] rounded-xl border-2 font-mono text-sm transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500'}`}
              />
              <div className="flex gap-3 mt-4 flex-wrap">
                <Button
                  onClick={copiarMensagemAcordo}
                  className={`flex-1 h-12 rounded-xl font-semibold text-base transition-all ${isDark ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25'}`}
                  disabled={!mensagemAcordo}
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Copiar Mensagem
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AbaAcordosAtivos;
