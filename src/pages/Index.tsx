import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy, Calculator, Settings, Save, Moon, Sun } from "lucide-react";
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

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Configuração dos descontos por setor (editável) - REMOVIDO parcelaUnica de todos
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
      semestral: 12,
      anual: 20
    },
    "PLAY 6": {
      quitacao: 40,
      juncao: 10,
      semestral: 8,
      anual: 15
    },
    "Bookplay MARÍLIA": {
      quitacao: 60,
      juncao: 20,
      semestral: 15,
      anual: 25
    },
    "Play MARÍLIA": {
      quitacao: 60,
      juncao: 20,
      semestral: 15,
      anual: 25
    }
  });

  // Estados para edição de descontos
  const [setorEdicao, setSetorEdicao] = useState("");
  const [descontosEdicao, setDescontosEdicao] = useState({});

  const calcularTodosDescontos = () => {
    if (!setor || !valorTotal || !valorParcela) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o setor, valor total e valor da parcela",
        variant: "destructive"
      });
      return;
    }

    // Função para tratar valores com ponto ou vírgula
    const tratarValor = (valor) => {
      // Remove pontos (separadores de milhares) e substitui vírgula por ponto
      return parseFloat(valor.replace(/\./g, '').replace(',', '.'));
    };

    const valorTotalNum = tratarValor(valorTotal);
    const valorParcelaNum = tratarValor(valorParcela);
    const parcelasAtrasoNum = parcelasAtraso ? parseInt(parcelasAtraso) : 0;
    const descontosSetor = descontosPorSetor[setor];
    
    // VALIDAÇÃO FINANCEIRA - Calcular total lógico de parcelas
    const totalLogicoParcelas = Math.round(valorTotalNum / valorParcelaNum);
    
    // REGRAS DE VALIDAÇÃO FINANCEIRA CORRETAS
    const podeExibirJuncao = parcelasAtrasoNum < 3; // MENOS que 3 parcelas em atraso (0, 1 ou 2)
    // LÓGICA FINANCEIRA CORRETA: Cliente precisa ter parcelas suficientes para o plano
    const podeExibirSemestral = totalLogicoParcelas >= 6 && !todasParcelasAtraso; // MÍNIMO 6 parcelas
    const podeExibirAnual = totalLogicoParcelas >= 12 && !todasParcelasAtraso; // MÍNIMO 12 parcelas
    
    // DEBUG: Mostrar cálculos no console para verificação
    console.log('=== VALIDAÇÃO FINANCEIRA CORRIGIDA ===');
    console.log('Valor Total:', valorTotalNum);
    console.log('Valor Parcela:', valorParcelaNum);
    console.log('Total Lógico Parcelas:', totalLogicoParcelas);
    console.log('Parcelas em Atraso:', parcelasAtrasoNum);
    console.log('Todas Parcelas Atraso:', todasParcelasAtraso);
    console.log('Pode Exibir Junção:', podeExibirJuncao, '(precisa < 3 atraso)');
    console.log('Pode Exibir Semestral:', podeExibirSemestral, '(precisa >= 6 parcelas)');
    console.log('Pode Exibir Anual:', podeExibirAnual, '(precisa >= 12 parcelas)');
    console.log('==========================================');
    
    let mensagemGerada = "";
    let numeroOpcao = 1;

    // Mensagem inicial específica por setor
    if (setor === "EM DIA") {
      mensagemGerada += "Segue as propostas COM descontos para te auxiliar :)\n\n";
    } else {
      mensagemGerada += "Segue as propostas que temos hoje vigentes para seu contrato:\n\n";
    }

    // 1. QUITAÇÃO PIX - sempre primeira opção
    if (descontosSetor.quitacao > 0) {
      const valorDesconto = valorTotalNum * (descontosSetor.quitacao / 100);
      const valorComDesconto = valorTotalNum - valorDesconto;
      
      mensagemGerada += `*${numeroOpcao} - Quitação* à vista no *BOLETO* ou *PIX* de *R$ ${valorTotalNum.toFixed(2).replace('.', ',')}* por apenas *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*\n\n`;
      numeroOpcao++;
    }

    // 2. QUITAÇÃO CARTÃO - sempre segunda opção
    if (descontosSetor.quitacao > 0) {
      const valorDesconto = valorTotalNum * (descontosSetor.quitacao / 100);
      const valorComDesconto = valorTotalNum - valorDesconto;
      const valorParcelado12x = valorComDesconto / 12;
      
      mensagemGerada += `*${numeroOpcao} - Quitação* no *Cartão de Crédito* ficando em até *12x de R$ ${valorParcelado12x.toFixed(2).replace('.', ',')}* por mês. (Podendo ser cartão de terceiros)\n\n`;
      numeroOpcao++;
    }

    // 3. JUNÇÃO - com validação de parcelas em atraso
    if (descontosSetor.juncao > 0 && podeExibirJuncao) {
      const valorDuasParcelas = valorParcelaNum * 2;
      const valorDesconto = valorDuasParcelas * (descontosSetor.juncao / 100);
      const valorComDesconto = valorDuasParcelas - valorDesconto;
      
      if (setor === "EM DIA") {
        // Para EM DIA: mostrar como "Parcelas do mês" com meses específicos
        mensagemGerada += `*${numeroOpcao} - Parcelas do mês* (novembro + dezembro com desconto) de *R$ ${valorDuasParcelas.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* Vencimento: *HOJE*\n\n`;
      } else {
        mensagemGerada += `*${numeroOpcao} - Junção* (Parcelas em atraso + a vencer) de *R$ ${valorDuasParcelas.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* Vencimento: *HOJE*\n\n`;
      }
      numeroOpcao++;
    }



    // 4. SEMESTRAL - com validação financeira
    if (descontosSetor.semestral > 0 && podeExibirSemestral) {
      const valorSeisParcelas = valorParcelaNum * 6;
      const valorDesconto = valorSeisParcelas * (descontosSetor.semestral / 100);
      const valorComDesconto = valorSeisParcelas - valorDesconto;
      
      mensagemGerada += `*${numeroOpcao} - Semestral* (6 parcelas) de *R$ ${valorSeisParcelas.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* (PIX ou cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // 5. ANUAL - com validação financeira
    if (descontosSetor.anual > 0 && podeExibirAnual) {
      const valorDozeParcelas = valorParcelaNum * 12;
      const valorDesconto = valorDozeParcelas * (descontosSetor.anual / 100);
      const valorComDesconto = valorDozeParcelas - valorDesconto;
      
      mensagemGerada += `*${numeroOpcao} - Anuidade* (12 parcelas) de *R$ ${valorDozeParcelas.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}* (PIX ou cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // PIX AUTOMÁTICO para EM DIA - cálculo correto
    if (setor === "EM DIA" && descontosSetor.pixAutomatico > 0) {
      const valorDesconto = valorTotalNum * (descontosSetor.pixAutomatico / 100);
      const valorComDesconto = valorTotalNum - valorDesconto;
      
      // Calcular quantas parcelas são necessárias
      const numeroParcelas = Math.ceil(valorTotalNum / valorParcelaNum);
      const novaParcelaComDesconto = valorComDesconto / numeroParcelas;
      
      mensagemGerada += `*${numeroOpcao} - PIX Automático* com desconto: de *R$ ${valorTotalNum.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*\n`;
      mensagemGerada += `Ficaria em ${numeroParcelas}x de R$ ${novaParcelaComDesconto.toFixed(2).replace('.', ',')} (em vez de R$ ${valorParcelaNum.toFixed(2).replace('.', ',')})\n\n`;
      numeroOpcao++;
    }

    // CARTÃO RECORRENTE para EM DIA
    if (setor === "EM DIA" && descontosSetor.cartaoRecorrente > 0) {
      const valorDesconto = valorTotalNum * (descontosSetor.cartaoRecorrente / 100);
      const valorComDesconto = valorTotalNum - valorDesconto;
      
      // Calcular quantas parcelas são necessárias
      const numeroParcelas = Math.ceil(valorTotalNum / valorParcelaNum);
      const novaParcelaComDesconto = valorComDesconto / numeroParcelas;
      
      mensagemGerada += `*${numeroOpcao} - Cartão Recorrente* com desconto: de *R$ ${valorTotalNum.toFixed(2).replace('.', ',')}* por *R$ ${valorComDesconto.toFixed(2).replace('.', ',')}*\n`;
      mensagemGerada += `Ficaria em ${numeroParcelas}x de R$ ${novaParcelaComDesconto.toFixed(2).replace('.', ',')} no cartão\n\n`;
      numeroOpcao++;
    }

    // REGULARIZAR PARCELAS EM ATRASO - para todos os setores (exceto se todas estão em atraso)
    if (parcelasAtrasoNum > 0 && !todasParcelasAtraso) {
      const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;
      
      mensagemGerada += `*${numeroOpcao} - Regularizar parcelas em atraso* no valor de *R$ ${valorParcelasAtraso.toFixed(2).replace('.', ',')}* (PIX ou cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // TODAS AS PARCELAS EM ATRASO - nova opção obrigatória para todos os plays
    if (setor !== "EM DIA" && parcelasAtrasoNum > 0 && todasParcelasAtraso) {
      const valorParcelasAtraso = valorParcelaNum * parcelasAtrasoNum;
      
      mensagemGerada += `*${numeroOpcao} - Todas as parcelas em atraso*: por *R$ ${valorParcelasAtraso.toFixed(2).replace('.', ',')}* (PIX/cartão de crédito)\n\n`;
      numeroOpcao++;
    }

    // CONTRAPROPOSTA - sempre última opção
    mensagemGerada += `*${numeroOpcao} - Contraproposta.*`;

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

  const limparFormulario = () => {
    setSetor("");
    setValorTotal("");
    setValorParcela("");
    setParcelasAtraso("");
    setTodasParcelasAtraso(false);
    setMensagem("");
  };

  const iniciarEdicaoSetor = (setorSelecionado) => {
    setSetorEdicao(setorSelecionado);
    setDescontosEdicao({ ...descontosPorSetor[setorSelecionado] });
  };

  const salvarDescontos = () => {
    if (!setorEdicao) return;
    
    setDescontosPorSetor(prev => ({
      ...prev,
      [setorEdicao]: { ...descontosEdicao }
    }));
    
    toast({
      title: "Descontos atualizados!",
      description: `Descontos do setor ${setorEdicao} foram salvos`
    });
    
    setSetorEdicao("");
    setDescontosEdicao({});
  };

  const atualizarDesconto = (tipo, valor) => {
    setDescontosEdicao(prev => ({
      ...prev,
      [tipo]: parseFloat(valor) || 0
    }));
  };

  return (
    <div className={`min-h-screen p-4 transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 relative">
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className={`absolute top-0 right-0 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 font-medium' 
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <h1 className={`text-4xl font-extrabold mb-2 flex items-center justify-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <Calculator className={`h-8 w-8 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            Calculadora de Descontos
          </h1>
          <p className={`text-lg font-medium ${
            isDark ? 'text-slate-200' : 'text-gray-600'
          }`}>Calcule descontos e gere mensagens automaticamente</p>
        </div>

        <Tabs defaultValue="calculadora" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculadora">Calculadora</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculadora">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className={isDark ? 'bg-slate-800 border-slate-600' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={isDark ? 'text-white font-semibold' : 'text-gray-900'}>Dados do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="setor" className={isDark ? 'text-white font-semibold' : 'text-gray-700'}>Setor *</Label>
                    <Select value={setor} onValueChange={setSetor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EM DIA">EM DIA</SelectItem>
                        <SelectItem value="PLAY 1">PLAY 1</SelectItem>
                        <SelectItem value="PLAY 2">PLAY 2</SelectItem>
                        <SelectItem value="PLAY 3">PLAY 3</SelectItem>
                        <SelectItem value="PLAY 6">PLAY 6</SelectItem>
                        <SelectItem value="Bookplay MARÍLIA">Bookplay MARÍLIA</SelectItem>
                        <SelectItem value="Play MARÍLIA">Play MARÍLIA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="valorTotal" className={isDark ? 'text-white font-semibold' : 'text-gray-700'}>Valor Total em Aberto *</Label>
                    <Input
                      id="valorTotal"
                      type="text"
                      placeholder="Ex: 1.394,40 (valor total que o cliente deve)"
                      value={valorTotal}
                      onChange={(e) => setValorTotal(e.target.value)}
                    />
                    <p className={`text-sm mt-1 font-medium ${
                      isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Informe o valor total que o cliente está devendo</p>
                  </div>

                  <div>
                    <Label htmlFor="valorParcela" className={isDark ? 'text-white font-semibold' : 'text-gray-700'}>Valor da Parcela Atual *</Label>
                    <Input
                      id="valorParcela"
                      type="text"
                      placeholder="Ex: 199,20 (valor de cada parcela)"
                      value={valorParcela}
                      onChange={(e) => setValorParcela(e.target.value)}
                    />
                    <p className={`text-sm mt-1 font-medium ${
                      isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Necessário para calcular junção, semestral, anual e PIX automático</p>
                  </div>

                  <div>
                    <Label htmlFor="parcelasAtraso" className={isDark ? 'text-white font-semibold' : 'text-gray-700'}>Parcelas em Atraso (opcional)</Label>
                    <Input
                      id="parcelasAtraso"
                      type="number"
                      placeholder="Ex: 6 (quantidade de parcelas em atraso)"
                      value={parcelasAtraso}
                      onChange={(e) => setParcelasAtraso(e.target.value)}
                    />
                    <p className={`text-sm mt-1 font-medium ${
                      isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Quantidade de parcelas em atraso (afeta disponibilidade da junção)</p>
                  </div>

                  {parcelasAtraso && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="todasParcelasAtraso"
                        checked={todasParcelasAtraso}
                        onChange={(e) => setTodasParcelasAtraso(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="todasParcelasAtraso" className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-700'
                      }`}>
                        Todas as parcelas estão em atraso
                      </Label>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={calcularTodosDescontos} className="flex-1">
                      <Calculator className="h-4 w-4 mr-2" />
                      Gerar Todas as Opções
                    </Button>
                    <Button onClick={limparFormulario} variant="outline">
                      Limpar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={isDark ? 'bg-slate-800 border-slate-600' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className={isDark ? 'text-white font-semibold' : 'text-gray-900'}>Mensagem Gerada</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={mensagem}
                    readOnly
                    placeholder="A mensagem aparecerá aqui após o cálculo..."
                    className={`min-h-[500px] font-mono text-sm ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 font-medium' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <Button 
                    onClick={copiarMensagem} 
                    className="w-full mt-4" 
                    disabled={!mensagem}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Mensagem
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="configuracoes">
            <Card className={isDark ? 'bg-slate-800 border-slate-600' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <Settings className="h-5 w-5" />
                  Configurar Descontos por Setor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Selecione o Setor para Editar</Label>
                    <Select value={setorEdicao} onValueChange={iniciarEdicaoSetor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(descontosPorSetor).map(setor => (
                          <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {setorEdicao && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label>Quitação (%)</Label>
                        <Input
                          type="number"
                          value={descontosEdicao.quitacao || 0}
                          onChange={(e) => atualizarDesconto('quitacao', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Junção (%)</Label>
                        <Input
                          type="number"
                          value={descontosEdicao.juncao || 0}
                          onChange={(e) => atualizarDesconto('juncao', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Semestral (%)</Label>
                        <Input
                          type="number"
                          value={descontosEdicao.semestral || 0}
                          onChange={(e) => atualizarDesconto('semestral', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Anual (%)</Label>
                        <Input
                          type="number"
                          value={descontosEdicao.anual || 0}
                          onChange={(e) => atualizarDesconto('anual', e.target.value)}
                        />
                      </div>
                      {setorEdicao === "EM DIA" && (
                        <>
                          <div>
                            <Label>PIX Automático (%)</Label>
                            <Input
                              type="number"
                              value={descontosEdicao.pixAutomatico || 0}
                              onChange={(e) => atualizarDesconto('pixAutomatico', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Cartão Recorrente (%)</Label>
                            <Input
                              type="number"
                              value={descontosEdicao.cartaoRecorrente || 0}
                              onChange={(e) => atualizarDesconto('cartaoRecorrente', e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      <div className="col-span-full">
                        <Button onClick={salvarDescontos} className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className={`mt-6 ${
              isDark ? 'bg-slate-800 border-slate-600' : 'bg-white'
            }`}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white font-semibold' : 'text-gray-900'}>Descontos Atuais por Setor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(descontosPorSetor).map(([setor, descontos]) => (
                    <div key={setor} className={`p-4 border rounded-lg ${
                      isDark ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-white'
                    }`}>
                      <h3 className={`font-bold mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{setor}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold">Quitação</div>
                          <div className="text-green-600">{descontos.quitacao}%</div>
                        </div>
                        {descontos.juncao > 0 && (
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-semibold">Junção</div>
                            <div className="text-blue-600">{descontos.juncao}%</div>
                          </div>
                        )}
                        {descontos.semestral > 0 && (
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="font-semibold">Semestral</div>
                            <div className="text-purple-600">{descontos.semestral}%</div>
                          </div>
                        )}
                        {descontos.anual > 0 && (
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="font-semibold">Anual</div>
                            <div className="text-red-600">{descontos.anual}%</div>
                          </div>
                        )}
                        {descontos.pixAutomatico > 0 && (
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <div className="font-semibold">PIX Auto</div>
                            <div className="text-orange-600">{descontos.pixAutomatico}%</div>
                          </div>
                        )}
                        {descontos.cartaoRecorrente > 0 && (
                          <div className="text-center p-2 bg-indigo-50 rounded">
                            <div className="font-semibold">Cartão Rec.</div>
                            <div className="text-indigo-600">{descontos.cartaoRecorrente}%</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;