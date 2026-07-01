import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff } from "lucide-react";
import { autenticar, type UsuarioLogado } from "@/lib/auth";

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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const usuarioLogado = autenticar(login, senha);

    if (usuarioLogado) {
      // Salvar no localStorage para persistência
      localStorage.setItem('calculadora_usuario', JSON.stringify(usuarioLogado));

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${usuarioLogado.nome}`,
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

export default LoginForm;
