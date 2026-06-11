
-- 1) Tabela de permissões por módulo
CREATE TABLE IF NOT EXISTS public.user_module_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo text NOT NULL,
  pode_ver boolean NOT NULL DEFAULT true,
  pode_criar boolean NOT NULL DEFAULT false,
  pode_editar boolean NOT NULL DEFAULT false,
  pode_excluir boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, modulo)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_module_permissions TO authenticated;
GRANT ALL ON public.user_module_permissions TO service_role;

ALTER TABLE public.user_module_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perm_select_own_or_admin" ON public.user_module_permissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "perm_admin_insert" ON public.user_module_permissions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "perm_admin_update" ON public.user_module_permissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "perm_admin_delete" ON public.user_module_permissions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_user_module_permissions_updated_at
  BEFORE UPDATE ON public.user_module_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Políticas extras em user_roles para o Super Admin gerenciar
CREATE POLICY "roles_admin_select_all" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "roles_admin_insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "roles_admin_delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 3) RPC: minhas permissões
CREATE OR REPLACE FUNCTION public.get_minhas_permissoes_modulo()
RETURNS TABLE(modulo text, pode_ver boolean, pode_criar boolean, pode_editar boolean, pode_excluir boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT modulo, pode_ver, pode_criar, pode_editar, pode_excluir
  FROM public.user_module_permissions
  WHERE user_id = auth.uid();
$$;

-- 4) RPC: lista de usuários para a tela admin
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  roles text[]
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Acesso negado' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, p.full_name, p.avatar_url, u.created_at, u.last_sign_in_at,
         COALESCE(ARRAY_AGG(r.role::text) FILTER (WHERE r.role IS NOT NULL), '{}')
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_roles r ON r.user_id = u.id
  GROUP BY u.id, u.email, p.full_name, p.avatar_url, u.created_at, u.last_sign_in_at
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_minhas_permissoes_modulo() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
