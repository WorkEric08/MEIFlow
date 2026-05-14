# MEIFlow

Plataforma completa para freelancers e MEIs brasileiros — Link Page, dashboard financeiro e gerador de contratos.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Build | Vite 5 |
| Framework | React 18 + TypeScript (strict) |
| Estilo | Tailwind CSS + design tokens MEIFlow |
| Estado | Zustand |
| Servidor | TanStack Query |
| Persistência | Dexie (IndexedDB) |
| Roteamento | React Router DOM v6 |
| PWA | vite-plugin-pwa (Workbox) |
| Nativo | Capacitor 6 |
| Formulários | React Hook Form + Zod |
| Testes | Vitest + Playwright |
| CI | GitHub Actions |

---

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em desenvolvimento
npm run dev

# 3. Build de produção
npm run build
```

---

## Scripts disponíveis

```bash
npm run dev          # Servidor de desenvolvimento (http://localhost:5173)
npm run build        # Build de produção (gera /dist)
npm run preview      # Prévia do build de produção
npm run lint         # ESLint em todo o projeto
npm run typecheck    # TypeScript sem emitir arquivos
npm run format       # Prettier em src/**
npm run test         # Vitest em modo watch
npm run test:e2e     # Playwright (requer servidor rodando)
npm run cap:sync     # Sincroniza /dist com o Capacitor
npm run cap:open:android  # Abre no Android Studio
```

---

## Gerar APK (Android)

```bash
# 1. Build de produção
npm run build

# 2. Adicionar plataforma Android (apenas na primeira vez)
npm run cap:add:android

# 3. Sincronizar assets
npm run cap:sync

# 4. Abrir no Android Studio
npm run cap:open:android

# No Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## Estrutura de pastas

```
src/
  features/         # lógica por feature (components, hooks, types, store, service)
  components/       # componentes compartilhados
    ui/             # primitivos shadcn/ui
  hooks/            # hooks compartilhados
  services/
    db.ts           # Dexie schema centralizado
    native/         # adapters Capacitor ↔ Web API
  store/            # stores Zustand globais
  pages/            # uma página por rota
  lib/              # utils puras
  styles/           # globals.css + design tokens
tests/
  e2e/              # Playwright
```

---

## Design system

- Modo escuro/claro com toggle persistido
- Cores definidas como CSS variables em `src/styles/globals.css`
- Tokens no `tailwind.config.ts`
- Elemento blueprint: grid sutil + cantos técnicos nos cards

---

## Checklist de MVP pronto

- [ ] Vite + React + TypeScript + Tailwind configurados
- [ ] ESLint + Prettier + `strict: true`
- [ ] PWA instalável + offline verificado
- [ ] Capacitor configurado
- [ ] Build Android gerado e testado
- [ ] IndexedDB via Dexie operando
- [ ] Layout responsivo: bottom nav mobile / sidebar desktop
- [ ] Todas as rotas do MVP implementadas
- [ ] Vitest + Playwright no CI sem falhas
- [ ] Lighthouse ≥ 90 em todas as categorias
- [ ] Testado em 320 / 768 / 1024 / 1440 px
