
-- Status da obra enum
CREATE TYPE public.status_obra AS ENUM ('lancamento', 'em_obras', 'pronto', 'entregue');

-- EDIFICIOS
CREATE TABLE public.edificios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_interno TEXT,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  cep TEXT, logradouro TEXT, numero TEXT, complemento TEXT,
  bairro TEXT, cidade TEXT, estado TEXT,
  latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  infraestrutura TEXT[] NOT NULL DEFAULT '{}',
  qtd_andares INT, qtd_elevadores INT, qtd_apartamentos INT,
  ano_construcao INT, construtora TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.edificios TO authenticated;
GRANT ALL ON public.edificios TO service_role;
ALTER TABLE public.edificios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read edificios" ON public.edificios FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth manage edificios" ON public.edificios FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'secretaria'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'secretaria'));
CREATE TRIGGER trg_edificios_upd BEFORE UPDATE ON public.edificios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONDOMINIOS
CREATE TABLE public.condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_interno TEXT,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  cep TEXT, logradouro TEXT, numero TEXT, complemento TEXT,
  bairro TEXT, cidade TEXT, estado TEXT,
  latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  infraestrutura TEXT[] NOT NULL DEFAULT '{}',
  tipo_condominio TEXT, numero_lotes INT,
  portaria TEXT, seguranca TEXT, area_total NUMERIC,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.condominios TO authenticated;
GRANT ALL ON public.condominios TO service_role;
ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read condominios" ON public.condominios FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth manage condominios" ON public.condominios FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'secretaria'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'secretaria'));
CREATE TRIGGER trg_condominios_upd BEFORE UPDATE ON public.condominios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EMPREENDIMENTOS
CREATE TABLE public.empreendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_interno TEXT,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  cep TEXT, logradouro TEXT, numero TEXT, complemento TEXT,
  bairro TEXT, cidade TEXT, estado TEXT,
  latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
  infraestrutura TEXT[] NOT NULL DEFAULT '{}',
  construtora TEXT, incorporadora TEXT,
  status_obra public.status_obra,
  data_lancamento DATE, data_prevista_entrega DATE, data_entrega_efetiva DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empreendimentos TO authenticated;
GRANT ALL ON public.empreendimentos TO service_role;
ALTER TABLE public.empreendimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read empreendimentos" ON public.empreendimentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth manage empreendimentos" ON public.empreendimentos FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'secretaria'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'secretaria'));
CREATE TRIGGER trg_empreendimentos_upd BEFORE UPDATE ON public.empreendimentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ESTRUTURA IMAGENS
CREATE TABLE public.estrutura_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estrutura_tipo TEXT NOT NULL CHECK (estrutura_tipo IN ('edificio','condominio','empreendimento')),
  estrutura_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  capa BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estrutura_imagens TO authenticated;
GRANT ALL ON public.estrutura_imagens TO service_role;
ALTER TABLE public.estrutura_imagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read estrutura_imagens" ON public.estrutura_imagens FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth manage estrutura_imagens" ON public.estrutura_imagens FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'secretaria'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'secretaria'));
CREATE INDEX idx_estrutura_imagens_lookup ON public.estrutura_imagens(estrutura_tipo, estrutura_id);
