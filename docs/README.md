# WorkDays - Documentation Structure

## Overview

Documentation is organized by purpose and audience:

```
.kiro/steering/     - Permanent decisions and conventions (always applies)
.kiro/specs/        - What to build: business rules, features, phases
docs/               - Reference documentation
docs/reference/     - Historical and detailed reference material
extracted/          - Raw Access prototype exports (untouched)
```

---

## `.kiro/steering/` - Design Principles & Conventions

Files that define **how we work**. These are authoritative and always apply.

| File | Content |
|------|---------|
| `project-context.md` | What WorkDays is, who it serves, current state |
| `architecture.md` | Tech stack decisions, folder structure, deployment architecture |
| `coding-conventions.md` | Code style, naming, patterns, language rules |

---

## `.kiro/specs/` - Specifications & Business Rules

Files that define **what to build**. Detailed and actionable.

| File | Content |
|------|---------|
| `business-rules.md` | Belgian HR rules: RTT, salary, vacation, seniority, absences |
| `feature-specifications.md` | UX requirements, information architecture, feature designs |
| `implementation-phases.md` | Phased roadmap with priorities and progress tracking |

---

## `docs/` - Reference Documentation

| File | Content |
|------|---------|
| `database-schema.md` | PostgreSQL schema design for the new system |
| `deployment.md` | Step-by-step deployment guide (GitHub, Supabase, Vercel) |

---

## `docs/reference/` - Historical & Detailed Reference

Complete original documents preserved for full context. Consult when you need details beyond what steering/specs provide.

| File | Content |
|------|---------|
| `access-analysis.md` | Critical analysis of the Access prototype + full web redesign document |
| `access-database-documentation.md` | Original Access database schema (33 tables, 32 queries) |
| `architecture-full.md` | Full architecture document with all sections |

---

## `extracted/` - Raw Access Exports

Raw data extracted from the Access prototype. Not edited or reorganized.

- VBA modules
- SQL queries
- Form definitions
- Report definitions
- Macro definitions

These serve as the ground truth for what the Access prototype did.

---

## When to Consult What

| I need to... | Look at |
|--------------|---------|
| Understand the tech stack | `.kiro/steering/architecture.md` |
| Know coding patterns | `.kiro/steering/coding-conventions.md` |
| Understand a business rule | `.kiro/specs/business-rules.md` |
| Design a new feature | `.kiro/specs/feature-specifications.md` |
| Check implementation priority | `.kiro/specs/implementation-phases.md` |
| See the DB schema | `docs/database-schema.md` |
| Deploy the app | `docs/deployment.md` |
| Understand why we made a decision | `docs/reference/access-analysis.md` |
| See the original Access tables | `docs/reference/access-database-documentation.md` |
| See raw Access VBA/queries | `extracted/` |
