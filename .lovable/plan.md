## Objetivo

1. Remover a entrada própria "Exportações" do sidebar e mesclar tudo dentro do menu **Imóveis** (a Central de Imóveis já é a tela de seleção; a lista de exportação vira uma sub-rota desse mesmo menu).
2. Permitir que o **super admin**, no cadastro/edição do imóvel, defina se aquele imóvel **pode ou não ser exportado pelos clientes**.
3. Adicionar no cadastro de **Planos** uma opção que define se o plano **permite exportar imóveis**. Planos sem essa permissão escondem/bloqueiam as ações de exportação no app.

## Mudanças no banco

Migração única:

- `imoveis.exportacao_liberada boolean NOT NULL DEFAULT true`
  - Controlado apenas por super_admin / secretaria via formulário do imóvel.
- `planos.permite_exportacao boolean NOT NULL DEFAULT true`
  - Editável na tela de Planos.
- Atualizar a policy/insert de `exportacao_itens` para impedir adicionar um `imovel_id` cuja `exportacao_liberada = false` (via trigger BEFORE INSERT que faz RAISE quando o imóvel está bloqueado — não bloqueia super_admin).

## Frontend

### Sidebar (`src/components/layout/AppSidebar.tsx`)
- Remover o item "Exportações" do nível raiz.
- O grupo **Imóveis** passa a ter os subitens: Central, Minha exportação (nova rota dentro de imóveis), Favoritos (se aplicável). A rota antiga `/exportacoes` é redirecionada para a nova.

### Rota
- Criar `src/routes/_authenticated/imoveis.exportacao.tsx` reaproveitando o conteúdo atual de `exportacoes.tsx`.
- Deletar `src/routes/_authenticated/exportacoes.tsx` (ou deixar só um redirect para a nova URL).
- Ajustar todos `Link to="/exportacoes"` para `/imoveis/exportacao` (Central, Topbar, etc.).

### Cadastro de Imóvel (`src/components/imoveis/ImovelForm.tsx`)
- Novo Switch **"Liberar exportação para clientes"** dentro do bloco de publicação/XML.
- Visível e editável **apenas** para `super_admin` / `secretaria` (usar `RoleGate` ou `useRoles`). Demais perfis veem somente leitura ou nada.
- Persistir `exportacao_liberada` no insert/update.

### Hook de exportação (`src/hooks/use-exportacao.ts`)
- Antes de `add`, validar localmente:
  - Plano do usuário precisa ter `permite_exportacao = true` (usar `useAssinatura`/`get_minha_assinatura` ou um novo hook `usePodeExportar`).
  - Imóvel precisa ter `exportacao_liberada = true`.
- Caso negado, mostrar toast amigável ("Seu plano não permite exportação" / "Este imóvel não está liberado para exportação") e não chamar o backend.

### UI da Central (`src/routes/_authenticated/central.tsx`) e cards de imóvel
- Esconder os botões de "Adicionar à exportação" quando o plano não permitir.
- Desabilitar o botão quando o imóvel tiver `exportacao_liberada = false`, com tooltip.

### Planos (`src/routes/_authenticated/planos.tsx` e telas de edição)
- Adicionar Switch **"Permite exportar imóveis"** no formulário do plano.
- Mostrar a flag na listagem.

### Gate de plano (novo hook `usePodeExportar`)
- Consulta o plano ativo do usuário (`get_minha_assinatura` já retorna `plano_id`) e busca `planos.permite_exportacao`.
- Cacheia em memória; usado por hook/UI.

## Itens fora de escopo
- Geração de PDF/ZIP (continua como já está).
- Mudanças na identidade visual.
- Permissões de outros perfis (apenas super_admin/secretaria editam a flag por imóvel).
