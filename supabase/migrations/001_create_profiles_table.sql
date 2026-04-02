-- Criar tabela public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  setor text NOT NULL,
  perfil text NOT NULL CHECK (perfil IN ('admin', 'setor')),
  setores_permitidos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: usuário pode ler o próprio perfil
CREATE POLICY "Usuário pode ler o próprio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: usuário pode inserir o próprio perfil
CREATE POLICY "Usuário pode inserir o próprio perfil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: usuário pode atualizar o próprio perfil
CREATE POLICY "Usuário pode atualizar o próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Função trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, setor, perfil, setores_permitidos)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'setor', 'EM DIA'),
    COALESCE(NEW.raw_user_meta_data->>'perfil', 'setor'),
    ARRAY(
      SELECT jsonb_array_elements_text(
        COALESCE(NEW.raw_user_meta_data->'setores_permitidos', '["EM DIA"]'::jsonb)
      )
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger: executar após insert em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
