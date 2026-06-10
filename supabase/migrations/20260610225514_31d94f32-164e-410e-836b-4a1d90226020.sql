
-- Revoga execução pública das novas funções (apenas authenticated)
REVOKE EXECUTE ON FUNCTION public.criar_notificacao(uuid, text, text, public.notification_tipo, public.notification_categoria, text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.marcar_notificacao_lida(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.marcar_todas_lidas(public.notification_categoria) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.contar_nao_lidas() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_preferencias_notificacao() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.marcar_notificacao_lida(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.marcar_todas_lidas(public.notification_categoria) TO authenticated;
GRANT EXECUTE ON FUNCTION public.contar_nao_lidas() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_preferencias_notificacao() TO authenticated;
-- criar_notificacao: apenas service_role (chamada por triggers SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.criar_notificacao(uuid, text, text, public.notification_tipo, public.notification_categoria, text, jsonb) FROM authenticated;

-- Corrige nomes de colunas usadas nas triggers
CREATE OR REPLACE FUNCTION public.tg_imoveis_notify_insert()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cidade text := COALESCE(NEW.cidade, 'sem cidade');
  v_codigo text := COALESCE(NEW.codigo_interno, NEW.id::text);
  v_link text := '/imoveis/' || NEW.id::text;
  v_user uuid;
BEGIN
  FOR v_user IN
    SELECT DISTINCT user_id FROM public.user_roles
     WHERE role IN ('super_admin', 'secretaria')
  LOOP
    PERFORM public.criar_notificacao(
      v_user, 'Novo imóvel cadastrado',
      'Novo imóvel ' || v_codigo || ' cadastrado em ' || v_cidade || '.',
      'novo_imovel', 'imoveis', v_link,
      jsonb_build_object('imovel_id', NEW.id, 'cidade', v_cidade)
    );
  END LOOP;

  IF NEW.imobiliaria_id IS NOT NULL THEN
    PERFORM public.criar_notificacao(
      i.owner_id, 'Novo imóvel cadastrado',
      'Novo imóvel ' || v_codigo || ' em ' || v_cidade || '.',
      'novo_imovel', 'imoveis', v_link,
      jsonb_build_object('imovel_id', NEW.id)
    )
    FROM public.imobiliarias i
    WHERE i.id = NEW.imobiliaria_id AND i.owner_id IS NOT NULL;
  END IF;

  IF COALESCE(NEW.bonus, 0) > 0 THEN
    FOR v_user IN
      SELECT DISTINCT user_id FROM public.user_roles
       WHERE role IN ('super_admin', 'secretaria', 'corretor_autonomo', 'imobiliaria')
    LOOP
      PERFORM public.criar_notificacao(
        v_user, 'Imóvel com bônus',
        'Imóvel ' || v_codigo || ' possui bônus de R$ ' || NEW.bonus::text || '.',
        'novo_bonus', 'imoveis', v_link,
        jsonb_build_object('imovel_id', NEW.id, 'bonus', NEW.bonus)
      );
    END LOOP;
  END IF;

  IF COALESCE(NEW.exclusividade, false) = true THEN
    FOR v_user IN
      SELECT DISTINCT user_id FROM public.user_roles
       WHERE role IN ('super_admin', 'secretaria', 'corretor_autonomo', 'imobiliaria')
    LOOP
      PERFORM public.criar_notificacao(
        v_user, 'Novo imóvel exclusivo',
        'Imóvel ' || v_codigo || ' cadastrado como exclusividade.',
        'novo_exclusivo', 'imoveis', v_link,
        jsonb_build_object('imovel_id', NEW.id)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_imoveis_notify_update()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo text := COALESCE(NEW.codigo_interno, NEW.id::text);
  v_link text := '/imoveis/' || NEW.id::text;
  v_user uuid;
  v_msg text := NULL;
BEGIN
  IF NEW.preco IS DISTINCT FROM OLD.preco THEN
    v_msg := 'Imóvel ' || v_codigo || ' teve o valor alterado.';
  ELSIF NEW.descricao IS DISTINCT FROM OLD.descricao THEN
    v_msg := 'Imóvel ' || v_codigo || ' teve a descrição atualizada.';
  ELSIF NEW.comissao_percentual IS DISTINCT FROM OLD.comissao_percentual
     OR NEW.valor_comissao IS DISTINCT FROM OLD.valor_comissao THEN
    v_msg := 'Imóvel ' || v_codigo || ' teve a comissão alterada.';
  END IF;

  IF COALESCE(NEW.exclusividade, false) = true AND COALESCE(OLD.exclusividade, false) = false THEN
    FOR v_user IN
      SELECT DISTINCT user_id FROM public.user_roles
       WHERE role IN ('super_admin', 'secretaria', 'corretor_autonomo', 'imobiliaria')
    LOOP
      PERFORM public.criar_notificacao(
        v_user, 'Novo imóvel exclusivo',
        'Imóvel ' || v_codigo || ' agora é exclusividade.',
        'novo_exclusivo', 'imoveis', v_link,
        jsonb_build_object('imovel_id', NEW.id)
      );
    END LOOP;
  END IF;

  IF COALESCE(NEW.bonus, 0) > 0
     AND COALESCE(NEW.bonus, 0) IS DISTINCT FROM COALESCE(OLD.bonus, 0) THEN
    FOR v_user IN
      SELECT DISTINCT user_id FROM public.user_roles
       WHERE role IN ('super_admin', 'secretaria', 'corretor_autonomo', 'imobiliaria')
    LOOP
      PERFORM public.criar_notificacao(
        v_user, 'Imóvel com bônus',
        'Imóvel ' || v_codigo || ' agora possui bônus de R$ ' || NEW.bonus::text || '.',
        'novo_bonus', 'imoveis', v_link,
        jsonb_build_object('imovel_id', NEW.id, 'bonus', NEW.bonus)
      );
    END LOOP;
  END IF;

  IF v_msg IS NOT NULL AND NEW.imobiliaria_id IS NOT NULL THEN
    PERFORM public.criar_notificacao(
      i.owner_id, 'Imóvel atualizado', v_msg, 'imovel_atualizado', 'imoveis', v_link,
      jsonb_build_object('imovel_id', NEW.id)
    )
    FROM public.imobiliarias i
    WHERE i.id = NEW.imobiliaria_id AND i.owner_id IS NOT NULL;
  END IF;

  RETURN NEW;
END $$;
