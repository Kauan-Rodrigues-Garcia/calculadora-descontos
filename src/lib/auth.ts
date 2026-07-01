// Tipos e base de usuários do sistema de autenticação.

export interface Usuario {
  login: string;
  senha: string;
  setor: string;
  perfil: "admin" | "setor";
  nome: string;
}

export interface UsuarioLogado {
  login: string;
  setor: string;
  perfil: "admin" | "setor";
  nome: string;
  setoresPermitidos: string[];
}

/** Todos os setores que um administrador pode acessar. */
export const SETORES_TODOS = ["EM DIA", "PLAY 1", "PLAY 2", "PLAY 3", "PLAY 4", "PLAY 5", "PLAY 6"];

// Base de usuários do sistema
export const USUARIOS: Usuario[] = [
  { login: "Receptivo", senha: "calcReceps34", setor: "TODOS", perfil: "admin", nome: "Receptivo" },
  { login: "EmDia", senha: "Emdia_2026", setor: "EM DIA", perfil: "setor", nome: "Setor EM DIA" },
  { login: "Play1", senha: "play1_2026", setor: "PLAY 1", perfil: "setor", nome: "Setor PLAY 1" },
  { login: "Play2", senha: "play2_2026", setor: "PLAY 2", perfil: "setor", nome: "Setor PLAY 2" },
  { login: "Play3", senha: "play3_2026", setor: "PLAY 3", perfil: "setor", nome: "Setor PLAY 3" },
  { login: "Play4", senha: "play4_2026", setor: "PLAY 4", perfil: "setor", nome: "Setor PLAY 4" },
  { login: "Play5", senha: "play5_2026", setor: "PLAY 5", perfil: "setor", nome: "Setor PLAY 5" },
  { login: "Play6", senha: "play6_2026", setor: "PLAY 6", perfil: "setor", nome: "Setor PLAY 6" },
];

/**
 * Autentica por login/senha. Retorna o usuário logado (já com os setores permitidos)
 * ou null se as credenciais não baterem.
 */
export function autenticar(login: string, senha: string): UsuarioLogado | null {
  const usuario = USUARIOS.find((u) => u.login === login && u.senha === senha);
  if (!usuario) return null;

  return {
    login: usuario.login,
    setor: usuario.setor,
    perfil: usuario.perfil,
    nome: usuario.nome,
    setoresPermitidos: usuario.perfil === "admin" ? [...SETORES_TODOS] : [usuario.setor],
  };
}
