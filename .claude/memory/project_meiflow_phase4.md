---
name: project-meiflow-phase4
description: MEIFlow Phase 4 monetization — plan store, gate hook, upgrade modal, watermarks, settings plan section
metadata:
  type: project
---

Phase 4 (monetização) foi implementada com os seguintes arquivos:

- `src/store/plan.ts` — Zustand persist store: `Plan` ('free'|'pro'), `FREE_LIMITS` const, `usePlanStore`
- `src/hooks/usePlanGate.ts` — Hook `usePlanGate()` que retorna `{ check(resource, templateIndex?) }` verificando limites antes de criar registros
- `src/components/UpgradeModal.tsx` — Modal contextual com tabela free vs pro + botão "Assinar Pro" que redireciona para `/settings#upgrade`

**Integração nos pontos de criação:**
- `ClientsPage` — `handleNew` checa `gate.check('client')` antes de abrir modal
- `ProjectsPage` — `handleNew` checa `gate.check('project')` antes de abrir modal
- `ContractModal` — template picker bloqueia templates de índice >= FREE_LIMITS.contractTemplates no free plan (ícone Lock + badge "Pro")

**Marcas d'água:**
- `LinkPagePublic` — footer "Criado com MEIFlow ✦" aparece só no plano free; pro = rodapé vazio
- `ContractViewer` — `WATERMARK_PRINT_STYLES` (`#contract-print::after` diagonal) adicionado ao `<style>` apenas no free plan ao imprimir

**SettingsPage** (atualizada):
- Seção Plano (`id="upgrade"`) com `UsageBar` para cada limite, botão "Ativar Pro" que chama `setPlan('pro')` (simulação para MVP)
- `useEffect` ao montar: se `window.location.hash === '#upgrade'`, scrollIntoView + replace history
- Seções de Dados e Sobre agora sempre visíveis (antes estavam atrás do easter egg devMode)
- Easter egg devMode removido da SettingsPage; ProfileSection simplificada (sem onDevMode)

**Why:** Fase 4 da especificação do produto MEIFlow — monetização local-first sem backend.
**How to apply:** Stack: React 18 + TypeScript strict + Zustand + TanStack Query + Dexie. Projeto em `meiflow-setup/meiflow/src/`.
