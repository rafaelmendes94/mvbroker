import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SystemOption = {
  id: string;
  categoria: string;
  nome: string;
  slug: string;
  ativo: boolean;
  ordem: number;
};

export const CATEGORIAS = [
  { key: "tipo_imovel", label: "Tipo de Imóvel" },
  { key: "status_imovel", label: "Status do Imóvel" },
  { key: "posicao_solar", label: "Posição Solar" },
  { key: "vista", label: "Vista" },
  { key: "posicao_predio", label: "Posição no Prédio" },
  { key: "infraestrutura", label: "Infraestrutura" },
  { key: "destaque_categoria", label: "Destaque Categoria" },
  { key: "condicoes_pagamento", label: "Condições de Pagamento" },
  { key: "tipo_proprietario", label: "Tipo Proprietário" },
  { key: "padrao_imovel", label: "Padrão Imóvel" },
] as const;

export type CategoriaKey = (typeof CATEGORIAS)[number]["key"];

export function useSystemOptions(categoria?: CategoriaKey | string) {
  const [options, setOptions] = useState<SystemOption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("system_options").select("*").order("categoria").order("ordem");
    if (categoria) q = q.eq("categoria", categoria);
    const { data } = await q;
    setOptions((data ?? []) as SystemOption[]);
    setLoading(false);
  }, [categoria]);

  useEffect(() => { load(); }, [load]);

  /** Apenas opções ativas — uso em formulários */
  const active = options.filter((o) => o.ativo);

  /** Agrupado por categoria */
  const byCategory = options.reduce<Record<string, SystemOption[]>>((acc, o) => {
    (acc[o.categoria] ??= []).push(o);
    return acc;
  }, {});

  return { options, active, byCategory, loading, reload: load };
}
