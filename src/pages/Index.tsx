import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Moon, Sun, Lock, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  construirOpcoes,
  opcoesAtivasPorPadrao,
  montarMensagem,
  setorTemVariantes,
  validarEntradas,
  validarAcordo,
  gerarMensagemAcordoAtivo,
  mesclarDescontosSetor,
  mesclarDescontosAcordo,
  type CampoEntrada,
  type DescontosSetor,
  type DescontosAcordo,
  type OpcaoCalculada,
  type OpcaoId,
} from "@/lib/calculos";
import { type UsuarioLogado } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import AbaCalculadora from "@/components/AbaCalculadora";
import AbaConfiguracoes from "@/components/AbaConfiguracoes";
import AbaAcordosAtivos from "@/components/AbaAcordosAtivos";
import AbaAjuda from "@/components/AbaAjuda";

// Lê um JSON do localStorage com fallback seguro caso a chave não exista ou esteja corrompida
function lerStorage<T>(chave: string, padrao: T): T {
  try {
    const raw = localStorage.getItem(chave);
    return raw ? (JSON.parse(raw) as T) : padrao;
  } catch {
    return padrao;
  }
}

const Index = () => {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);
  const [setor, setSetor] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [parcelasAtraso, setParcelasAtraso] = useState("");
  const [isDark, setIsDark] = useState<boolean>(() => lerStorage<boolean>('calculadora_tema_dark', true));
  const { toast } = useToast();

  // Estados para Acordos Ativos
  const [statusAcordo, setStatusAcordo] = useState("Ativo (em dia)");
  const [valorParcelaAcordo, setValorParcelaAcordo] = useState("");
  const [parcelasRestantes, setParcelasRestantes] = useState("");
  const [mensagemAcordo, setMensagemAcordo] = useState("");
  const [entradasDoAcordo, setEntradasDoAcordo] = useState<string | null>(null);
  const [errosAcordo, setErrosAcordo] = useState<Partial<Record<"valorParcela" | "parcelasRestantes", string>>>({});
  const [isMinimized, setIsMinimized] = useState(false);

  // Estado para o setor selecionado na configuração
  const [setorSelecionadoConfig, setSetorSelecionadoConfig] = useState("EM DIA");

  // Versão da mensagem: 1, 2 ou 3 (2 e 3 só existem do PLAY 2 em diante)
  const [mensagemAtual, setMensagemAtual] = useState(1);

  // Resultado do último cálculo, junto com os dados que o geraram (para saber se ficou desatualizado)
  const [resultado, setResultado] = useState<{
    setor: string;
    entradas: string;
    opcoes: OpcaoCalculada[];
    valorTotalNum: number;
  } | null>(null);
  const [opcoesAtivas, setOpcoesAtivas] = useState<OpcaoId[]>([]);
  const [erros, setErros] = useState<Partial<Record<CampoEntrada, string>>>({});

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('calculadora_usuario');
    if (!usuarioSalvo) return;

    try {
      const usuario = JSON.parse(usuarioSalvo) as UsuarioLogado;
      setUsuarioLogado(usuario);

      // Se for usuário de setor específico, definir automaticamente
      if (usuario.perfil === 'setor') {
        setSetor(usuario.setor);
        setSetorSelecionadoConfig(usuario.setor);
      }
    } catch {
      // Dado corrompido: limpa para não travar a aplicação na inicialização
      localStorage.removeItem('calculadora_usuario');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Configuração dos descontos por setor (com persistência em localStorage).
  // O que faltar no que foi salvo (setor ou desconto novo) vem dos padrões em lib/calculos.ts.
  const [descontosPorSetor, setDescontosPorSetor] = useState<Record<string, DescontosSetor>>(() =>
    mesclarDescontosSetor(lerStorage<unknown>('calculadora_descontos_setor', null)),
  );

  // Configuração dos descontos para Acordos Ativos (com persistência em localStorage)
  const [descontosAcordosAtivos, setDescontosAcordosAtivos] = useState<DescontosAcordo>(() =>
    mesclarDescontosAcordo(lerStorage<unknown>('calculadora_descontos_acordo', null)),
  );

  // Salva as configurações sempre que mudarem, tornando reais as "alterações automáticas"
  useEffect(() => {
    localStorage.setItem('calculadora_descontos_setor', JSON.stringify(descontosPorSetor));
  }, [descontosPorSetor]);

  useEffect(() => {
    localStorage.setItem('calculadora_descontos_acordo', JSON.stringify(descontosAcordosAtivos));
  }, [descontosAcordosAtivos]);

  // Persiste a preferência de tema (claro/escuro) entre sessões
  useEffect(() => {
    localStorage.setItem('calculadora_tema_dark', JSON.stringify(isDark));
  }, [isDark]);

  // A mensagem sai sempre do resultado + opções marcadas + versão escolhida
  const mensagem = useMemo(
    () =>
      resultado
        ? montarMensagem(resultado.setor, mensagemAtual, resultado.opcoes, opcoesAtivas, resultado.valorTotalNum)
        : "",
    [resultado, mensagemAtual, opcoesAtivas],
  );

  // Se algum dado mudou depois do cálculo, a mensagem não vale mais
  const assinaturaAtual = JSON.stringify({ setor, valorTotal, valorParcela, parcelasAtraso, descontos: descontosPorSetor[setor] });
  const desatualizado = !!resultado && resultado.entradas !== assinaturaAtual;
  const assinaturaAcordo = JSON.stringify({ valorParcelaAcordo, parcelasRestantes, descontosAcordosAtivos });
  const acordoDesatualizado = !!mensagemAcordo && entradasDoAcordo !== assinaturaAcordo;

  // Função para verificar permissão de acesso ao setor
  const temPermissaoSetor = (setorVerificar: string): boolean => {
    if (!usuarioLogado) return false;
    return usuarioLogado.setoresPermitidos.includes(setorVerificar);
  };

  // Função para obter setores permitidos para o usuário
  const getSetoresPermitidos = (): string[] => {
    if (!usuarioLogado) return [];
    return usuarioLogado.setoresPermitidos;
  };

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem('calculadora_usuario');
    setUsuarioLogado(null);
    setSetor("");
    setSetorSelecionadoConfig("EM DIA");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso"
    });
  };

  // Função de login
  const handleLogin = (usuario: UsuarioLogado) => {
    setUsuarioLogado(usuario);
    
    // Se for usuário de setor específico, definir automaticamente
    if (usuario.perfil === 'setor') {
      setSetor(usuario.setor);
      setSetorSelecionadoConfig(usuario.setor);
    }
  };

  // Validação de segurança para mudança de setor
  const handleSetorChange = (novoSetor: string) => {
    if (!temPermissaoSetor(novoSetor)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar este setor",
        variant: "destructive"
      });
      return;
    }
    setSetor(novoSetor);
    setErros((e) => ({ ...e, setor: undefined }));
  };

  // Validação de segurança para configuração
  const handleSetorConfigChange = (novoSetor: string) => {
    if (!temPermissaoSetor(novoSetor)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para configurar este setor",
        variant: "destructive"
      });
      return;
    }
    setSetorSelecionadoConfig(novoSetor);
  };

  // Se não estiver logado, mostrar tela de login
  if (!usuarioLogado) {
    return <LoginForm onLogin={handleLogin} isDark={isDark} />;
  }

  const calcularTodosDescontos = () => {
    // Validação de segurança
    if (setor && !temPermissaoSetor(setor)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para calcular descontos deste setor",
        variant: "destructive"
      });
      return;
    }

    // Campos: valor que não dá para entender vira erro no campo, nunca zero
    const validacao = validarEntradas(setor, { valorTotal, valorParcela, parcelasAtraso });
    if ("erros" in validacao) {
      setErros(validacao.erros);
      toast({
        title: "Confira os campos",
        description: Object.values(validacao.erros)[0],
        variant: "destructive"
      });
      return;
    }
    setErros({});

    const opcoes = construirOpcoes({
      setor,
      valorTotalNum: validacao.valorTotalNum,
      valorParcelaNum: validacao.valorParcelaNum,
      parcelasAtrasoNum: validacao.parcelasAtrasoNum,
      descontosSetor: descontosPorSetor[setor],
    });
    setResultado({ setor, entradas: assinaturaAtual, opcoes, valorTotalNum: validacao.valorTotalNum });
    // Opções com 0% (parcela e PIX Automático) vêm desmarcadas
    setOpcoesAtivas(opcoesAtivasPorPadrao(opcoes));
    setMensagemAtual(1);

    toast({
      title: "Cálculo realizado!",
      description: "Mensagem gerada com sucesso"
    });
  };

  const copiarMensagem = async () => {
    if (!mensagem) {
      toast({
        title: "Nenhuma mensagem",
        description: "Gere uma mensagem primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(mensagem);
      toast({
        title: "Copiado!",
        description: "Mensagem copiada para a área de transferência"
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem",
        variant: "destructive"
      });
    }
  };

  // Função para limpar todos os campos
  const limparTodosCampos = () => {
    setValorTotal("");
    setValorParcela("");
    setParcelasAtraso("");
    setResultado(null);
    setOpcoesAtivas([]);
    setMensagemAtual(1);
    setErros({});
    toast({
      title: "Campos limpos!",
      description: "Todos os campos foram limpos com sucesso"
    });
  };

  // Função para trocar mensagem (versões 1, 2 e 3)
  const trocarMensagem = () => {
    if (!resultado) {
      toast({
        title: "Nenhuma mensagem calculada",
        description: "Calcule os descontos primeiro",
        variant: "destructive"
      });
      return;
    }

    const proximaMensagem = mensagemAtual === 3 ? 1 : mensagemAtual + 1;
    setMensagemAtual(proximaMensagem);

    toast({
      title: `Mensagem ${proximaMensagem}`,
      description: "Mensagem alterada com sucesso"
    });
  };

  // Marca/desmarca uma opção; as três versões da mensagem usam as mesmas opções marcadas
  const toggleOpcao = (id: OpcaoId) => {
    setOpcoesAtivas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Os geradores de mensagem por setor estão em src/lib/calculos.ts

  // Função para calcular acordos ativos (texto em lib/calculos.ts)
  const calcularAcordoAtivo = () => {
    const validacao = validarAcordo(valorParcelaAcordo, parcelasRestantes);
    if ("erros" in validacao) {
      setErrosAcordo(validacao.erros);
      toast({
        title: "Confira os campos",
        description: Object.values(validacao.erros)[0],
        variant: "destructive"
      });
      return;
    }
    setErrosAcordo({});
    setMensagemAcordo(
      gerarMensagemAcordoAtivo(validacao.valorParcelaNum, validacao.parcelasRestantesNum, descontosAcordosAtivos),
    );
    setEntradasDoAcordo(assinaturaAcordo);

    toast({
      title: "Cálculo realizado!",
      description: "Opções de acordo ativo geradas com sucesso"
    });
  };

  const copiarMensagemAcordo = async () => {
    if (!mensagemAcordo) {
      toast({
        title: "Nenhuma mensagem",
        description: "Gere uma mensagem primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(mensagemAcordo);
      toast({
        title: "Copiado!",
        description: "Mensagem do acordo copiada para a área de transferência"
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header com informações do usuário */}
        <div className={`rounded-2xl p-6 mb-6 relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-lg'
        }`}>
          {/* Botões de controle */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isDark 
                  ? 'border-slate-500 bg-slate-700 hover:bg-slate-600 text-slate-300' 
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isDark 
                  ? 'border-red-500 bg-red-900/20 hover:bg-red-900/40 text-red-400' 
                  : 'border-red-300 bg-red-50 hover:bg-red-100 text-red-600'
              }`}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              isDark ? 'bg-blue-600 shadow-lg shadow-blue-600/25' : 'bg-blue-600 shadow-lg shadow-blue-600/25'
            }`}>
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Calculadora de Descontos
            </h1>
            <p className={`text-lg mb-3 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Bem-vindo, <strong>{usuarioLogado?.nome}</strong>
            </p>
            
            {/* Indicador de setor */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              isDark ? 'bg-blue-900/30 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              <Lock className="h-4 w-4" />
              Acesso: {usuarioLogado?.perfil === 'admin' ? 'TODOS OS SETORES' : usuarioLogado?.setor}
            </div>
          </div>
        </div>

        <Tabs defaultValue="calculadora" className="w-full">
          <TabsList className={`grid w-full grid-cols-4 rounded-xl p-1 ${
            isDark 
              ? 'bg-slate-800 border border-slate-600' 
              : 'bg-white border border-slate-200 shadow-sm'
          }`}>
            <TabsTrigger 
              value="calculadora" 
              className={`rounded-lg font-medium transition-all ${
                isDark 
                  ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300' 
                  : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-600'
              }`}
            >
              Calculadora
            </TabsTrigger>
            <TabsTrigger 
              value="configuracoes"
              className={`rounded-lg font-medium transition-all ${
                isDark 
                  ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300' 
                  : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-600'
              }`}
            >
              Configurações
            </TabsTrigger>
            <TabsTrigger 
              value="acordos-ativos"
              className={`rounded-lg font-medium transition-all ${
                isDark 
                  ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300' 
                  : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-600'
              }`}
            >
              Acordos Ativos
            </TabsTrigger>
            <TabsTrigger 
              value="ajuda"
              className={`rounded-lg font-medium transition-all ${
                isDark 
                  ? 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300' 
                  : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-600'
              }`}
            >
              Como Usar
            </TabsTrigger>
          </TabsList>

          {/* Aba Calculadora */}
          <TabsContent value="calculadora" className="space-y-6 mt-6">
            <AbaCalculadora
              isDark={isDark}
              setor={setor}
              handleSetorChange={handleSetorChange}
              usuarioLogado={usuarioLogado}
              getSetoresPermitidos={getSetoresPermitidos}
              valorTotal={valorTotal}
              setValorTotal={(v) => { setValorTotal(v); setErros((e) => ({ ...e, valorTotal: undefined })); }}
              valorParcela={valorParcela}
              setValorParcela={(v) => { setValorParcela(v); setErros((e) => ({ ...e, valorParcela: undefined })); }}
              parcelasAtraso={parcelasAtraso}
              setParcelasAtraso={(v) => { setParcelasAtraso(v); setErros((e) => ({ ...e, parcelasAtraso: undefined })); }}
              calcularTodosDescontos={calcularTodosDescontos}
              limparTodosCampos={limparTodosCampos}
              mensagem={mensagem}
              temVariantes={!!resultado && setorTemVariantes(resultado.setor)}
              erros={erros}
              desatualizado={desatualizado}
              mensagemAtual={mensagemAtual}
              trocarMensagem={trocarMensagem}
              opcoesCalculadas={resultado?.opcoes ?? []}
              opcoesAtivas={opcoesAtivas}
              toggleOpcao={toggleOpcao}
              copiarMensagem={copiarMensagem}
            />
          </TabsContent>

          {/* Aba Configurações - COM CONTROLE DE ACESSO */}
          <TabsContent value="configuracoes" className="space-y-6 mt-6">
            <AbaConfiguracoes
              isDark={isDark}
              usuarioLogado={usuarioLogado}
              setorSelecionadoConfig={setorSelecionadoConfig}
              handleSetorConfigChange={handleSetorConfigChange}
              getSetoresPermitidos={getSetoresPermitidos}
              temPermissaoSetor={temPermissaoSetor}
              descontosPorSetor={descontosPorSetor}
              setDescontosPorSetor={setDescontosPorSetor}
            />
          </TabsContent>

          {/* Aba Acordos Ativos */}
          <TabsContent value="acordos-ativos" className="space-y-6 mt-6">
            <AbaAcordosAtivos
              isDark={isDark}
              descontosAcordosAtivos={descontosAcordosAtivos}
              setDescontosAcordosAtivos={setDescontosAcordosAtivos}
              statusAcordo={statusAcordo}
              setStatusAcordo={setStatusAcordo}
              valorParcelaAcordo={valorParcelaAcordo}
              setValorParcelaAcordo={(v) => { setValorParcelaAcordo(v); setErrosAcordo((e) => ({ ...e, valorParcela: undefined })); }}
              parcelasRestantes={parcelasRestantes}
              setParcelasRestantes={(v) => { setParcelasRestantes(v); setErrosAcordo((e) => ({ ...e, parcelasRestantes: undefined })); }}
              isMinimized={isMinimized}
              setIsMinimized={setIsMinimized}
              calcularAcordoAtivo={calcularAcordoAtivo}
              mensagemAcordo={mensagemAcordo}
              copiarMensagemAcordo={copiarMensagemAcordo}
              erros={errosAcordo}
              desatualizado={acordoDesatualizado}
            />
          </TabsContent>

          {/* Aba Como Usar */}
          <TabsContent value="ajuda" className="space-y-6 mt-6">
            <AbaAjuda isDark={isDark} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;