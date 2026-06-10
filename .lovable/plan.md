## Objetivo

Criar um fluxo de importação em massa via **CSV ou Excel (.xlsx)** para:
- **Empreendimentos**, **Condomínios**, **Edifícios** → importação direta com cabeçalhos padronizados.
- **Imóveis** → importação completa com **mapeamento visual de colunas** (drag & match entre as colunas do arquivo enviado e os campos do sistema), por causa da grande quantidade de campos (80+).

Disponível somente para **Super Admin** e **Secretaria** (mesmas permissões de criação dessas tabelas).

---

## UX e Fluxo

### Menu
Nova entrada na sidebar: **Importações** (ícone Upload), agrupando 4 sub-páginas:
- `/importacoes/empreendimentos`
- `/importacoes/condominios`
- `/importacoes/edificios`
- `/importacoes/imoveis`

### Fluxo simples (Empreendimentos / Condomínios / Edifícios)
1. Botão "Baixar modelo CSV" e "Baixar modelo Excel" — gera arquivo com cabeçalhos exatos das colunas.
2. Upload do arquivo (drag & drop, aceita `.csv`, `.xlsx`, `.xls`).
3. **Preview** das 10 primeiras linhas em tabela.
4. Validação (campos obrigatórios, formatos de data, números).
5. Botão **Importar** → insere em lote, mostra contador "X importados / Y falhas" e lista de erros por linha.

### Fluxo com mapeamento (Imóveis)
1. Upload do arquivo.
2. Sistema lê os cabeçalhos e mostra tela de **mapeamento de colunas**:
   - Coluna esquerda: campos do sistema (agrupados por seção: Identificação, Localização, Valores, Características, etc.), marcando obrigatórios.
   - Coluna direita: select para cada campo do sistema escolhendo qual coluna do arquivo corresponde (ou "ignorar").
   - **Auto-match inteligente**: se o nome da coluna do arquivo bater (case-insensitive, normalizado sem acento) com o nome técnico ou rótulo do campo, já preenche.
   - Botão "Salvar mapeamento como preset" (futuro — ficará só placeholder UI nesta fase).
3. Preview com as 10 primeiras linhas já mapeadas no formato final.
4. Validação por linha (tipos, FKs como `empreendimento_id` resolvidos por código_interno/nome).
5. Importar em lote, com relatório de erros por linha (linha, campo, motivo).

---

## Implementação Técnica

### Frontend
- Biblioteca: **`xlsx`** (SheetJS, já leve e funciona client-side para CSV+XLSX).
- Novos componentes:
  - `src/components/import/FileDropzone.tsx` — drag & drop + parse.
  - `src/components/import/PreviewTable.tsx` — preview com 10 linhas.
  - `src/components/import/ColumnMapper.tsx` — usado só para imóveis.
  - `src/components/import/ImportReport.tsx` — resultado com sucessos/erros.
- Novas rotas em `src/routes/_authenticated/importacoes.*.tsx`.
- `src/lib/import-schemas.ts` — define para cada entidade: lista de campos, label, tipo (text/number/date/boolean/array), obrigatório, parser de valor.
- AppSidebar atualizado com o grupo "Importações".

### Backend
- Insert direto via supabase client (já há RLS de admin/secretaria nas tabelas).
- Para imóveis, resolver FKs antes do insert:
  - `empreendimento_id`/`condominio_id`/`edificio_id`: aceitar nome OU código_interno; lookup no banco.
  - `imobiliaria_id`/`corretor_id`: aceitar nome.
- Inserts em lotes de 50 linhas para evitar payload gigante; cada lote em try/catch isolado para reportar erros por linha.
- Campos `text[]` (infraestrutura, condicoes_pagamento, etc.): aceitar string separada por `;` ou `|`.
- Booleanos: aceitar `sim/não`, `true/false`, `1/0`.
- Datas: aceitar `dd/mm/yyyy` e ISO.

### Modelos (templates de download)
Gerados em runtime via SheetJS — não precisa subir arquivo estático. Cada página tem botão que monta e baixa o template com cabeçalhos + uma linha de exemplo.

### Permissões
- Adicionar rota em `src/lib/permissions.ts`: importações só para `super_admin` e `secretaria`. Outros roles veem "Acesso negado".

---

## Entregáveis (arquivos)

**Criar:**
- `src/routes/_authenticated/importacoes.tsx` (layout com Outlet + tabs)
- `src/routes/_authenticated/importacoes.empreendimentos.tsx`
- `src/routes/_authenticated/importacoes.condominios.tsx`
- `src/routes/_authenticated/importacoes.edificios.tsx`
- `src/routes/_authenticated/importacoes.imoveis.tsx`
- `src/components/import/FileDropzone.tsx`
- `src/components/import/PreviewTable.tsx`
- `src/components/import/ColumnMapper.tsx`
- `src/components/import/ImportReport.tsx`
- `src/lib/import-schemas.ts`
- `src/lib/import-runner.ts` (lógica de parse, normalização e insert em lote)

**Editar:**
- `src/components/layout/AppSidebar.tsx` (novo item "Importações")
- `src/lib/permissions.ts` (rotas novas)

**Dependência nova:**
- `xlsx` (SheetJS) via `bun add xlsx`

---

## Fora do escopo desta fase
- Upload de fotos via importação (continua manual no cadastro do imóvel).
- Salvar presets de mapeamento por usuário (só placeholder UI).
- Importação de unidades em massa dentro de um empreendimento específico (pode vir em fase 2).
- Update/upsert por código_interno — nesta fase só **insert**. Se o código já existir, a linha entra como erro "código duplicado".

Posso seguir com a implementação?
