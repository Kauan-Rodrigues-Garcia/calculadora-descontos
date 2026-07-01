import type { Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Lock } from "lucide-react";
import { type DescontosSetor } from "@/lib/calculos";
import { type UsuarioLogado } from "@/lib/auth";

const ROTULO_DESCONTO: Record<string, string> = {
  quitacao: "Quitação (%)",
  juncao: "Junção (%)",
  pixAutomatico: "PIX Auto (%)",
  cartaoRecorrente: "Cartão Rec. (%)",
  semestral: "Semestral (%)",
  anual: "Anual (%)",
};

interface AbaConfiguracoesProps {
  isDark: boolean;
  usuarioLogado: UsuarioLogado | null;
  setorSelecionadoConfig: string;
  handleSetorConfigChange: (setor: string) => void;
  getSetoresPermitidos: () => string[];
  temPermissaoSetor: (setor: string) => boolean;
  descontosPorSetor: Record<string, DescontosSetor>;
  setDescontosPorSetor: Dispatch<SetStateAction<Record<string, DescontosSetor>>>;
}

const AbaConfiguracoes = ({
  isDark,
  usuarioLogado,
  setorSelecionadoConfig,
  handleSetorConfigChange,
  getSetoresPermitidos,
  temPermissaoSetor,
  descontosPorSetor,
  setDescontosPorSetor,
}: AbaConfiguracoesProps) => {
  return (
    <Card className={`rounded-2xl border-0 shadow-lg ${
      isDark
        ? 'bg-slate-800 shadow-slate-900/50'
        : 'bg-white shadow-slate-200/50'
    }`}>
      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-3 text-xl font-bold ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}>
          <div className={`p-2 rounded-xl ${
            isDark ? 'bg-orange-600' : 'bg-orange-600'
          }`}>
            <Settings className="h-5 w-5 text-white" />
          </div>
          Configurar Percentuais de Desconto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Select para escolher setor - COM CONTROLE DE ACESSO */}
        <div className={`p-6 rounded-xl mb-6 ${
          isDark
            ? 'bg-blue-900/30 border border-blue-700'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <Label htmlFor="setorConfig" className={`text-sm font-semibold mb-3 block ${
            isDark ? 'text-blue-300' : 'text-blue-700'
          }`}>
            📋 Selecione o Setor para Editar Descontos:
          </Label>
          <Select
            value={setorSelecionadoConfig}
            onValueChange={handleSetorConfigChange}
            disabled={usuarioLogado?.perfil === 'setor'}
          >
            <SelectTrigger className={`h-12 rounded-xl border-2 transition-all ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-white hover:border-blue-500 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-800 hover:border-blue-500 focus:border-blue-500'
            }`}>
              <SelectValue placeholder="Escolha o setor para configurar" />
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
          <p className={`text-xs mt-2 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            {usuarioLogado?.perfil === 'admin'
              ? '💡 Como administrador, você pode configurar qualquer setor.'
              : '🔒 Você só pode configurar seu próprio setor.'
            }
          </p>
        </div>

        {/* Configuração do setor selecionado - COM VALIDAÇÃO DE ACESSO */}
        {temPermissaoSetor(setorSelecionadoConfig) ? (
          <div className={`p-6 rounded-xl border-2 ${
            isDark
              ? 'bg-slate-700 border-slate-600'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-bold text-lg mb-4 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              ⚙️ Editando: {setorSelecionadoConfig}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(descontosPorSetor[setorSelecionadoConfig]).map(([tipo, valor]) => (
                <div key={tipo}>
                  <Label className={`text-xs font-semibold mb-2 block ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {ROTULO_DESCONTO[tipo] ?? `${tipo} (%)`}
                  </Label>
                  <Input
                    type="number"
                    value={valor}
                    onChange={(e) => {
                      const novoValor = parseFloat(e.target.value) || 0;
                      setDescontosPorSetor(prev => ({
                        ...prev,
                        [setorSelecionadoConfig]: {
                          ...prev[setorSelecionadoConfig],
                          [tipo]: novoValor
                        }
                      }));
                    }}
                    className={`h-10 rounded-lg border-2 text-center font-semibold ${
                      isDark
                        ? 'bg-slate-600 border-slate-500 text-white focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Indicador de salvamento automático */}
            <div className={`mt-4 p-3 rounded-lg ${
              isDark
                ? 'bg-green-900/30 border border-green-700'
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`text-sm ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>
                ✅ <strong>Alterações salvas automaticamente!</strong> Os novos percentuais já estão sendo aplicados nos cálculos.
              </p>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-xl border-2 ${
            isDark
              ? 'bg-red-900/20 border-red-700'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="text-center">
              <Lock className={`h-12 w-12 mx-auto mb-4 ${
                isDark ? 'text-red-400' : 'text-red-500'
              }`} />
              <h3 className={`font-bold text-lg mb-2 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                Acesso Negado
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>
                Você não tem permissão para configurar este setor.
              </p>
            </div>
          </div>
        )}

        {/* Visualização de setores permitidos apenas para admin */}
        {usuarioLogado?.perfil === 'admin' && (
          <div className="mt-8">
            <h3 className={`font-bold text-lg mb-4 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              📊 Resumo Geral de Configurações
            </h3>
            <div className="grid gap-6">
              {Object.entries(descontosPorSetor).map(([setor, descontos]) => (
                <div key={setor} className={`p-6 rounded-xl border-2 ${
                  setor === setorSelecionadoConfig
                    ? (isDark ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-300')
                    : (isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200')
                }`}>
                  <h3 className={`font-bold text-lg mb-4 ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    {setor} {setor === setorSelecionadoConfig ? '← Selecionado' : ''}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(descontos).map(([tipo, valor]) => (
                      <div key={tipo}>
                        <Label className={`text-xs font-semibold mb-2 block ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {ROTULO_DESCONTO[tipo] ?? `${tipo} (%)`}
                        </Label>
                        <div className={`h-10 rounded-lg border-2 text-center font-semibold flex items-center justify-center ${
                          isDark
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}>
                          {valor}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AbaConfiguracoes;
