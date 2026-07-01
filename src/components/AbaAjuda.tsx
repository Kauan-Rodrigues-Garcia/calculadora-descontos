import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, User, ExternalLink } from "lucide-react";

const PASSOS = [
  {
    numero: "1️⃣",
    titulo: "Selecione o Setor do Cliente",
    descricao: "Escolha entre: EM DIA, PLAY 1, PLAY 2, PLAY 3, PLAY 4, PLAY 5 ou PLAY 6. Cada setor tem percentuais específicos.",
  },
  {
    numero: "2️⃣",
    titulo: "Informe o Valor Total em Aberto",
    descricao: "Digite o valor total da dívida. Aceita vários formatos: 1000, 1.000, 1000,00 ou 1.000,00.",
  },
  {
    numero: "3️⃣",
    titulo: "Digite o Valor da Parcela Atual",
    descricao: "Valor de cada parcela. Usado para calcular junções, semestrais e anuais.",
  },
  {
    numero: "4️⃣",
    titulo: "Parcelas em Atraso",
    descricao: "Quantas parcelas estão em atraso? Afeta quais opções aparecerão.",
  },
  {
    numero: "5️⃣",
    titulo: "Clique em 'Calcular Descontos'",
    descricao: "Sistema processa e gera mensagem com todas as opções disponíveis.",
  },
  {
    numero: "6️⃣",
    titulo: "Copie e Envie a Mensagem",
    descricao: "Use 'Copiar Mensagem' e cole no WhatsApp. Já vem formatada e pronta.",
  },
];

const AbaAjuda = ({ isDark }: { isDark: boolean }) => {
  return (
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
              {PASSOS.map((passo, index) => (
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
                src="./images/equipe-elites.png"
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
  );
};

export default AbaAjuda;
