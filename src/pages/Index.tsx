import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Moon, Sun, Lock, LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  parseValorMonetario,
  construirOpcoes,
  montarMensagemPrincipal,
  gerarMensagemSetor2EmDiante,
  gerarMensagemSetor3EmDiante,
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
  const [mensagem, setMensagem] = useState("");
  const [isDark, setIsDark] = useState<boolean>(() => lerStorage<boolean>('calculadora_tema_dark', true));
  const { toast } = useToast();

  // Estados para Acordos Ativos
  const [statusAcordo, setStatusAcordo] = useState("Ativo (em dia)");
  const [valorParcelaAcordo, setValorParcelaAcordo] = useState("");
  const [parcelasRestantes, setParcelasRestantes] = useState("");
  const [mensagemAcordo, setMensagemAcordo] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  // Estado para o setor selecionado na configuração
  const [setorSelecionadoConfig, setSetorSelecionadoConfig] = useState("EM DIA");

  // Estados para o sistema de mensagens
  const [mensagemAtual, setMensagemAtual] = useState(1); // 1, 2 ou 3
  const [mensagensCalculadas, setMensagensCalculadas] = useState<{[key: number]: string}>({});

  // Opções de pagamento calculadas e quais estão marcadas para entrar na mensagem
  const [opcoesCalculadas, setOpcoesCalculadas] = useState<OpcaoCalculada[]>([]);
  const [opcoesAtivas, setOpcoesAtivas] = useState<OpcaoId[]>([]);

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

  // Configuração dos descontos por setor (com persistência em localStorage)
  const [descontosPorSetor, setDescontosPorSetor] = useState<Record<string, DescontosSetor>>(() =>
    lerStorage<Record<string, DescontosSetor>>('calculadora_descontos_setor', {
      "EM DIA": { quitacao: 20, juncao: 5, pixAutomatico: 10, cartaoRecorrente: 8, semestral: 6, anual: 12 },
      "PLAY 1": { quitacao: 25, juncao: 12, semestral: 8, anual: 18 },
      "PLAY 2": { quitacao: 35, juncao: 18, semestral: 18, anual: 25 },
      "PLAY 3": { quitacao: 45, juncao: 15, semestral: 0, anual: 0 },
      "PLAY 4": { quitacao: 45, juncao: 15, semestral: 0, anual: 0 },
      "PLAY 5": { quitacao: 45, juncao: 15, semestral: 0, anual: 0 },
      "PLAY 6": { quitacao: 45, juncao: 15, semestral: 0, anual: 0 },
    }),
  );

  // Configuração dos descontos para Acordos Ativos (com persistência em localStorage)
  const [descontosAcordosAtivos, setDescontosAcordosAtivos] = useState<DescontosAcordo>(() =>
    lerStorage<DescontosAcordo>('calculadora_descontos_acordo', {
      quitacao: 30,
      juncao: 10,
      atrasoParcelaVencer: 5,
    }),
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
    if (!temPermissaoSetor(setor)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para calcular descontos deste setor",
        variant: "destructive"
      });
      return;
    }

    if (setor === "EM DIA") {
      if (!valorTotal || !valorParcela) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha o valor total e valor da parcela",
          variant: "destructive"
        });
        return;
      }
    }
    else if (setor === "PLAY 6") {
      if (!valorTotal) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha o valor total",
          variant: "destructive"
        });
        return;
      }
    }
    else {
      if (!setor || !valorTotal || !valorParcela) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha o setor, valor total e valor da parcela",
          variant: "destructive"
        });
        return;
      }
    }

    const valorParcelaNum = parseValorMonetario(valorParcela);
    const parcelasAtrasoNum = parcelasAtraso ? parseInt(parcelasAtraso) : 0;
    const valorTotalNum = parseValorMonetario(valorTotal);
    const descontosSetor = descontosPorSetor[setor];

    // Monta as opções aplicáveis e marca todas por padrão
    const opcoes = construirOpcoes({ setor, valorTotalNum, valorParcelaNum, parcelasAtrasoNum, descontosSetor });
    const ativos = opcoes.map((o) => o.id);
    setOpcoesCalculadas(opcoes);
    setOpcoesAtivas(ativos);

    const mensagemPrincipal = montarMensagemPrincipal(setor, opcoes, ativos);

    // Gerar mensagens por setor (a 1ª é a principal, montada a partir das opções)
    const mensagensGeradas: { [key: number]: string } = {};
    mensagensGeradas[1] = mensagemPrincipal;

    if (setor === "PLAY 3" || setor === "PLAY 4" || setor === "PLAY 5" || setor === "PLAY 6") {
      mensagensGeradas[2] = gerarMensagemSetor3EmDiante(2, valorTotalNum, descontosSetor);
      mensagensGeradas[3] = gerarMensagemSetor3EmDiante(3, valorTotalNum, descontosSetor);
    } else if (setor === "PLAY 2") {
      mensagensGeradas[2] = gerarMensagemSetor2EmDiante(2, valorTotalNum, valorParcelaNum, descontosSetor, parcelasAtrasoNum);
      mensagensGeradas[3] = gerarMensagemSetor2EmDiante(3, valorTotalNum, valorParcelaNum, descontosSetor, parcelasAtrasoNum);
    } else {
      mensagensGeradas[2] = mensagemPrincipal;
      mensagensGeradas[3] = mensagemPrincipal;
    }

    setMensagensCalculadas(mensagensGeradas);
    setMensagemAtual(1);
    setMensagem(mensagensGeradas[1] || mensagemPrincipal);
    
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
    setMensagem("");
    setMensagensCalculadas({});
    setMensagemAtual(1);
    setOpcoesCalculadas([]);
    setOpcoesAtivas([]);
    toast({
      title: "Campos limpos!",
      description: "Todos os campos foram limpos com sucesso"
    });
  };

  // Função para trocar mensagem
  const trocarMensagem = () => {
    if (Object.keys(mensagensCalculadas).length === 0) {
      toast({
        title: "Nenhuma mensagem calculada",
        description: "Calcule os descontos primeiro",
        variant: "destructive"
      });
      return;
    }
    
    const proximaMensagem = mensagemAtual === 3 ? 1 : mensagemAtual + 1;
    setMensagemAtual(proximaMensagem);
    setMensagem(mensagensCalculadas[proximaMensagem] || "");
    
    toast({
      title: `Mensagem ${proximaMensagem}`,
      description: "Mensagem alterada com sucesso"
    });
  };

  // Marca/desmarca uma opção e reconstrói a Mensagem 1 (lista de opções)
  const toggleOpcao = (id: OpcaoId) => {
    setOpcoesAtivas((prev) => {
      const proximos = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      const novaMensagem = montarMensagemPrincipal(setor, opcoesCalculadas, proximos);
      setMensagensCalculadas((mc) => ({ ...mc, 1: novaMensagem }));
      if (mensagemAtual === 1) setMensagem(novaMensagem);
      return proximos;
    });
  };

  // Os geradores de mensagem por setor estão em src/lib/calculos.ts

  // Função para calcular acordos ativos seguindo a lógica correta
  const calcularAcordoAtivo = () => {
    if (!valorParcelaAcordo || !parcelasRestantes) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o valor da parcela e parcelas restantes",
        variant: "destructive"
      });
      return;
    }

    const valorParcelaNum = parseValorMonetario(valorParcelaAcordo);
    const parcelasRestantesNum = parseInt(parcelasRestantes) || 0;
    
    // Cálculo do total do acordo: valorTotal = valorParcela × parcelasRestantes
    const valorTotal = valorParcelaNum * parcelasRestantesNum;
    
    let mensagemGerada = "";
    let numeroOpcao = 1;

    mensagemGerada += "Segue as opções para seu acordo ativo:\n\n";

    // 1. QUITAÇÃO À VISTA (PIX/Boleto) - Prioridade
    if (descontosAcordosAtivos.quitacao > 0 && valorTotal > 0) {
      const valorComDesconto = valorTotal * (1 - descontosAcordosAtivos.quitacao / 100);
      const economia = valorTotal - valorComDesconto;
      
      mensagemGerada += `*${numeroOpcao} - QUITAÇÃO* no boleto à vista ou PIX: *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* vencimento *HOJE*\n`;
      mensagemGerada += `Economia de *R$ ${economia.toFixed(2).replace('.', ',')}*\n\n`;
      numeroOpcao++;
    }

    // 2. QUITAÇÃO NO CARTÃO (até 12x)
    if (descontosAcordosAtivos.quitacao > 0 && valorTotal > 0) {
      const valorComDesconto = valorTotal * (1 - descontosAcordosAtivos.quitacao / 100);
      const parcela12x = valorComDesconto / 12;
      
      mensagemGerada += `*${numeroOpcao} - QUITAÇÃO* no Cartão de crédito: até em *12x de R$ ${parcela12x.toFixed(2).replace('.', ',')}* podendo ser de terceiros\n\n`;
      numeroOpcao++;
    }

    // 3. JUNÇÃO (Cliente SEM atraso: parcela atual + próxima)
    if (descontosAcordosAtivos.juncao > 0 && valorParcelaNum > 0) {
      const juncao = (valorParcelaNum * 2) * (1 - descontosAcordosAtivos.juncao / 100);
      
      mensagemGerada += `*${numeroOpcao} - Parcela a vencer + próximo mês* por *R$ ${juncao.toFixed(2).replace('.', ',')}* via pix/cartão *HOJE*\n\n`;
      numeroOpcao++;
    }

    // 4. PARCELA A VENCER COM DESCONTO
    if (descontosAcordosAtivos.atrasoParcelaVencer > 0 && valorParcelaNum > 0) {
      const parcelaAVencer = valorParcelaNum * (1 - descontosAcordosAtivos.atrasoParcelaVencer / 100);
      
      mensagemGerada += `*${numeroOpcao} - Parcela a vencer* por *R$ ${parcelaAVencer.toFixed(2).replace('.', ',')}* via pix/cartão *HOJE*\n\n`;
      numeroOpcao++;
    }

    mensagemGerada += "*Qual a melhor opção para negociar hoje e antecipar seu acordo?*";

    setMensagemAcordo(mensagemGerada);

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
              setValorTotal={setValorTotal}
              valorParcela={valorParcela}
              setValorParcela={setValorParcela}
              parcelasAtraso={parcelasAtraso}
              setParcelasAtraso={setParcelasAtraso}
              calcularTodosDescontos={calcularTodosDescontos}
              limparTodosCampos={limparTodosCampos}
              mensagem={mensagem}
              mensagensCalculadas={mensagensCalculadas}
              mensagemAtual={mensagemAtual}
              trocarMensagem={trocarMensagem}
              opcoesCalculadas={opcoesCalculadas}
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
              setValorParcelaAcordo={setValorParcelaAcordo}
              parcelasRestantes={parcelasRestantes}
              setParcelasRestantes={setParcelasRestantes}
              isMinimized={isMinimized}
              setIsMinimized={setIsMinimized}
              calcularAcordoAtivo={calcularAcordoAtivo}
              mensagemAcordo={mensagemAcordo}
              copiarMensagemAcordo={copiarMensagemAcordo}
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