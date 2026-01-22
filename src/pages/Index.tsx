import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Calculator, Settings, Moon, Sun, HelpCircle, User, ExternalLink, FileText, CheckCircle, BarChart3, Target, Minus, Plus, ChevronDown, ChevronUp, Lock, LogOut, Shield, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos para autenticação
interface Usuario {
  login: string;
  senha: string;
  setor: string;
  perfil: 'admin' | 'setor';
  nome: string;
}

interface UsuarioLogado {
  login: string;
  setor: string;
  perfil: 'admin' | 'setor';
  nome: string;
  setoresPermitidos: string[];
}

// Base de usuários do sistema
const USUARIOS: Usuario[] = [
  { login: "Receptivo", senha: "calcReceps34", setor: "TODOS", perfil: "admin", nome: "Receptivo" },
  { login: "EmDia", senha: "Emdia_2026", setor: "EM DIA", perfil: "setor", nome: "Setor EM DIA" },
  { login: "Play1", senha: "play1_2026", setor: "PLAY 1", perfil: "setor", nome: "Setor PLAY 1" },
  { login: "Play2", senha: "play2_2026", setor: "PLAY 2", perfil: "setor", nome: "Setor PLAY 2" },
  { login: "Play3", senha: "play3_2026", setor: "PLAY 3", perfil: "setor", nome: "Setor PLAY 3" },
  { login: "Play4", senha: "play4_2026", setor: "PLAY 4", perfil: "setor", nome: "Setor PLAY 4" },
  { login: "Play5", senha: "play5_2026", setor: "PLAY 5", perfil: "setor", nome: "Setor PLAY 5" },
  { login: "Play6", senha: "play6_2026", setor: "PLAY 6", perfil: "setor", nome: "Setor PLAY 6" }
];

// Componente de Login
const LoginForm = ({ onLogin, isDark }: { onLogin: (usuario: UsuarioLogado) => void; isDark: boolean }) => {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    const usuario = USUARIOS.find(u => u.login === login && u.senha === senha);

    if (usuario) {
      const usuarioLogado: UsuarioLogado = {
        login: usuario.login,
        setor: usuario.setor,
        perfil: usuario.perfil,
        nome: usuario.nome,
        setoresPermitidos: usuario.perfil === 'admin' 
          ? ["EM DIA", "PLAY 1", "PLAY 2", "PLAY 3", "PLAY 4", "PLAY 5", "PLAY 6"]
          : [usuario.setor]
      };

      // Salvar no localStorage para persistência
      localStorage.setItem('calculadora_usuario', JSON.stringify(usuarioLogado));
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${usuario.nome}`,
      });

      onLogin(usuarioLogado);
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Login ou senha incorretos",
        variant: "destructive"
      });
    }

    setCarregando(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <Card className={`w-full max-w-md rounded-2xl border-0 shadow-2xl ${
        isDark 
          ? 'bg-slate-800 shadow-slate-900/50' 
          : 'bg-white shadow-slate-200/50'
      }`}>
        <CardHeader className="text-center pb-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto ${
            isDark 
              ? 'bg-blue-600 shadow-lg shadow-blue-600/25' 
              : 'bg-blue-600 shadow-lg shadow-blue-600/25'
          }`}>
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Acesso Restrito
          </CardTitle>
          <p className={`text-sm ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Faça login para acessar a Calculadora de Descontos
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login" className={`text-sm font-semibold mb-2 block ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Login
              </Label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Digite seu login"
                required
                className={`h-12 rounded-xl border-2 transition-all ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500' 
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500 hover:border-blue-500 focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <Label htmlFor="senha" className={`text-sm font-semibold mb-2 block ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className={`h-12 rounded-xl border-2 pr-12 transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 hover:border-blue-500 focus:border-blue-500' 
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-500 hover:border-blue-500 focus:border-blue-500'
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={carregando}
              className={`w-full h-12 rounded-xl font-semibold text-base transition-all ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'
              }`}
            >
              {carregando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Autenticando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>


        </CardContent>
      </Card>
    </div>
  );
};

const Index = () => {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);
  const [setor, setSetor] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [parcelasAtraso, setParcelasAtraso] = useState("");
  const [todasParcelasAtraso, setTodasParcelasAtraso] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [isDark, setIsDark] = useState(true);
  const { toast } = useToast();

  // Estados para Acordos Ativos
  const [statusAcordo, setStatusAcordo] = useState("Ativo (em dia)");
  const [valorOriginalAcordo, setValorOriginalAcordo] = useState("");
  const [valorParcelaAcordo, setValorParcelaAcordo] = useState("");
  const [parcelasRestantes, setParcelasRestantes] = useState("");
  const [mensagemAcordo, setMensagemAcordo] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  // Estado para o setor selecionado na configuração
  const [setorSelecionadoConfig, setSetorSelecionadoConfig] = useState("EM DIA");

  // Estados para o sistema de mensagens
  const [mensagemAtual, setMensagemAtual] = useState(1); // 1, 2 ou 3
  const [mensagensCalculadas, setMensagensCalculadas] = useState<{[key: number]: string}>({});

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('calculadora_usuario');
    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      setUsuarioLogado(usuario);
      
      // Se for usuário de setor específico, definir automaticamente
      if (usuario.perfil === 'setor') {
        setSetor(usuario.setor);
        setSetorSelecionadoConfig(usuario.setor);
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Configuração dos descontos por setor
  const [descontosPorSetor, setDescontosPorSetor] = useState({
    "EM DIA": {
      quitacao: 20,
      juncao: 5,
      pixAutomatico: 10,
      cartaoRecorrente: 8,
      semestral: 6,
      anual: 12
    },
    "PLAY 1": {
      quitacao: 25,
      juncao: 12,
      semestral: 8,
      anual: 18
    },
    "PLAY 2": {
      quitacao: 35,
      juncao: 18,
      semestral: 18,
      anual: 25
    },
    "PLAY 3": {
      quitacao: 45,
      juncao: 15,
      semestral: 0,
      anual: 0
    },
    "PLAY 4": {
      quitacao: 45,
      juncao: 15,
      semestral: 0,
      anual: 0
    },
    "PLAY 5": {
      quitacao: 45,
      juncao: 15,
      semestral: 0,
      anual: 0
    },
    "PLAY 6": {
      quitacao: 45,
      juncao: 15,
      semestral: 0,
      anual: 0
    }
  });

  // Configuração dos descontos para Acordos Ativos
  const [descontosAcordosAtivos, setDescontosAcordosAtivos] = useState({
    quitacao: 30,
    juncao: 10,
    atrasoParcelaVencer: 5
  });

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

    // Função para tratar valores com ponto ou vírgula
    const tratarValor = (valor) => {
      if (!valor) return 0;
      return parseFloat(valor.toString().replace(/\./g, '').replace(',', '.'));
    };

    const valorParcelaNum = tratarValor(valorParcela);
    const parcelasAtrasoNum = parcelasAtraso ? parseInt(parcelasAtraso) : 0;
    const valorTotalNum = tratarValor(valorTotal);
    const descontosSetor = descontosPorSetor[setor];

    const getEmojiNumber = (num) => {
      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
      return emojis[num - 1] || `${num}️⃣`;
    };
    
    // Validação financeira
    const totalLogicoParcelas = Math.round(valorTotalNum / valorParcelaNum);
    
    // Regras de validação
    const podeExibirJuncao = setor === "EM DIA" ? true : parcelasAtrasoNum < 3;
    const podeExibirSemestral = totalLogicoParcelas >= 6 && descontosSetor.semestral > 0;
    const podeExibirAnual = totalLogicoParcelas >= 12 && descontosSetor.anual > 0;
    
    let mensagemGerada = "";
    let numeroOpcao = 1;

    // Mensagem inicial específica por setor
    if (setor === "EM DIA") {
      mensagemGerada += "Segue as propostas COM descontos para te auxiliar :)\n\n";
    } else {
      mensagemGerada += "Segue as propostas que temos hoje vigentes para seu contrato:\n\n";
    }

    // 1. QUITAÇÃO PIX
    if (descontosSetor.quitacao > 0) {
      const valorDesconto = valorTotalNum * (descontosSetor.quitacao / 100);
      const valorComDesconto = valorTotalNum - valorDesconto;
      
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Quitação* à vista no *BOLETO* ou *PIX* de *R$ ${valorTotalNum.toFixed(2).replace('.', ',')}* por apenas *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*\n\n`;
      numeroOpcao++;
    }

    // 2. QUITAÇÃO CARTÃO
    if (descontosSetor.quitacao > 0) {
      const valorDesconto = valorTotalNum * (descontosSetor.quitacao / 100);
      const valorComDesconto = valorTotalNum - valorDesconto;
      const valorParcelado12x = valorComDesconto / 12;
      
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Quitação* no *Cartão de Crédito* ficando em até *12x de R$ ${valorParcelado12x.toFixed(2).replace('.', ',')}* por mês. (Podendo ser cartão de terceiros)\n\n`;
      numeroOpcao++;
    }

    // 3. JUNÇÃO
    if (descontosSetor.juncao > 0 && podeExibirJuncao) {
      if (setor === "EM DIA") {
        const valorDuasParcelas = valorParcelaNum * 2;
        const valorDesconto = valorDuasParcelas * (descontosSetor.juncao / 100);
        const valorComDesconto = valorDuasParcelas - valorDesconto;
        mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Parcelas do mês* (novembro + dezembro com desconto) de *R$ ${valorDuasParcelas.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* Vencimento: *HOJE*\n\n`;
      } else {
        const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;
        const valorUmaParcelaVencer = valorParcelaNum;
        const valorTotalJuncao = valorParcelasAtraso + valorUmaParcelaVencer;
        const valorDesconto = valorTotalJuncao * (descontosSetor.juncao / 100);
        const valorComDesconto = valorTotalJuncao - valorDesconto;
        
        mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Junção* (${parcelasAtrasoNum} parcelas em atraso + 1 a vencer) de *R$ ${valorTotalJuncao.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* Vencimento: *HOJE*\n\n`;
      }
      numeroOpcao++;
    }

    // 4. SEMESTRAL
    if (descontosSetor.semestral > 0 && podeExibirSemestral) {
      const valorSeisParcelas = valorParcelaNum * 6;
      const valorDesconto = valorSeisParcelas * (descontosSetor.semestral / 100);
      const valorComDesconto = valorSeisParcelas - valorDesconto;
      
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Semestral* (6 parcelas) de *R$ ${valorSeisParcelas.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* (PIX ou cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // 5. ANUAL
    if (descontosSetor.anual > 0 && podeExibirAnual) {
      const valorDozeParcelas = valorParcelaNum * 12;
      const valorDesconto = valorDozeParcelas * (descontosSetor.anual / 100);
      const valorComDesconto = valorDozeParcelas - valorDesconto;
      
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Anuidade* (12 parcelas) de *R$ ${valorDozeParcelas.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* (PIX ou cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // PIX AUTOMÁTICO para EM DIA
    if (setor === "EM DIA" && descontosSetor.pixAutomatico > 0) {
      const valorDesconto = valorTotalNum * (descontosSetor.pixAutomatico / 100);
      const valorComDesconto = valorTotalNum - valorDesconto;
      const numeroParcelas = Math.ceil(valorTotalNum / valorParcelaNum);
      const novaParcelaComDesconto = valorComDesconto / numeroParcelas;
      
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - PIX Automático* com desconto: de *R$ ${valorTotalNum.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*\n`;
      mensagemGerada += `Ficaria em ${numeroParcelas}x de R$ ${novaParcelaComDesconto.toFixed(2).replace('.', ',')} (em vez de R$ ${valorParcelaNum.toFixed(2).replace('.', ',')})\n\n`;
      numeroOpcao++;
    }

    // CARTÃO RECORRENTE para EM DIA
    if (setor === "EM DIA" && descontosSetor.cartaoRecorrente > 0) {
      const valorDesconto = valorTotalNum * (descontosSetor.cartaoRecorrente / 100);
      const valorComDesconto = valorTotalNum - valorDesconto;
      const numeroParcelas = Math.ceil(valorTotalNum / valorParcelaNum);
      const novaParcelaComDesconto = valorComDesconto / numeroParcelas;
      
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Cartão Recorrente* com desconto: de *R$ ${valorTotalNum.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*\n`;
      mensagemGerada += `Ficaria em ${numeroParcelas}x de R$ ${novaParcelaComDesconto.toFixed(2).replace('.', ',')} no cartão\n\n`;
      numeroOpcao++;
    }
    
    // REGULARIZAR PARCELAS EM ATRASO
    if (parcelasAtrasoNum > 0 && setor !== "EM DIA") {
      const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Regularizar parcelas em atraso* no valor de *R$ ${valorParcelasAtraso.toFixed(2).replace('.', ',')}* (PIX ou cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // CONTRAPROPOSTA
    mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Contraproposta.*`;
    
    // Gerar mensagens baseadas no setor
    let mensagensGeradas: {[key: number]: string} = {};
    
    // PRIMEIRA MENSAGEM SEMPRE A PADRÃO ORIGINAL
    mensagensGeradas[1] = mensagemGerada;
    
    if (setor === "PLAY 3" || setor === "PLAY 4" || setor === "PLAY 5" || setor === "PLAY 6") {
      // Setores 3 em diante - mensagens 2 e 3 diretas e urgentes
      mensagensGeradas[2] = gerarMensagemSetor3EmDiante(2, valorTotalNum, descontosSetor);
      mensagensGeradas[3] = gerarMensagemSetor3EmDiante(3, valorTotalNum, descontosSetor);
    } else if (setor === "PLAY 2") {
      // Setor 2 - mensagens 2 e 3 explicativas e institucionais
      mensagensGeradas[2] = gerarMensagemSetor2EmDiante(2, valorTotalNum, valorParcelaNum, descontosSetor, parcelasAtrasoNum);
      mensagensGeradas[3] = gerarMensagemSetor2EmDiante(3, valorTotalNum, valorParcelaNum, descontosSetor, parcelasAtrasoNum);
    } else {
      // EM DIA e PLAY 1 - todas as mensagens iguais à original
      mensagensGeradas[2] = mensagemGerada;
      mensagensGeradas[3] = mensagemGerada;
    }
    
    setMensagensCalculadas(mensagensGeradas);
    setMensagemAtual(1);
    setMensagem(mensagensGeradas[1] || mensagemGerada);
    
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

  // Funções para gerar mensagens por setor
  const gerarMensagemSetor3EmDiante = (numeroMensagem: number, valorTotalNum: number, descontosSetor: any) => {
    const valorQuitacao = valorTotalNum * (descontosSetor.quitacao / 100);
    const valorComDesconto = valorTotalNum - valorQuitacao;
    const valorParcelado12x = valorComDesconto / 12;

    switch (numeroMensagem) {
      case 1:
        return `📌 Valor atualizado do débito: ~R$ ${valorTotalNum.toFixed(2).replace('.', ',')}~

1️⃣ PIX por apenas *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*

2️⃣ Cartão de crédito parcelado em até *12x de R$ ${valorParcelado12x.toFixed(2).replace('.', ',')}*

3️⃣ Quero fazer uma contraproposta e negociar agora!

⚠️ URGENTE! O não retorno a esta proposta poderá resultar na continuidade das medidas cabíveis em seu CPF.

*Qual forma de pagamento vamos concluir?*`;
      
      case 2:
        return `🔴 ATENÇÃO: Situação crítica detectada!

Valor em aberto: *R$ ${valorTotalNum.toFixed(2).replace('.', ',')}*

💰 OFERTA ESPECIAL:
• Quitação à vista: *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*
• Parcelamento facilitado: *12x R$ ${valorParcelado12x.toFixed(2).replace('.', ',')}*

⏰ Esta proposta expira em 24h!

*Confirme sua opção para regularizar hoje mesmo.*`;
      
      case 3:
        return `🚨 Última oportunidade de negociação!

Débito total: R$ ${valorTotalNum.toFixed(2).replace('.', ',')}

🎯 CONDIÇÕES FINAIS:
💳 PIX: R$ ${valorComDesconto.toFixed(2).replace('.', ',')}
💳 Cartão: 12x R$ ${valorParcelado12x.toFixed(2).replace('.', ',')}

⚠️ Após hoje, o caso seguirá para as medidas legais cabíveis.

*Qual opção escolhe para encerrar definitivamente?*`;
      
      default:
        return "";
    }
  };

  const gerarMensagemSetor2EmDiante = (numeroMensagem: number, valorTotalNum: number, valorParcelaNum: number, descontosSetor: any, parcelasAtrasoNum: number) => {
    const valorQuitacao = valorTotalNum * (descontosSetor.quitacao / 100);
    const valorComDesconto = valorTotalNum - valorQuitacao;
    const valorParcelado12x = valorComDesconto / 12;
    const valorJuncao = (valorParcelaNum * parcelasAtrasoNum + valorParcelaNum) * (1 - descontosSetor.juncao / 100);
    const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;

    switch (numeroMensagem) {
      case 1:
        return `Para evitar restrições e manter seu *nome limpo*, liberamos *condições especiais de negociação* para regularizar seu contrato com a empresa.

### *Opções de pagamento disponíveis:*

1️⃣ Quitação de todas parcelas via PIX R$ *${valorTotalNum.toFixed(2).replace('.', ',')}* → R$ *${valorComDesconto.toFixed(2).replace('.', ',')}*

2️⃣ Quitação total no cartão de crédito (podendo ser de terceiros) em até 12x → *R$ ${valorParcelado12x.toFixed(2).replace('.', ',')}*

3️⃣ Junção (parcelas em atraso + a vencer com desconto) → *R$ ${valorJuncao.toFixed(2).replace('.', ',')}*

4️⃣ Regularização apenas das parcelas em atraso sem juros → *R$ ${valorParcelasAtraso.toFixed(2).replace('.', ',')}*

💳 *Escolha a melhor opção e garanta a paralisação das cobranças hoje mesmo.*

📲 *0800 777 2020 Pagueplay*

✨ *Ao pagar hoje, você elimina encargos, taxas e finaliza o pedido de possível processo.* Essa é a *oportunidade de resolver sua situação* e *garantir seu certificado 🎓* sem preocupações futuras.`;
      
      case 2:
        return `Aviso que finaliza HOJE o prazo para *CONCILIAÇÃO AMIGÁVEL* ou manutenção do acordo formalizado do contrato com a empresa.

Sua documentação foi classificada com urgência para despacho no valor de *R$ ${valorTotalNum.toFixed(2).replace('.', ',')}* + taxas.

### ✅ Opções de resolução imediata:

1️⃣ Quitação de TODAS as parcelas via PIX por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*

2️⃣ Cartão de crédito (próprio ou terceiros) em até *12x de R$ ${valorParcelado12x.toFixed(2).replace('.', ',')}*

3️⃣ Junção (parcelas em atraso + a vencer) por *R$ ${valorJuncao.toFixed(2).replace('.', ',')}*

4️⃣ Regularização das parcelas em atraso sem juros por *R$ ${valorParcelasAtraso.toFixed(2).replace('.', ',')}*

⚠️ *Prazo final: HOJE*`;
      
      case 3:
        return `🚨 NOTIFICAÇÃO FINAL - Processo em andamento

Valor consolidado: R$ ${valorTotalNum.toFixed(2).replace('.', ',')}

🔴 MEDIDAS IMEDIATAS DISPONÍVEIS:

• Acordo total PIX: *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*
• Parcelamento cartão: *12x R$ ${valorParcelado12x.toFixed(2).replace('.', ',')}*
• Regularização parcial: *R$ ${valorParcelasAtraso.toFixed(2).replace('.', ',')}*

⏱️ Prazo para resposta: Até o final do dia

*Qual ação será tomada para evitar prosseguimento?*`;
      
      default:
        return "";
    }
  };

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

    const tratarValor = (valor) => {
      if (!valor) return 0;
      return parseFloat(valor.toString().replace(/\./g, '').replace(',', '.'));
    };

    const valorParcelaNum = tratarValor(valorParcelaAcordo);
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
          </TabsContent>

          {/* Aba Configurações - COM CONTROLE DE ACESSO */}
          <TabsContent value="configuracoes" className="space-y-6 mt-6">
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
                            {tipo === 'quitacao' ? 'Quitação (%)' :
                             tipo === 'juncao' ? 'Junção (%)' :
                             tipo === 'pixAutomatico' ? 'PIX Auto (%)' :
                             tipo === 'cartaoRecorrente' ? 'Cartão Rec. (%)' :
                             tipo === 'semestral' ? 'Semestral (%)' :
                             'Anual (%)'}
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
                                  {tipo === 'quitacao' ? 'Quitação (%)' :
                                   tipo === 'juncao' ? 'Junção (%)' :
                                   tipo === 'pixAutomatico' ? 'PIX Auto (%)' :
                                   tipo === 'cartaoRecorrente' ? 'Cartão Rec. (%)' :
                                   tipo === 'semestral' ? 'Semestral (%)' :
                                   'Anual (%)'}
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
          </TabsContent>

          {/* Aba Acordos Ativos */}
          <TabsContent value="acordos-ativos" className="space-y-6 mt-6">
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
                            setDescontosAcordosAtivos(prev => ({
                              ...prev,
                              quitacao: novoValor
                            }));
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
                            setDescontosAcordosAtivos(prev => ({
                              ...prev,
                              juncao: novoValor
                            }));
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
                            setDescontosAcordosAtivos(prev => ({
                              ...prev,
                              atrasoParcelaVencer: novoValor
                            }));
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
                                (parseFloat(valorParcelaAcordo.replace(',', '.')) * parseInt(parcelasRestantes)).toFixed(2).replace('.', ',') : 
                                "0,00"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Economia:</span>
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              R$ {valorParcelaAcordo && parcelasRestantes ? 
                                ((parseFloat(valorParcelaAcordo.replace(',', '.')) * parseInt(parcelasRestantes) * descontosAcordosAtivos.quitacao) / 100).toFixed(2).replace('.', ',') : 
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
                        className={`flex-1 h-12 rounded-xl font-semibold text-base transition-all ${isDark ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25'}`}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Mensagem Acordo em Dia
                      </Button>
                      <Button 
                        className={`flex-1 h-12 rounded-xl font-semibold text-base transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25'}`}
                      >
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Informações do Acordo
                      </Button>
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
          </TabsContent>

          {/* Aba Como Usar */}
          <TabsContent value="ajuda" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {/* Como Usar */}
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
                      isDark ? 'bg-blue-600' : 'bg-blue-600'
                    }`}>
                      <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    Como Usar a Calculadora
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Propósito */}
                  <div className={`p-6 rounded-xl ${
                    isDark 
                      ? 'bg-gradient-to-r from-blue-900/30 to-green-900/30 border border-slate-600' 
                      : 'bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200'
                  }`}>
                    <h3 className={`font-bold text-lg mb-3 ${
                      isDark ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      🎯 O que é esta ferramenta?
                    </h3>
                    <p className={`text-base leading-relaxed mb-3 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      A <strong>Calculadora de Descontos</strong> é uma ferramenta para <strong>facilitar e agilizar</strong> o processo de atendimento nos setores, desenvolvida <strong>especialmente para o receptivo</strong>.
                    </p>
                    <p className={`text-base leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Ela automatiza o cálculo de descontos personalizados por <strong>setor</strong>, aplica regras de acordo para negociação e gera <strong>mensagens padronizadas para Chatplay/WhatsApp</strong>, garantindo <strong>agilidade</strong>, e facilidade na hora de calcular os <strong>descontos</strong>.
                    </p>
                  </div>

                  {/* Passo a Passo */}
                  <div className={`p-6 rounded-xl ${
                    isDark 
                      ? 'bg-slate-700 border border-slate-600' 
                      : 'bg-slate-50 border border-slate-200'
                  }`}>
                    <h3 className={`font-bold text-lg mb-4 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`}>
                      📋 Passo a Passo Detalhado
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        {
                          numero: "1️⃣",
                          titulo: "Selecione o Setor do Cliente",
                          descricao: "Escolha entre: EM DIA, PLAY 1, PLAY 2, PLAY 3, PLAY 6, Bookplay MARÍLIA ou Play MARÍLIA. Cada setor tem percentuais específicos."
                        },
                        {
                          numero: "2️⃣",
                          titulo: "Informe o Valor Total em Aberto",
                          descricao: "Digite o valor total da dívida. Aceita vários formatos: 1000, 1.000, 1000,00 ou 1.000,00."
                        },
                        {
                          numero: "3️⃣",
                          titulo: "Digite o Valor da Parcela Atual",
                          descricao: "Valor de cada parcela. Usado para calcular junções, semestrais e anuais."
                        },
                        {
                          numero: "4️⃣",
                          titulo: "Parcelas em Atraso",
                          descricao: "Quantas parcelas estão em atraso? Afeta quais opções aparecerão."
                        },
                        {
                          numero: "5️⃣",
                          titulo: "Marque 'Todas em atraso' (se aplicável)",
                          descricao: "Se TODAS estiverem em atraso, remove automaticamente Semestral e Anual."
                        },
                        {
                          numero: "6️⃣",
                          titulo: "Clique em 'Calcular Descontos'",
                          descricao: "Sistema processa e gera mensagem com todas as opções disponíveis."
                        },
                        {
                          numero: "7️⃣",
                          titulo: "Copie e Envie a Mensagem",
                          descricao: "Use 'Copiar Mensagem' e cole no WhatsApp. Já vem formatada e pronta."
                        }
                      ].map((passo, index) => (
                        <div key={index} className={`p-4 rounded-lg ${
                          isDark ? 'bg-slate-600/50' : 'bg-white'
                        }`}>
                          <h4 className={`font-semibold mb-2 ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {passo.numero} {passo.titulo}
                          </h4>
                          <p className={`text-sm ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {passo.descricao}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>


                </CardContent>
              </Card>

              {/* Feito por Elites */}
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
                      isDark ? 'bg-purple-600' : 'bg-purple-600'
                    }`}>
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Feito por Elites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-8 rounded-xl text-center ${
                    isDark 
                      ? 'bg-gradient-to-br from-slate-700 to-slate-600' 
                      : 'bg-gradient-to-br from-purple-50 to-indigo-100'
                  }`}>
                    {/* Foto da equipe Elites - proporção 4:3 */}
                    <div className="rounded-2xl mx-auto mb-6 overflow-hidden border-4 border-white shadow-2xl" style={{ width: '50%', height: '410px' }}>
                      <img 
                        src="./images/Captura de tela5181.png" 
                        alt="Equipe Elites" 
                        className="hover:scale-105 transition-transform duration-300"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    
                    {/* Seção de Contato */}
                    <div className={`p-6 rounded-xl mb-6 ${
                      isDark 
                        ? 'bg-slate-600/50 border border-slate-500' 
                        : 'bg-white/70 border border-slate-200'
                    }`}>
                      <h4 className={`font-bold text-lg mb-3 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        💡 Encontrou algum bug ou tem ideias de melhorias?
                      </h4>
                      <p className={`text-base mb-4 ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        Por gentileza esse é um projeto inicial, caso encontre algum bug avisar para conseguirmos melhorar, caso queira sugerir ideias, fique a vontade.
                      </p>
                    </div>
                    
                    {/* Botão de feedback */}
                    <div className="flex justify-center">
                      <a 
                        href="https://wa.me/5518935056541?text=Olá%2C%20gostaria%20de%20dar%20um%20feedback%20sobre%20a%20Calculadora%20de%20Descontos%20-%20Elites" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base transition-all ${
                          isDark 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25' 
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25'
                        }`}
                      >
                        <ExternalLink className="h-5 w-5" />
                        Feedback & Sugestões
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;