import { supabase } from "@/integrations/supabase/client";

export type AuditEvento =
  | "login"
  | "logout"
  | "perfil_alterado"
  | "usuario_criado"
  | "usuario_inativado"
  | "edificio_criado" | "edificio_atualizado" | "edificio_excluido"
  | "condominio_criado" | "condominio_atualizado" | "condominio_excluido"
  | "empreendimento_criado" | "empreendimento_atualizado" | "empreendimento_excluido"
  | "imagem_upload"
  | "imovel_criado" | "imovel_atualizado" | "imovel_excluido" | "imovel_duplicado" | "imovel_arquivado"
  | "imovel_upload" | "imovel_xml_publicado";

export async function logAudit(evento: AuditEvento, descricao?: string, metadata?: Record<string, unknown>) {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("auditoria_acessos").insert({
      user_id: data.user.id,
      evento,
      descricao: descricao ?? null,
      metadata: (metadata ?? null) as never,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch {
    // silencioso
  }
}

/** Log granular por imóvel — também grava em imovel_logs para histórico no cadastro. */
export async function logImovel(
  imovelId: string,
  acao: string,
  descricao?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("imovel_logs").insert({
      imovel_id: imovelId,
      user_id: data.user?.id ?? null,
      acao,
      descricao: descricao ?? null,
      metadata: (metadata ?? null) as never,
    });
  } catch {
    // silencioso
  }
}
