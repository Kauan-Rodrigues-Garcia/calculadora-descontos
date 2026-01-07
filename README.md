# Calculadora de Descontos V19

Sistema automático para calcular descontos por setor e gerar mensagens personalizadas para clientes.

## 🚀 Funcionalidades

### ✅ Calculadora Principal
- **7 Setores**: EM DIA, PLAY 1, PLAY 2, PLAY 3, PLAY 6, Bookplay MARÍLIA, Play MARÍLIA
- **Cálculo Automático**: Todas as opções de desconto em uma única operação
- **Validação Financeira**: Lógica inteligente baseada no número de parcelas
- **Mensagens Personalizadas**: Geração automática de propostas formatadas

### 🎨 Interface
- **Modo Escuro/Claro**: Alternância com contraste otimizado
- **Design Responsivo**: Funciona em desktop e mobile
- **Interface Intuitiva**: Fácil de usar e navegar

### ⚙️ Configurações Avançadas
- **Editor de Descontos**: Personalize percentuais por setor
- **Visualização em Tempo Real**: Veja todos os descontos configurados
- **Persistência Local**: Configurações salvas automaticamente

## 📊 Tipos de Desconto

### 🏢 EM DIA (Completo)
- Quitação: 20%
- Junção: 5%
- Semestral: 6%
- Anual: 12%
- PIX Automático: 10%
- Cartão Recorrente: 8%

### 🎯 PLAY 1-6 e MARÍLIA
- Quitação: 25-60%
- Junção: 10-25%
- Semestral: 8-20%
- Anual: 15-25%

## 🧮 Lógica de Validação

### ✅ Regras Financeiras
- **Junção**: Máximo 2 parcelas em atraso
- **Semestral**: Mínimo 6 parcelas totais
- **Anual**: Mínimo 12 parcelas totais
- **Todas em Atraso**: Remove semestral/anual automaticamente

### 📝 Geração de Mensagens
- Ordem específica das opções
- Mensagens iniciais/finais por setor
- Formatação automática para WhatsApp
- Cálculos precisos com vírgula brasileira

## 🛠️ Tecnologias

- **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Vite** (build otimizado)
- **Lucide Icons**

## 📦 Deploy

### GitHub Pages
1. Crie repositório `calculadora-descontos`
2. Faça upload dos arquivos
3. Configure Pages: Settings → Pages → GitHub Actions
4. URL: `https://seu-usuario.github.io/calculadora-descontos`

### Vercel/Netlify
1. Conecte o repositório
2. Build command: `npm run build`
3. Output directory: `dist`

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📋 Changelog V19

### ✨ Novidades
- ✅ Modo escuro com contraste perfeito
- ✅ EM DIA completo (semestral + anual + cartão recorrente)
- ✅ Validação financeira corrigida
- ✅ Interface polida e responsiva
- ✅ Código limpo e otimizado

### 🔧 Correções
- ✅ Lógica de parcelas suficientes
- ✅ Remoção de duplicações
- ✅ Contraste de texto no modo escuro
- ✅ Build otimizado para GitHub Pages

---

**Desenvolvido com ❤️ para otimizar negociações e aumentar conversões**