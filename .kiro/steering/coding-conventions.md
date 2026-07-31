# WorkDays - Coding Conventions

## Language

- **Code**: English (variable names, function names, comments, file names)
- **UI**: French (all user-facing text, labels, messages, navigation)
- **Database**: English (table names, column names in snake_case)

## TypeScript & React

- Use TypeScript strict mode
- Prefer `"use client"` directive only for pages/components that need interactivity
- Server components by default (Next.js 14 App Router)
- Use `async` server components for data fetching where possible

## Styling

- **Tailwind CSS only** - no CSS modules, no styled-components, no inline style objects
- Use Tailwind utility classes directly on elements
- Extract repeated patterns into reusable components, not custom CSS

## Supabase Client Usage

```typescript
// Browser (client components)
import { createClient } from '@/lib/supabase/client'

// Server (server components, API routes, server actions)
import { createClient } from '@/lib/supabase/server'
```

- Never expose the service role key in client code
- Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client

## Component Patterns

- One component per file
- File name matches the default export (PascalCase for components)
- Colocate related files: page + components + types in the same route folder
- Use the `(group)` pattern in App Router for layout grouping

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | `EmployeeList.tsx` |
| Utilities | camelCase | `calculateRtt.ts` |
| Routes/Pages | kebab-case folders | `src/app/(app)/employees/[id]/page.tsx` |
| DB tables | snake_case | `vacation_policies` |
| DB columns | snake_case | `date_of_hire` |
| TypeScript types | PascalCase | `Employee`, `AbsenceCode` |
| Constants | SCREAMING_SNAKE | `MAX_VACATION_WEEKS` |

## Data Handling

- Time stored as INTEGER (minutes), not Access-style dates
- Use `??` (nullish coalescing) instead of Access `Nz()` pattern
- Validate inputs with Zod schemas at API boundaries
- Handle null checks via TypeScript strict null checks

## Error Handling

- Wrap Supabase calls in try/catch or check `.error` property
- Display user-friendly error messages in French
- Log technical details server-side

## Git Conventions

- Commit messages: `type: description` (feat, fix, chore, docs, refactor)
- Branch naming: `feature/description`, `fix/description`, `docs/description`
- Keep commits focused and atomic

## Workflow de traçabilité

À chaque PR livrée, mettre à jour `src/data/project-health.json` :
- Mettre à jour le statut des features impactées (missing → partial → implemented)
- Ajouter les notes de ce qui a été fait
- Mettre à jour les gaps si un gap est résolu ou réduit
- Mettre à jour `lastUpdated`
