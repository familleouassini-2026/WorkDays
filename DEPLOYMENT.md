# WorkDays - Guide de Déploiement

## Résumé

| Service | Rôle | Coût |
|---------|------|------|
| **GitHub** | Stocke le code source | Gratuit |
| **Supabase** | Base de données PostgreSQL + Auth | Gratuit (tier Free) |
| **Vercel** | Héberge l'application web | Gratuit (tier Hobby) |

---

## Étape 1 : Push le code vers GitHub

### Option A : GitHub Desktop (recommandé)
1. Télécharge et installe https://desktop.github.com/
2. Connecte-toi avec ton compte `familleouassini-2026`
3. File → Add Local Repository → choisis `f:\Bouchra version\WorkDays\workdays`
4. Clique "Publish repository" ou "Push origin"

### Option B : Token en ligne de commande
1. Va sur https://github.com/settings/tokens
2. "Generate new token (classic)" → coche `repo` → Generate
3. Copie le token
4. Dans PowerShell :
```powershell
git -C "f:\Bouchra version\WorkDays\workdays" push -u origin main
```
5. Username: `familleouassini-2026`
6. Password: **colle ton token** (pas ton mot de passe GitHub)

---

## Étape 2 : Créer les tables dans Supabase

1. Va sur https://supabase.com/dashboard
2. Ouvre ton projet **workdays**
3. Clique sur **SQL Editor** (icône dans la barre de gauche)
4. Clique **"New query"**
5. Copie-colle TOUT le contenu du fichier `supabase/schema.sql`
6. Clique **"Run"** (ou Ctrl+Enter)
7. Tu devrais voir "Success. No rows returned" — c'est normal

### Vérification :
- Va dans **Table Editor** (barre de gauche)
- Tu devrais voir ~26 tables créées
- La table `absence_codes` devrait contenir 11 lignes
- La table `holidays` devrait contenir 20 jours fériés belges

---

## Étape 3 : Déployer sur Vercel

1. Va sur https://vercel.com/
2. Connecte-toi avec ton compte GitHub
3. Clique **"Add New..." → "Project"**
4. Sélectionne le repo `familleouassini-2026/WorkDays`
5. Vercel détecte automatiquement Next.js
6. **IMPORTANT** — Avant de cliquer Deploy, ajoute les variables d'environnement :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jqfaclixnraugzmcrylp.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZmFjbGl4bnJhdWd6bWNyeWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjE4NjUsImV4cCI6MjEwMDkzNzg2NX0.V0FVSYmeGE5URZN2tPfKvF6A7wWiX-NCu3BdDzAAW9Y` |

7. Clique **"Deploy"**
8. Attends 1-2 minutes → ton app est en ligne !

---

## Étape 4 : Tester

1. Vercel te donne une URL (ex: `workdays-xxxxx.vercel.app`)
2. Ouvre cette URL → tu devrais voir le dashboard WorkDays
3. Va dans `/employees` → la liste est vide (normal, pas encore de données)

---

## Ajouter des employés de test

Dans Supabase → SQL Editor → New Query :

```sql
INSERT INTO employees (first_name, last_name, title, job_title, contract_type, date_of_hire, sector_id, location_id, email, mobile_phone) VALUES
('Fareda', 'BOULAICH', 'Mme', 'Accueillante', 'CDI', '2013-09-07', 1, 3, 'faredab@mmforest.be', '0476763338'),
('Chaimae', 'BOUZRATI', 'Mme', NULL, 'CDI', '2009-09-20', 1, 1, NULL, '0488046213'),
('Deborah', 'CZAPNIK', 'Mme', 'Kinésithérapeute', 'CDI', '2003-01-01', 5, 1, 'deborahc@mmforest.be', '0477880008'),
('Fabienne', 'DUPLAT', 'Mme', NULL, 'CDI', '2002-03-01', 5, 1, NULL, NULL),
('Alphonse', 'SIBOMANA', 'M', NULL, 'CDI', '2002-11-01', 4, 1, NULL, NULL);
```

---

## Architecture finale

```
GitHub (code) ──push──→ Vercel (hébergement)
                              │
                              │ API calls
                              ▼
                         Supabase (DB + Auth)
```

Chaque `git push` vers GitHub déclenche automatiquement un redéploiement sur Vercel.

---

## Prochaines étapes de développement

1. ✅ Structure de base + dashboard
2. → Page employés fonctionnelle avec données réelles
3. → Module absences avec calendrier
4. → Module salaires avec calculs
5. → Authentification (Supabase Auth)
6. → Rapports PDF
