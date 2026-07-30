# WorkDays - Contexte Projet

## Description
WorkDays est une application web RH pour la Maison Médicale de Forest ASBL (Belgique).
Convertie depuis un prototype MS Access vers une app web moderne.

## Stack technique
- **Frontend** : Next.js 14 (App Router) + Tailwind CSS
- **Backend/DB** : Supabase (PostgreSQL hébergé)
- **Déploiement** : Vercel (auto-deploy depuis GitHub)
- **Langue UI** : Français (contexte RH belge francophone)

## Supabase
- URL : https://jqfaclixnraugzmcrylp.supabase.co
- 26 tables déployées, RLS désactivé temporairement
- Données réelles : 33 employés, 20 secteurs, 11 codes absence, horaires, barèmes

## Modules implémentés
- Dashboard (KPIs placeholder)
- Personnel : liste, ajout (/employees/new), détail avec onglets (/employees/[id]), suppression
- Absences : liste filtrée par année/type/nom, groupée par mois, codes couleur
- Horaires : tableau des timesheets actifs avec heures/jour et % temps plein
- Pages placeholder : Rémunération, Actifs, Gouvernance, Rapports, Paramètres

## Modules à développer (par priorité)
1. Édition employé (/employees/[id]/edit)
2. Absences : calendrier interactif, réservation (wizard), soldes de congés
3. Rémunération : salaire indexé = barème × Π(indexations) + augmentations personnelles
4. RTT : calcul basé sur âge, prorata anniversaire, ajusté au % temps de travail
5. Auth Supabase (login, rôles : ADMIN, HR_MANAGER, SECTOR_MANAGER, EMPLOYEE)
6. Gouvernance : CRUD réunions/décisions/demandes
7. Rapports PDF
8. Dashboard dynamique

## Règles métier belges
- Comité paritaire 330.01.54 (secteur soins de santé)
- RTT basé sur l'âge (pas l'ancienneté), proraté par date d'anniversaire
- Salaire = barème(secteur, ancienneté) × produit(indexations org) × produit(indexations secteur) + somme(augmentations personnelles)
- Congés par ancienneté : ≤1an=1sem, 1-7=2sem, 7-14=3sem, 14-24=4sem, 25+=5sem (configurable via vacation_policies)
- Ancienneté effective = granted_seniority_date ?? date_of_hire
- Temps en minutes (pas en dates Access style 1899-12-30)

## Conventions de code
- Code en anglais, UI en français
- Composants "use client" pour les pages interactives
- Supabase client via @/lib/supabase/client (browser) et @/lib/supabase/server (server)
- Tailwind pour tout le styling (pas de CSS modules)
