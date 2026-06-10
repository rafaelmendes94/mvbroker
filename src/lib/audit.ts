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
  | "imagem_upload";

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
