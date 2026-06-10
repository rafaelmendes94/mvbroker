import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";

const Input = z.object({
  titulo: z.string().optional().default(""),
  tipo: z.string().optional().default(""),
  cidade: z.string().optional().default(""),
  bairro: z.string().optional().default(""),
  dormitorios: z.number().nullable().optional(),
  banheiros: z.number().nullable().optional(),
  vagas: z.number().nullable().optional(),
  area_privativa: z.number().nullable().optional(),
  area_total: z.number().nullable().optional(),
  preco: z.number().nullable().optional(),
  infraestrutura: z.array(z.string()).optional().default([]),
  vista: z.string().optional().default(""),
  posicao_solar: z.string().optional().default(""),
  condicao: z.string().optional().default(""),
  observacoes: z.string().optional().default(""),
});

export const gerarDescricaoImovel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const ficha = [
      data.titulo && `Título: ${data.titulo}`,
      data.tipo && `Tipo: ${data.tipo}`,
      (data.cidade || data.bairro) && `Localização: ${[data.bairro, data.cidade].filter(Boolean).join(" - ")}`,
      data.dormitorios != null && `Dormitórios: ${data.dormitorios}`,
      data.banheiros != null && `Banheiros: ${data.banheiros}`,
      data.vagas != null && `Vagas: ${data.vagas}`,
      data.area_privativa && `Área privativa: ${data.area_privativa} m²`,
      data.area_total && `Área total: ${data.area_total} m²`,
      data.preco && `Preço: R$ ${data.preco.toLocaleString("pt-BR")}`,
      data.vista && `Vista: ${data.vista}`,
      data.posicao_solar && `Posição solar: ${data.posicao_solar}`,
      data.condicao && `Condição: ${data.condicao}`,
      data.infraestrutura.length > 0 && `Infraestrutura: ${data.infraestrutura.join(", ")}`,
      data.observacoes && `Observações: ${data.observacoes}`,
    ].filter(Boolean).join("\n");

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system:
          "Você é um redator imobiliário profissional brasileiro. Escreva descrições de imóveis envolventes, claras, em português do Brasil, com 2 a 4 parágrafos curtos. Destaque diferenciais, localização, lazer e oportunidade. Não invente atributos não fornecidos. Não use markdown.",
        prompt: `Gere uma descrição comercial para o seguinte imóvel:\n\n${ficha}`,
      });
      return { description: text };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
      if (msg.includes("402")) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
      throw new Error("Falha ao gerar descrição: " + msg);
    }
  });
