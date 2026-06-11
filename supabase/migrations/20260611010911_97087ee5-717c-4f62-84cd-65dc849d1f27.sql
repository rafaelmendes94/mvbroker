ALTER TABLE public.imoveis ADD COLUMN IF NOT EXISTS exportacao_liberada boolean NOT NULL DEFAULT true;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS permite_exportacao boolean NOT NULL DEFAULT true;

CREATE OR REPLACE FUNCTION public.tg_exportacao_check_liberada()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_liberada boolean;
BEGIN
  IF public.has_role(auth.uid(), 'super_admin'::app_role) OR public.has_role(auth.uid(), 'secretaria'::app_role) THEN
    RETURN NEW;
  END IF;
  SELECT exportacao_liberada INTO v_liberada FROM public.imoveis WHERE id = NEW.imovel_id;
  IF COALESCE(v_liberada, true) = false THEN
    RAISE EXCEPTION 'Este imóvel não está liberado para exportação.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS exportacao_check_liberada ON public.exportacao_itens;
CREATE TRIGGER exportacao_check_liberada
  BEFORE INSERT ON public.exportacao_itens
  FOR EACH ROW EXECUTE FUNCTION public.tg_exportacao_check_liberada();