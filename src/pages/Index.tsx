import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Calculator, Settings, Moon, Sun, HelpCircle, User, ExternalLink, FileText, CheckCircle, BarChart3, Target, Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [setor, setSetor] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [parcelasAtraso, setParcelasAtraso] = useState("");
  const [todasParcelasAtraso, setTodasParcelasAtraso] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [isDark, setIsDark] = useState(false);
  const { toast } = useToast();

  // Estados para Acordos Ativos
  const [statusAcordo, setStatusAcordo] = useState("Ativo (em dia)");
  const [valorOriginalAcordo, setValorOriginalAcordo] = useState("");
  const [valorParcelaAcordo, setValorParcelaAcordo] = useState("");
  const [parcelasRestantes, setParcelasRestantes] = useState("");
  const [mensagemAcordo, setMensagemAcordo] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

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
      juncao: 25,
      semestral: 20,
      anual: 25
    },
    "PLAY 3": {
      quitacao: 45,
      juncao: 15,
      semestral: 0,
      anual: 0
    },
    "PLAY 6": {
      quitacao: 60,
      juncao: 0,
      semestral: 0,
      anual: 0
    },
    "Bookplay MARÍLIA": {
      quitacao: 60,
      juncao: 0,
      semestral: 0,
      anual: 0
    },
    "Play MARÍLIA": {
      quitacao: 60,
      juncao: 0,
      semestral: 0,
      anual: 0
    }
  });

  // Configuração dos descontos para Acordos Ativos
  const [descontosAcordosAtivos, setDescontosAcordosAtivos] = useState({
    quitacao: 30,
    juncao: 10, // parcela do mês + a vencer
    atrasoParcelaVencer: 5
  });

  const calcularTodosDescontos = () => {
    if (setor === "EM DIA") {
      if (!valorParcela) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha o valor da parcela",
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
    const valorTotalNum = setor === "EM DIA" ? valorParcelaNum * parcelasAtrasoNum : tratarValor(valorTotal);
    const descontosSetor = descontosPorSetor[setor];
    console.log(valorTotalNum)
    console.log(valorParcelaNum)
    console.log(parcelasAtrasoNum)
    console.log(descontosSetor)

    const getEmojiNumber = (num) => {
      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
      return emojis[num - 1] || `${num}️⃣`;
    };
    
    // Validação financeira
    const totalLogicoParcelas = Math.round(valorTotalNum / valorParcelaNum);
    
    // Regras de validação
    const podeExibirJuncao = setor === "EM DIA" ? true : parcelasAtrasoNum < 3;
    const podeExibirSemestral = totalLogicoParcelas >= 6 && !todasParcelasAtraso;
    const podeExibirAnual = totalLogicoParcelas >= 12 && !todasParcelasAtraso;
    
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
    if (parcelasAtrasoNum > 0 && !todasParcelasAtraso && setor !== "EM DIA") {
      const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Regularizar parcelas em atraso* no valor de *R$ ${valorParcelasAtraso.toFixed(2).replace('.', ',')}* (PIX ou cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // TODAS AS PARCELAS EM ATRASO
    if (setor !== "EM DIA" && parcelasAtrasoNum > 0 && todasParcelasAtraso) {
      const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;
      mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Todas as parcelas em atraso*: por *R$ ${valorParcelasAtraso.toFixed(2).replace('.', ',')}* (PIX/cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // CONTRAPROPOSTA
    mensagemGerada += `*${getEmojiNumber(numeroOpcao)} - Contraproposta.*`;

    // Mensagem final para PLAY 2 em diante
    if (setor === "PLAY 2" || setor === "PLAY 3" || setor === "PLAY 6" || setor === "Bookplay MARÍLIA" || setor === "Play MARÍLIA") {
      mensagemGerada += "\n\n*Após o pagamento seu contrato será extinto de qualquer cobrança e seu CPF liberado de todas as restrições.*";
    }

    setMensagem(mensagemGerada);
    
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
        {/* Header com design baseado nas referências */}
        <div className={`rounded-2xl p-6 mb-6 relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-lg'
        }`}>
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className={`absolute top-4 right-4 rounded-full ${
              isDark 
                ? 'border-slate-500 bg-slate-700 hover:bg-slate-600 text-slate-300' 
                : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              isDark 
                ? 'bg-blue-600 shadow-lg shadow-blue-600/25' 
                : 'bg-blue-600 shadow-lg shadow-blue-600/25'
            }`}>
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Calculadora de Descontos
            </h1>
            <p className={`text-lg ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Calcule descontos e gere mensagens automaticamente
            </p>
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
                    <Select value={setor} onValueChange={setSetor}>
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
                        <SelectItem value="EM DIA">EM DIA</SelectItem>
                        <SelectItem value="PLAY 1">PLAY 1</SelectItem>
                        <SelectItem value="PLAY 2">PLAY 2</SelectItem>
                        <SelectItem value="PLAY 3">PLAY 3</SelectItem>
                        <SelectItem value="PLAY 6">PLAY 6 / MARÍLIA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {setor !== "EM DIA" ? (
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
                  ) : null}

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

                  {setor !== "PLAY 6" ? (
                    <div>
                      <Label htmlFor="parcelasAtraso" className={`text-sm font-semibold mb-2 block ${
                        isDark ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        {setor === "EM DIA" ? 'Quantidade de parcelas' : "Parcelas em Atraso"}
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
                  {setor !== "EM DIA" && setor !== "PLAY 6" ? (
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="todasParcelasAtraso"
                        checked={todasParcelasAtraso}
                        onChange={(e) => setTodasParcelasAtraso(e.target.checked)}
                        className={`w-5 h-5 rounded-md ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500' 
                            : 'bg-white border-slate-300 text-blue-600 focus:ring-blue-500'
                        }`}
                      />
                      <Label htmlFor="todasParcelasAtraso" className={`text-sm font-medium ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        Todas as parcelas estão em atraso
                      </Label>
                    </div>
                  ) : null}

                  <Button 
                    onClick={calcularTodosDescontos} 
                    className={`w-full h-12 rounded-xl font-semibold text-base transition-all ${
                      isDark 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25' 
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25'
                    }`}
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    Calcular Descontos
                  </Button>
                </CardContent>
              </Card>

              {/* Mensagem Gerada */}
              <Card className={`rounded-2xl border-0 shadow-lg ${
                isDark 
                  ? 'bg-slate-800 shadow-slate-900/50' 
                  : 'bg-white shadow-slate-200/50'
              }`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    Mensagem Gerada
                  </CardTitle>
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

          {/* Aba Configurações */}
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
                <div className="grid gap-6">
                  {Object.entries(descontosPorSetor).map(([setor, descontos]) => (
                    <div key={setor} className={`p-6 rounded-xl border-2 ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600' 
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h3 className={`font-bold text-lg mb-4 ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}>
                        {setor}
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
                            <Input
                              type="number"
                              value={valor}
                              onChange={(e) => {
                                const novoValor = parseFloat(e.target.value) || 0;
                                setDescontosPorSetor(prev => ({
                                  ...prev,
                                  [setor]: {
                                    ...prev[setor],
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
                    </div>
                  ))}
                </div>
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
                      ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-slate-600' 
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
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

                  {/* Regras de Negócio */}
                  <div className={`p-6 rounded-xl ${
                    isDark 
                      ? 'bg-slate-700 border border-slate-600' 
                      : 'bg-slate-50 border border-slate-200'
                  }`}>
                    <h3 className={`font-bold text-lg mb-4 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      ⚙️ Regras de Negócio
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${
                        isDark ? 'bg-slate-600/50' : 'bg-white'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          isDark ? 'text-purple-300' : 'text-purple-700'
                        }`}>
                          Junção
                        </h4>
                        <ul className={`text-sm space-y-1 ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          <li>• Aparece com <strong>menos de 3 parcelas em atraso</strong></li>
                          <li>• <strong>EM DIA:</strong> 2 parcelas (mês atual + próximo)</li>
                          <li>• <strong>Outros:</strong> Parcelas em atraso + 1 a vencer</li>
                        </ul>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${
                        isDark ? 'bg-slate-600/50' : 'bg-white'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          isDark ? 'text-blue-300' : 'text-blue-700'
                        }`}>
                          Semestral e Anual
                        </h4>
                        <ul className={`text-sm space-y-1 ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          <li>• <strong>Semestral:</strong> Mínimo 6 parcelas</li>
                          <li>• <strong>Anual:</strong> Mínimo 12 parcelas</li>
                          <li>• Não aparecem se "Todas em atraso"</li>
                        </ul>
                      </div>
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
