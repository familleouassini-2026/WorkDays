# Guide Complet des Fonctions WorkDays

> **Usage** : Ce document sert de script pour la generation de videos tutorielles avec voiceover.
> Chaque section correspond a une fonction de l'application et contient le script de narration,
> les etapes visuelles detaillees, et les informations de production video.

---

## Table des matieres

1. [Encoder une absence (Gestionnaire)](#1-encoder-une-absence-gestionnaire)
2. [Encoder une absence (Employe via Self-service)](#2-encoder-une-absence-employe-via-self-service)
3. [Consulter le calendrier annuel (Gestionnaire)](#3-consulter-le-calendrier-annuel-gestionnaire)
4. [Voir les soldes conges (Gestionnaire)](#4-voir-les-soldes-conges-gestionnaire)
5. [Approuver ou refuser une demande de conge (Gestionnaire)](#5-approuver-ou-refuser-une-demande-de-conge-gestionnaire)
6. [Creer un employe (Gestionnaire)](#6-creer-un-employe-gestionnaire)
7. [Modifier une fiche employe (Gestionnaire)](#7-modifier-une-fiche-employe-gestionnaire)
8. [Configurer l organigramme (Gestionnaire)](#8-configurer-lorganigramme-gestionnaire)
9. [Consulter et comprendre le salaire (Gestionnaire)](#9-consulter-et-comprendre-le-salaire-gestionnaire)
10. [Simulateur salaire (Gestionnaire)](#10-simulateur-salaire-gestionnaire)
11. [Alertes augmentation (Gestionnaire)](#11-alertes-augmentation-gestionnaire)
12. [Creer un rapport dynamique (Gestionnaire)](#12-creer-un-rapport-dynamique-gestionnaire)
13. [Executer un rapport sauvegarde (Gestionnaire)](#13-executer-un-rapport-sauvegarde-gestionnaire)
14. [Importer des donnees en masse (Gestionnaire)](#14-importer-des-donnees-en-masse-gestionnaire)
15. [Ajouter et gerer un candidat - Recrutement (Gestionnaire)](#15-ajouter-et-gerer-un-candidat---recrutement-gestionnaire)
16. [Gerer les documents employe (Gestionnaire)](#16-gerer-les-documents-employe-gestionnaire)
17. [Notifications (Gestionnaire et Employe)](#17-notifications-gestionnaire-et-employe)
18. [Parametres - Organisation et logo (Gestionnaire)](#18-parametres---organisation-et-logo-gestionnaire)
19. [Installer l application sur mobile (Employe)](#19-installer-lapplication-sur-mobile-employe)

---

## 1. ENCODER UNE ABSENCE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour encoder une absence pour un employe, cliquez sur le bouton vert Encoder en bas a droite de votre ecran. Le panneau d encodage rapide s ouvre a droite. Dans la barre de recherche, tapez les premieres lettres du nom de l employe, par exemple "BIO" pour Bioucas Lidia. Selectionnez l employe dans la liste deroulante. Le calendrier du mois en cours s affiche avec les absences deja encodees en couleur. En dessous du calendrier, vous voyez la section Ajouter. Cliquez sur le champ Date debut et selectionnez le premier jour d absence. Si l absence dure plusieurs jours, remplissez aussi le champ Date fin. Sinon, laissez-le vide pour un seul jour. Dans le menu deroulant Type d absence, choisissez le code approprie : CA pour Conges annuels, MA pour Maladie, RTT pour Reduction temps de travail, etc. Des que vous selectionnez un code, le systeme affiche le solde disponible pour cet employe. Par exemple, Solde: 11h08 utilise sur 152h00 au total. Cela vous permet de verifier immediatement si l employe a encore du droit. Pour les codes en heures comme RTT, le champ Minutes apparait. Entrez le nombre de minutes. Si vous laissez vide, le systeme prend automatiquement l horaire journalier de l employe (journee complete = 8h00 par jour selon son horaire). Pour les codes en jours comme CA, le champ Jours apparait avec la valeur 1 par defaut. Le systeme exclut automatiquement les weekends et jours feries de la periode selectionnee. Si votre periode du 3 au 7 aout inclut un samedi et un dimanche, seuls les jours ouvres seront encodes. Cliquez sur Enregistrer. Les absences apparaissent immediatement dans le calendrier. Un message de confirmation s affiche si necessaire.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | N IMPORTE QUELLE PAGE | Le bouton vert "Encoder" est visible en bas a droite. Cliquer dessus. | Bouton flottant vert avec icone "+" et texte "Encoder" |
| 2 | DRAWER DROIT - Header vert "Encodeur rapide" | Le panneau s ouvre depuis la droite avec un champ de recherche en haut | Header vert "Encodeur rapide", champ texte "Rechercher un employe..." |
| 3 | DRAWER - Recherche | Taper "BIO" dans le champ de recherche | La liste filtree apparait : "BIOUCAS Lidia" |
| 4 | DRAWER - Selection | Cliquer sur "BIOUCAS Lidia" | Le nom s affiche dans le champ, le calendrier du mois se charge en dessous |
| 5 | DRAWER - Calendrier | Observer le calendrier mensuel | Le calendrier affiche le mois en cours. Les jours avec absence sont colores (vert = CA, rouge = MA, bleu = RTT). Les jours feries sont marques. |
| 6 | DRAWER - Section Ajouter | Observer les champs sous le calendrier | Champs "Du" (date debut) et "Au" (date fin optionnelle), menu deroulant "Type", champ duree |
| 7 | DRAWER - Date debut | Cliquer le champ "Du" et selectionner la date | Date picker s ouvre. Selectionner ex: 2026-08-03. Le champ affiche "03/08/2026" |
| 8 | DRAWER - Date fin | Si plusieurs jours : cliquer le champ "Au" et selectionner la date de fin. Si un seul jour : laisser vide. | Date picker s ouvre. Selectionner ex: 2026-08-07. Le champ affiche "07/08/2026" |
| 9 | DRAWER - Code absence | Cliquer le menu deroulant "Type d absence" et selectionner le code | Liste deroulante avec les codes : CA, RTT, MA, JP, PC, HS, etc. Chaque code a un libelle complet |
| 10 | DRAWER - Solde | Observer l affichage du solde apres selection du code | "Solde: 11h08 / 152h00" (heures utilisees sur total droit). Si le solde est depasse, un warning orange s affiche |
| 11 | DRAWER - Duree | Remplir le champ de duree si necessaire | Si code en heures (RTT, HS) : champ "Minutes" apparait. Vide = journee complete selon horaire. Si code en jours (CA, MA) : champ "Jours" avec valeur 1 par defaut |
| 12 | DRAWER - Bouton | Cliquer "Enregistrer" (bouton vert) | Bouton vert "Enregistrer" en bas du formulaire |
| 13 | DRAWER - Resultat | Observer la mise a jour du calendrier | Les nouvelles absences apparaissent dans le calendrier au-dessus. Les jours colores correspondent aux absences creees. Message de confirmation. |

### Sous-titres resumes (affichage video)

1. "Cliquez sur le bouton vert Encoder"
2. "Recherchez l employe par nom"
3. "Selectionnez les dates d absence"
4. "Choisissez le type d absence"
5. "Verifiez le solde disponible"
6. "Enregistrez l absence"

### Informations de production

- **Duree estimee de la video** : 90 secondes
- **Pages/URLs concernees** : Toute page (bouton flottant), `/absences`
- **Prerequis** : Employes crees, codes absence configures, secteurs crees

---

## 2. ENCODER UNE ABSENCE (Employe via Self-service)

**Role concerne** : Employe

### Script voiceover

> En tant qu employe, ouvrez la page Self-service dans le menu a gauche. Votre profil est automatiquement selectionne. Vous voyez votre dashboard personnel avec vos soldes de conges, votre horaire, et vos absences recentes. Pour demander un conge, cliquez sur le bouton Demander un conge. L encodeur s ouvre avec votre nom deja pre-rempli. Vous n avez pas besoin de vous chercher dans la liste. Selectionnez directement vos dates et le type d absence souhaite. Le solde vous indique combien il vous reste. Cliquez Enregistrer. Votre absence est encodee.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Self-service" dans le menu lateral gauche | Icone Self-service avec libelle dans la navigation |
| 2 | PAGE SELF-SERVICE | Observer le dashboard personnel | Soldes conges (ex: CA 120h/152h), RTT restant, horaire hebdomadaire, dernieres absences, information salaire |
| 3 | PAGE SELF-SERVICE | Cliquer le bouton "Demander un conge" | Bouton visible sur le dashboard, generalement en haut a droite ou dans la section conges |
| 4 | DRAWER | L encodeur rapide s ouvre avec votre nom PRE-REMPLI | Votre nom apparait deja dans le champ employe (pas besoin de chercher). Le calendrier du mois se charge. |
| 5 | DRAWER - Date debut | Cliquer le champ "Du" et selectionner la date de debut | Date picker s ouvre. Selectionner la date souhaitee. |
| 6 | DRAWER - Date fin | Si plusieurs jours : cliquer le champ "Au" et selectionner la date de fin | Date picker s ouvre. Selectionner la date de fin. |
| 7 | DRAWER - Code absence | Cliquer le menu deroulant "Type d absence" et selectionner le code | Liste deroulante : CA, RTT, MA, etc. |
| 8 | DRAWER - Solde | Observer le solde affiche | "Solde: XX / YY" indique votre consommation |
| 9 | DRAWER - Duree | Remplir le champ de duree si necessaire | Champ Minutes ou Jours selon le type de code |
| 10 | DRAWER - Bouton | Cliquer "Enregistrer" (bouton vert) | Bouton vert "Enregistrer" |
| 11 | DRAWER - Resultat | Observer la confirmation | Absence encodee, calendrier mis a jour, notification envoyee au manager |

### Sous-titres resumes (affichage video)

1. "Ouvrez le Self-service"
2. "Cliquez Demander un conge"
3. "Vos infos sont pre-remplies"
4. "Choisissez dates et type"
5. "Enregistrez votre demande"

### Informations de production

- **Duree estimee de la video** : 45 secondes
- **Pages/URLs concernees** : `/self-service`
- **Prerequis** : Compte employe actif, acces Self-service configure

---

## 3. CONSULTER LE CALENDRIER ANNUEL (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour voir toutes les absences d un employe sur l annee complete, allez dans Absences et Conges dans le menu, puis cliquez sur l onglet Calendrier annuel. Selectionnez le secteur si vous voulez filtrer, puis l employe dans le menu deroulant. Choisissez l annee. Le calendrier 12 mois s affiche avec toutes les absences codees par couleur. Chaque jour colore correspond a une absence. Vous pouvez cliquer sur un jour pour encoder directement via l encodeur rapide. En bas, un recapitulatif montre le total par code d absence : nombre de jours/heures pris vs droits. Pour imprimer, cliquez Imprimer le calendrier. Le document s ouvre en format A4 avec le logo de l organisation, les 12 mois, et le recapitulatif.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Absences & Conges" dans le menu | Icone calendrier avec libelle dans la navigation |
| 2 | PAGE ABSENCES | Cliquer l onglet "Calendrier annuel" | Onglets visibles : Encodage, Calendrier annuel, Soldes, Approbations |
| 3 | PAGE CALENDRIER ANNUEL | Observer les trois filtres en haut | Filtre Secteur (dropdown), Filtre Employe (dropdown), Filtre Annee (dropdown) |
| 4 | PAGE CALENDRIER ANNUEL - Secteur | Selectionner un secteur (optionnel) | La liste des employes se filtre selon le secteur choisi |
| 5 | PAGE CALENDRIER ANNUEL - Employe | Selectionner un employe dans le dropdown | Le calendrier 12 mois se charge pour cet employe |
| 6 | GRILLE 12 MOIS | Observer la grille calendaire | Chaque mois est une grille. Les jours colores = absences (vert CA, rouge MA, bleu RTT). Weekends grises. Feries en rouge. Legende en bas. |
| 7 | CLIC SUR UN JOUR | Cliquer un jour dans la grille | L encodeur rapide s ouvre avec l employe et la date pre-remplis |
| 8 | SECTION RECAPITULATIF | Observer le tableau recapitulatif en bas | Tableau par code (CA, RTT, MA...) avec colonnes : Jours acquis / Jours pris / Difference / Heures acquises / Heures prises / Difference |
| 9 | BOUTON IMPRIMER | Cliquer "Imprimer le calendrier" | Nouvelle fenetre avec le PDF A4 : logo organisation + calendrier 12 mois + tableau recapitulatif |

### Sous-titres resumes (affichage video)

1. "Ouvrez Absences & Conges"
2. "Selectionnez Calendrier annuel"
3. "Filtrez par secteur et employe"
4. "Visualisez les 12 mois en couleur"
5. "Consultez le recapitulatif des soldes"
6. "Imprimez en format A4"

### Informations de production

- **Duree estimee de la video** : 60 secondes
- **Pages/URLs concernees** : `/absences` (onglet Calendrier annuel)
- **Prerequis** : Employes crees, absences encodees pour avoir des donnees visibles

---

## 4. VOIR LES SOLDES CONGES (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour consulter les soldes de conges de tous les employes, allez dans Absences et Conges puis onglet Soldes. Vous voyez un tableau recapitulatif avec chaque employe, son anciennete, ses semaines de droit, ses heures totales de conge, et ce qu il a deja consomme. Vous pouvez filtrer par annee et chercher un employe specifique.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Absences & Conges" dans le menu | Icone calendrier avec libelle dans la navigation |
| 2 | PAGE ABSENCES | Cliquer l onglet "Soldes" | Onglets visibles : Encodage, Calendrier annuel, Soldes, Approbations |
| 3 | PAGE SOLDES - Filtres | Selectionner l annee dans le dropdown | Dropdown annee (2025, 2026, 2027...) |
| 4 | PAGE SOLDES - Recherche | Taper un nom dans la barre de recherche (optionnel) | Champ texte "Rechercher un employe..." |
| 5 | PAGE SOLDES - Tableau | Observer le tableau recapitulatif | Colonnes : Nom employe, Anciennete, Semaines droit, Heures totales, Heures consommees, Solde restant. Une ligne par employe. |
| 6 | PAGE SOLDES - Detail | Cliquer sur un employe pour voir le detail par code | Sous-tableau avec ventilation par code absence : CA, RTT, MA avec heures acquises / prises / restantes |

### Sous-titres resumes (affichage video)

1. "Ouvrez Absences & Conges"
2. "Selectionnez l onglet Soldes"
3. "Filtrez par annee"
4. "Consultez le tableau recapitulatif"
5. "Visualisez le detail par employe"

### Informations de production

- **Duree estimee de la video** : 35 secondes
- **Pages/URLs concernees** : `/absences` (onglet Soldes)
- **Prerequis** : Employes crees, droits conges configures

---

## 5. APPROUVER OU REFUSER UNE DEMANDE DE CONGE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Quand un employe soumet une demande de conge via le Self-service, vous recevez une notification (cloche en haut a droite). Pour traiter les demandes, allez dans Absences et Conges puis cliquez l onglet Approbations. La liste affiche toutes les demandes en attente. Pour chaque demande vous voyez : le nom de l employe, les dates, le type de conge, et le nombre de jours. Pour approuver, cliquez le bouton vert Approuver. Le systeme cree automatiquement les entrees dans le calendrier. Pour refuser, cliquez le bouton rouge Refuser. Un champ apparait pour saisir le motif du refus (obligatoire). L employe recoit une notification du resultat.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Absences & Conges" dans le menu | Icone calendrier avec libelle |
| 2 | PAGE ABSENCES | Cliquer l onglet "Approbations" | Onglets : Encodage, Calendrier annuel, Soldes, Approbations |
| 3 | PAGE APPROBATIONS - Header | Observer le bandeau explicatif | Bandeau bleu en haut expliquant le fonctionnement + lien vers l organigramme |
| 4 | PAGE APPROBATIONS - Filtres | Selectionner le filtre de statut | Filtres : En attente / Approuvees / Refusees / Toutes |
| 5 | LISTE - Carte demande | Observer les informations de chaque demande | Nom employe, Dates (du...au), Code absence, Nombre jours, Date de soumission |
| 6 | ACTION APPROUVER | Cliquer le bouton vert "Approuver" | La demande passe en vert, les entrees sont creees dans le calendrier automatiquement. Notification envoyee a l employe. |
| 7 | ACTION REFUSER | Cliquer le bouton rouge "Refuser" | Modal avec champ "Motif du refus" (obligatoire). Remplir le motif. Cliquer "Confirmer". Notification envoyee a l employe. |

### Sous-titres resumes (affichage video)

1. "Ouvrez l onglet Approbations"
2. "Consultez les demandes en attente"
3. "Approuvez en un clic"
4. "Ou refusez avec un motif obligatoire"
5. "L employe est notifie automatiquement"

### Informations de production

- **Duree estimee de la video** : 50 secondes
- **Pages/URLs concernees** : `/absences` (onglet Approbations)
- **Prerequis** : Organigramme configure (responsables assignes), demandes de conge soumises par les employes

---

## 6. CREER UN EMPLOYE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour ajouter un nouvel employe, allez dans Personnel puis cliquez le bouton Nouveau en haut a droite. Remplissez le formulaire : prenom, nom, email, telephone, adresse. Dans la section contrat : type de contrat, fonction, secteur, site. Dates importantes : date d embauche (obligatoire), date de naissance. Anciennete accordee si applicable (nombre d annees bonus). Cliquez Enregistrer. L employe apparait dans la liste.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Personnel" dans le menu | Icone Personnel avec libelle dans la navigation |
| 2 | PAGE EMPLOYEES | Cliquer le bouton "+ Nouveau" en haut a droite | Bouton vert/bleu "+ Nouveau" visible a cote du bouton "Organigramme" |
| 3 | PAGE CREATION - Identite | Remplir les champs d identite | Champs : Prenom* (obligatoire), Nom* (obligatoire), Email, Telephone, Adresse, Code postal, Ville, Nationalite |
| 4 | PAGE CREATION - Contrat | Remplir les informations de contrat | Champs : Type de contrat (CDI, CDD, Interim...), Fonction, Secteur (dropdown), Site |
| 5 | PAGE CREATION - Dates | Remplir les dates importantes | Date d embauche* (obligatoire, date picker), Date de naissance (date picker, important pour calcul RTT) |
| 6 | PAGE CREATION - Anciennete | Remplir l anciennete accordee si applicable | Champ numerique "Anciennete accordee" (en annees). 0 par defaut. Sert au calcul des paliers de salaire. |
| 7 | PAGE CREATION - Bouton | Cliquer "Enregistrer" | Bouton vert "Enregistrer" en bas du formulaire |
| 8 | PAGE EMPLOYEES - Resultat | Observer le retour a la liste | L employe apparait dans la liste du personnel. Redirection vers la fiche de l employe cree. |

### Sous-titres resumes (affichage video)

1. "Ouvrez Personnel"
2. "Cliquez + Nouveau"
3. "Remplissez identite et contrat"
4. "Indiquez les dates importantes"
5. "Enregistrez le nouvel employe"

### Informations de production

- **Duree estimee de la video** : 50 secondes
- **Pages/URLs concernees** : `/employees`, `/employees/new`
- **Prerequis** : Secteurs crees, sites configures

---

## 7. MODIFIER UNE FICHE EMPLOYE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour modifier les informations d un employe, cliquez sur son nom dans la liste du Personnel. La fiche s affiche avec toutes ses donnees : contrat, salaire, conges, RTT, absences recentes, actifs. Cliquez le bouton Editer. Le formulaire de modification s ouvre. Modifiez les champs souhaites. N oubliez pas les champs critiques pour les calculs : date de naissance (pour RTT), date d embauche et anciennete accordee (pour le salaire et les paliers). Cliquez Enregistrer.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Personnel" dans le menu | Icone Personnel dans la navigation |
| 2 | PAGE EMPLOYEES | Cliquer sur le nom de l employe dans la liste | Liste des employes avec colonnes : Nom, Prenom, Secteur, Fonction, Statut |
| 3 | FICHE EMPLOYE - Vue | Observer la fiche complete | Sections visibles : Identite, Contrat, Salaire (carte avec montant brut indexe), Conges (soldes), RTT, Absences recentes, Actifs (materiel attribue) |
| 4 | FICHE EMPLOYE - Bouton | Cliquer le bouton "Editer" | Bouton "Editer" en haut a droite de la fiche |
| 5 | FORMULAIRE EDITION | Modifier les champs souhaites | Tous les champs deviennent editables : identite, contrat, dates, anciennete |
| 6 | FORMULAIRE - Champs critiques | Verifier les champs importants pour les calculs | Date de naissance (calcul RTT age > 50 ans), Date d embauche + Anciennete accordee (paliers salaire) |
| 7 | FORMULAIRE - Bouton | Cliquer "Enregistrer" | Bouton vert "Enregistrer" en bas |
| 8 | FICHE EMPLOYE - Resultat | Observer les modifications sauvegardees | Retour a la vue fiche avec les nouvelles donnees. Les calculs (salaire, RTT) sont mis a jour automatiquement. |

### Sous-titres resumes (affichage video)

1. "Ouvrez la fiche de l employe"
2. "Cliquez Editer"
3. "Modifiez les champs necessaires"
4. "Attention aux champs qui impactent les calculs"
5. "Enregistrez les modifications"

### Informations de production

- **Duree estimee de la video** : 45 secondes
- **Pages/URLs concernees** : `/employees`, `/employees/[id]`, `/employees/[id]/edit`
- **Prerequis** : Au moins un employe cree

---

## 8. CONFIGURER L ORGANIGRAMME (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> L organigramme definit qui est responsable de qui. C est important pour le workflow d approbation des conges. Allez dans Personnel puis cliquez Organigramme. Par defaut, tous les employes sont au meme niveau car aucun responsable n est assigne. Cliquez le bouton Configurer la hierarchie. Un mode edition s active : a cote de chaque employe, un menu deroulant Responsable apparait. Selectionnez le manager pour chaque employe. La sauvegarde est immediate. Quand vous avez fini, desactivez le mode edition. L arbre hierarchique s affiche avec les niveaux d indentation : direction en haut, managers en dessous, equipes en dessous.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Personnel" dans le menu | Icone Personnel dans la navigation |
| 2 | PAGE EMPLOYEES | Cliquer le bouton "Organigramme" (a cote de "+ Nouveau") | Bouton "Organigramme" visible en haut |
| 3 | PAGE ORGANIGRAMME | Observer la vue arborescente | Vue arborescente (actuellement plate si pas de managers assignes). Chaque employe est liste. |
| 4 | BOUTON CONFIGURER | Cliquer "Configurer la hierarchie" (toggle) | Le bouton s active (change de couleur/etat). Mode edition enclenche. |
| 5 | MODE EDITION | Pour chaque employe, cliquer le dropdown "Responsable" et selectionner le manager | A cote de chaque nom d employe, un dropdown "Responsable" apparait avec la liste de tous les employes |
| 6 | SAUVEGARDE | Observer la sauvegarde automatique | La selection se sauvegarde immediatement (pas besoin de cliquer Enregistrer). Indicateur de sauvegarde visible. |
| 7 | DESACTIVER | Re-cliquer "Configurer la hierarchie" pour revenir a la vue arbre | Le mode edition se desactive. L arbre hierarchique s affiche avec les niveaux d indentation. |

### Sous-titres resumes (affichage video)

1. "Ouvrez Personnel puis Organigramme"
2. "Activez le mode Configurer la hierarchie"
3. "Assignez un responsable a chaque employe"
4. "Sauvegarde automatique"
5. "Desactivez pour voir l arbre hierarchique"

### Informations de production

- **Duree estimee de la video** : 50 secondes
- **Pages/URLs concernees** : `/employees`, `/employees/organigramme`
- **Prerequis** : Plusieurs employes crees (au moins un manager et des membres d equipe)

---

## 9. CONSULTER ET COMPRENDRE LE SALAIRE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour voir le salaire d un employe, ouvrez sa fiche dans Personnel. La carte Salaire affiche le montant brut mensuel indexe. Cliquez dessus pour voir le detail du calcul. La page Baremes montre la decomposition : salaire de base (selon l anciennete et le secteur), facteur d indexation organisation, facteur d indexation sectoriel, augmentations personnelles. Le total indexe est la formule : Base fois indexation org fois indexation secteur plus augmentations.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Personnel" dans le menu | Icone Personnel dans la navigation |
| 2 | PAGE EMPLOYEES | Cliquer sur le nom de l employe | Liste des employes |
| 3 | FICHE EMPLOYE - Carte Salaire | Observer la carte Salaire sur la fiche | Carte affichant le montant brut mensuel indexe (ex: "3 245,67 EUR") |
| 4 | FICHE EMPLOYE - Clic Salaire | Cliquer sur la carte Salaire pour voir le detail | Redirection vers la page Baremes / detail du calcul |
| 5 | PAGE BAREMES - Decomposition | Observer la decomposition du calcul | Salaire de base (montant selon anciennete et secteur dans la grille baremique) |
| 6 | PAGE BAREMES - Indexation | Observer les facteurs d indexation | Facteur indexation organisation (ex: 1.02), Facteur indexation sectoriel (ex: 1.015) |
| 7 | PAGE BAREMES - Augmentations | Observer les augmentations personnelles | Liste des augmentations individuelles avec montants et dates |
| 8 | PAGE BAREMES - Total | Observer le total calcule | Formule : (Base x Index Org x Index Secteur) + Augmentations = Total brut indexe |

### Sous-titres resumes (affichage video)

1. "Ouvrez la fiche employe"
2. "Consultez la carte Salaire"
3. "Cliquez pour le detail du calcul"
4. "Base + Indexation + Augmentations = Total"

### Informations de production

- **Duree estimee de la video** : 40 secondes
- **Pages/URLs concernees** : `/employees/[id]`, `/remuneration/baremes`
- **Prerequis** : Employe cree avec secteur, baremes configures, indexation definie

---

## 10. SIMULATEUR SALAIRE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Le simulateur permet de calculer le salaire pour n importe quel employe a n importe quelle date. Allez dans Remuneration puis Simulateur. Selectionnez un employe. Changez la date de simulation si vous voulez projeter dans le futur. Le systeme recalcule automatiquement l anciennete, le palier de bareme, et le salaire indexe a cette date.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Remuneration" dans le menu | Icone Remuneration dans la navigation |
| 2 | PAGE REMUNERATION | Cliquer "Simulateur" dans les sous-menus ou onglets | Onglet ou lien "Simulateur" |
| 3 | PAGE SIMULATEUR - Employe | Selectionner un employe dans le dropdown | Dropdown avec la liste de tous les employes. Selectionner ex: "DUPONT Marie" |
| 4 | PAGE SIMULATEUR - Date | Modifier la date de simulation | Champ date avec la date du jour par defaut. Changer pour une date future (ex: 01/01/2028) |
| 5 | PAGE SIMULATEUR - Calcul | Observer le recalcul automatique | Le systeme recalcule : anciennete a la date simulee, palier de bareme correspondant, salaire de base, indexation, total brut indexe |
| 6 | PAGE SIMULATEUR - Resultat | Observer les resultats affiches | Anciennete simulee (ex: 12 ans), Palier bareme (ex: palier 12), Salaire base (ex: 3 100 EUR), Index org, Index secteur, Total indexe (ex: 3 456,78 EUR) |

### Sous-titres resumes (affichage video)

1. "Ouvrez Remuneration puis Simulateur"
2. "Selectionnez un employe"
3. "Changez la date pour projeter"
4. "Le salaire est recalcule automatiquement"

### Informations de production

- **Duree estimee de la video** : 35 secondes
- **Pages/URLs concernees** : `/remuneration/simulateur`
- **Prerequis** : Employes crees, baremes configures, indexation definie

---

## 11. ALERTES AUGMENTATION (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Les alertes augmentation detectent les employes dont l anciennete atteint un nouveau palier de bareme cette annee. Allez dans Remuneration puis Alertes. La liste affiche les employes concernes avec la difference de salaire indexe entre l ancien et le nouveau palier. Vous pouvez aussi voir ce resume sur le Tableau de bord.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Remuneration" dans le menu | Icone Remuneration dans la navigation |
| 2 | PAGE REMUNERATION | Cliquer "Alertes" dans les sous-menus ou onglets | Onglet ou lien "Alertes" |
| 3 | PAGE ALERTES - Liste | Observer la liste des employes concernes | Tableau avec colonnes : Nom employe, Date palier, Ancien palier, Nouveau palier, Ancien salaire indexe, Nouveau salaire indexe, Difference |
| 4 | PAGE ALERTES - Detail | Observer le detail pour un employe | Ex: "MARTIN Paul - Palier 8 vers 9 - Difference: +125,50 EUR/mois" |
| 5 | TABLEAU DE BORD | Alternative : voir le resume sur le dashboard | Widget "Alertes augmentation" sur la page d accueil avec le nombre d employes concernes et le total des augmentations |

### Sous-titres resumes (affichage video)

1. "Ouvrez Remuneration puis Alertes"
2. "Voyez qui change de palier cette annee"
3. "Consultez la difference de salaire"
4. "Aussi visible sur le Tableau de bord"

### Informations de production

- **Duree estimee de la video** : 30 secondes
- **Pages/URLs concernees** : `/remuneration/alertes`, `/dashboard`
- **Prerequis** : Employes crees avec date d embauche, baremes configures avec paliers

---

## 12. CREER UN RAPPORT DYNAMIQUE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour creer un rapport personnalise, allez dans Rapports puis cliquez Nouveau rapport. Le wizard de construction s ouvre en 6 etapes. Etape 1 Tables : selectionnez les tables de donnees a inclure, par exemple Employes et Calendrier annuel. Etape 2 Colonnes : cochez les colonnes que vous voulez dans le rapport. Vous avez aussi des colonnes calculees comme Anciennete ou Salaire indexe. Etape 3 Filtres : ajoutez des conditions, par exemple Annee egale 2026 ou Secteur egale KINE. Etape 4 Groupements : regroupez par un champ et ajoutez des totaux (somme, comptage, moyenne). Etape 5 Tri : choisissez l ordre des lignes. Etape 6 Export : nommez votre rapport, choisissez l orientation portrait ou paysage. Un apercu des 20 premieres lignes s affiche. Cliquez Sauvegarder pour garder ce template et le reutiliser plus tard. Ou exportez directement en PDF, Excel ou CSV.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Rapports" dans le menu | Icone Rapports dans la navigation |
| 2 | PAGE RAPPORTS | Cliquer le bouton "Nouveau rapport" | Bouton "+ Nouveau rapport" en haut de la page. Liste des rapports sauvegardes en dessous. |
| 3 | WIZARD - Etape 1 Tables | Selectionner les tables de donnees | Cases a cocher : Employes, Calendrier annuel, Absences, Contrats, Remunerations, Secteurs, etc. Cocher les tables souhaitees. |
| 4 | WIZARD - Etape 2 Colonnes | Cocher les colonnes a inclure | Liste des colonnes disponibles selon les tables selectionnees. Colonnes standards (Nom, Prenom, Secteur...) + Colonnes calculees (Anciennete, Salaire indexe, Solde conges). |
| 5 | WIZARD - Etape 3 Filtres | Ajouter des conditions de filtrage | Bouton "+ Ajouter un filtre". Dropdown champ, dropdown operateur (=, !=, >, <, contient), valeur. Ex: Annee = 2026, Secteur = KINE. |
| 6 | WIZARD - Etape 4 Groupements | Configurer les regroupements et totaux | Dropdown "Grouper par" (ex: Secteur). Options totaux : Somme, Comptage, Moyenne pour les colonnes numeriques. |
| 7 | WIZARD - Etape 5 Tri | Choisir l ordre de tri | Dropdown colonne de tri + direction (Ascendant / Descendant). Possibilite d ajouter plusieurs niveaux de tri. |
| 8 | WIZARD - Etape 6 Export | Nommer et configurer l export | Champ "Nom du rapport", Toggle orientation (Portrait / Paysage), Apercu des 20 premieres lignes en tableau. |
| 9 | WIZARD - Sauvegarder | Cliquer "Sauvegarder" pour garder le template | Bouton "Sauvegarder" : le rapport est ajoute a la liste des rapports reutilisables |
| 10 | WIZARD - Export direct | Ou cliquer sur un bouton d export | Boutons : "PDF" (avec logo, header), "Excel" (.xls), "CSV". Le fichier se telecharge. |

### Sous-titres resumes (affichage video)

1. "Ouvrez Rapports et cliquez Nouveau"
2. "Etape 1 : Choisissez les tables"
3. "Etape 2 : Selectionnez les colonnes"
4. "Etape 3 : Ajoutez des filtres"
5. "Etape 4 : Configurez les groupements"
6. "Etape 5 : Definissez le tri"
7. "Etape 6 : Nommez et exportez"

### Informations de production

- **Duree estimee de la video** : 75 secondes
- **Pages/URLs concernees** : `/reports`, `/reports/new`
- **Prerequis** : Des donnees existantes dans le systeme (employes, absences) pour generer un rapport significatif

---

## 13. EXECUTER UN RAPPORT SAUVEGARDE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Vos rapports sauvegardes sont listes sur la page Rapports. Cliquez sur un rapport pour l executer. Les donnees s affichent en temps reel. Trois boutons d export : PDF (impression avec logo, header, wrap complet sans troncature), Excel (fichier .xls), CSV. Vous pouvez aussi dupliquer un rapport pour en creer une variante, ou le modifier.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Rapports" dans le menu | Icone Rapports dans la navigation |
| 2 | PAGE RAPPORTS - Liste | Observer la liste des rapports sauvegardes | Liste avec : Nom du rapport, Date de creation, Nombre de colonnes, Derniere execution |
| 3 | PAGE RAPPORTS - Selection | Cliquer sur un rapport pour l executer | Le rapport se charge. Tableau de donnees affiche en temps reel. |
| 4 | PAGE RAPPORT - Donnees | Observer les resultats | Tableau avec les colonnes configurees, les filtres appliques, les groupements et totaux. Pagination si beaucoup de lignes. |
| 5 | PAGE RAPPORT - Export PDF | Cliquer le bouton "PDF" | Telechargement d un fichier PDF avec : logo organisation en header, titre du rapport, date, tableau complet (wrap sans troncature), pagination A4 |
| 6 | PAGE RAPPORT - Export Excel | Cliquer le bouton "Excel" | Telechargement d un fichier .xls avec toutes les donnees |
| 7 | PAGE RAPPORT - Export CSV | Cliquer le bouton "CSV" | Telechargement d un fichier .csv |
| 8 | PAGE RAPPORT - Dupliquer | Cliquer "Dupliquer" pour creer une variante | Le wizard s ouvre avec les parametres pre-remplis du rapport original. Modifier et sauvegarder sous un nouveau nom. |
| 9 | PAGE RAPPORT - Modifier | Cliquer "Modifier" pour editer le rapport | Le wizard s ouvre en mode edition. Modifier les etapes souhaitees et re-sauvegarder. |

### Sous-titres resumes (affichage video)

1. "Ouvrez la page Rapports"
2. "Cliquez sur un rapport sauvegarde"
3. "Les donnees s affichent en temps reel"
4. "Exportez en PDF, Excel ou CSV"
5. "Dupliquez ou modifiez un rapport existant"

### Informations de production

- **Duree estimee de la video** : 40 secondes
- **Pages/URLs concernees** : `/reports`, `/reports/[id]`
- **Prerequis** : Au moins un rapport sauvegarde

---

## 14. IMPORTER DES DONNEES EN MASSE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour importer des donnees depuis un fichier Excel ou CSV, allez dans Parametres puis Import Export. La page affiche 16 tables dans l ordre des dependances. Pour chaque table : d abord exportez les donnees existantes en cliquant Exporter. Cela telecharge un fichier .xls qui sert de modele : les colonnes sont dans le bon format, les donnees existantes vous montrent le format attendu. Modifiez ce fichier dans Excel, ajoutez vos lignes, puis revenez sur la page et cliquez Importer. Selectionnez votre fichier CSV. Un apercu des 10 premieres lignes s affiche. Les erreurs sont marquees en rouge. Choisissez le mode : Ajouter uniquement ou Mettre a jour. Cliquez Lancer l import. Une barre de progression s affiche. Le rapport final indique combien de lignes ont ete inserees, mises a jour, ou en erreur.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Parametres" dans le menu | Icone Parametres dans la navigation |
| 2 | PAGE PARAMETRES | Cliquer "Import / Export" | Sous-menu ou onglet "Import / Export" |
| 3 | PAGE IMPORT EXPORT - Tables | Observer la liste des 16 tables | Liste ordonnee par dependances : Organisations, Secteurs, Sites, Employes, Contrats, Baremes, Indexations, Conges, Calendrier, etc. |
| 4 | TABLE - Exporter | Cliquer "Exporter" a cote d une table | Telechargement d un fichier .xls avec : colonnes dans le bon format, donnees existantes comme exemple de format |
| 5 | EXCEL - Modification | Ouvrir le fichier dans Excel (hors application) | Le fichier montre les colonnes attendues et le format de chaque champ. Ajouter des lignes. |
| 6 | TABLE - Importer | Revenir sur la page et cliquer "Importer" a cote de la meme table | Selecteur de fichier s ouvre |
| 7 | IMPORT - Fichier | Selectionner le fichier CSV modifie | Le fichier est charge. |
| 8 | IMPORT - Apercu | Observer l apercu des 10 premieres lignes | Tableau d apercu avec les colonnes detectees. Cellules en erreur marquees en rouge (format incorrect, valeur manquante). |
| 9 | IMPORT - Mode | Choisir le mode d import | Radio buttons : "Ajouter uniquement" (insere de nouvelles lignes) / "Mettre a jour" (met a jour les existantes + insere les nouvelles) |
| 10 | IMPORT - Lancer | Cliquer "Lancer l import" | Bouton vert "Lancer l import". Barre de progression s affiche pendant le traitement. |
| 11 | IMPORT - Rapport | Observer le rapport final | Resume : X lignes inserees, Y lignes mises a jour, Z lignes en erreur. Detail des erreurs si applicable. |

### Sous-titres resumes (affichage video)

1. "Ouvrez Parametres puis Import/Export"
2. "Exportez d abord pour avoir le modele"
3. "Modifiez le fichier dans Excel"
4. "Importez votre fichier CSV"
5. "Verifiez l apercu et les erreurs"
6. "Choisissez le mode et lancez"
7. "Consultez le rapport d import"

### Informations de production

- **Duree estimee de la video** : 70 secondes
- **Pages/URLs concernees** : `/settings`, `/settings/import-export`
- **Prerequis** : Acces administrateur, fichier CSV prepare au bon format

---

## 15. AJOUTER ET GERER UN CANDIDAT - RECRUTEMENT (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Le module Recrutement permet de suivre les candidatures. Allez dans Recrutement. Creez d abord un poste ouvert dans Postes : titre, secteur, type de contrat. Puis allez dans Candidats et cliquez Nouveau candidat. Remplissez le formulaire : prenom, nom, email, telephone, poste concerne, uploadez le CV. Le candidat apparait avec le statut Recu. Cliquez sur son nom pour ouvrir sa fiche. Vous pouvez y changer le statut progressivement : Recu, Preselectionne, Entretien, Offre. Planifier un entretien avec date et notes. Donner une note de 1 a 5 etoiles. Quand le statut est Offre, le bouton vert Embaucher ce candidat apparait. Cliquez dessus. Un formulaire pre-rempli s affiche avec toutes les donnees du candidat. Completez la date d embauche. Cliquez Creer l employe. Le candidat est automatiquement converti en employe dans le systeme.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Recrutement" dans le menu | Icone Recrutement dans la navigation |
| 2 | DASHBOARD RECRUTEMENT | Observer la vue d ensemble | Postes ouverts (nombre), Candidatures actives (nombre), Statistiques |
| 3 | CREER UN POSTE | Cliquer "Postes" puis "Nouveau poste" | Formulaire : Titre du poste, Secteur (dropdown), Type contrat (CDI/CDD), Description |
| 4 | CREER UN POSTE - Enregistrer | Remplir et cliquer "Enregistrer" | Le poste apparait dans la liste des postes ouverts |
| 5 | AJOUTER CANDIDAT | Cliquer "Candidats" puis "+ Nouveau candidat" | Bouton "+ Nouveau candidat" en haut de la liste |
| 6 | FORMULAIRE CANDIDAT | Remplir le formulaire | Champs : Prenom* (obligatoire), Nom* (obligatoire), Email, Telephone, Poste (dropdown des postes ouverts), CV (upload max 2MB), Motivation (texte libre) |
| 7 | FORMULAIRE - Creer | Cliquer "Creer" | Le candidat apparait dans la liste avec badge "Recu" (statut initial) |
| 8 | FICHE CANDIDAT | Cliquer sur le nom du candidat | Page detail avec toutes les sections : identite, poste, CV, statut, entretien, notation |
| 9 | FICHE - Statut | Changer le statut via le dropdown | Dropdown statut : Recu -> Preselectionne -> Entretien -> Offre. Chaque changement est sauvegarde. |
| 10 | FICHE - Entretien | Remplir la section Entretien | Champs : Date entretien (date picker), Notes d entretien (texte libre) |
| 11 | FICHE - Rating | Cliquer les etoiles pour noter | Systeme de notation 1 a 5 etoiles. Cliquer sur l etoile correspondante. |
| 12 | FICHE - Embaucher | Quand statut = "Offre" : cliquer le bouton vert "Embaucher ce candidat" | Bouton vert visible uniquement quand le statut est "Offre" |
| 13 | FORMULAIRE EMBAUCHE | Observer les donnees pre-remplies et completer | Champs pre-remplis : prenom, nom, email, telephone, adresse, nationalite, secteur, fonction. A completer : Date d embauche* (obligatoire), Date de naissance (optionnel) |
| 14 | FORMULAIRE - Creer employe | Cliquer "Creer l employe" | Redirection vers la fiche employe creee dans le module Personnel. Le candidat est marque comme "Embauche". |

### Sous-titres resumes (affichage video)

1. "Ouvrez le module Recrutement"
2. "Creez un poste ouvert"
3. "Ajoutez un nouveau candidat"
4. "Suivez l evolution du statut"
5. "Planifiez l entretien et notez"
6. "Embauchez et convertissez en employe"

### Informations de production

- **Duree estimee de la video** : 80 secondes
- **Pages/URLs concernees** : `/recruitment`, `/recruitment/positions`, `/recruitment/candidates`, `/recruitment/candidates/[id]`
- **Prerequis** : Module Recrutement active, au moins un secteur cree

---

## 16. GERER LES DOCUMENTS EMPLOYE (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour stocker des documents lies a un employe, ouvrez sa fiche et cliquez Documents. Vous pouvez uploader des contrats, avenants, attestations, fiches de paie, certificats medicaux ou tout autre document. Cliquez Ajouter un document, donnez un nom, choisissez la categorie, ajoutez des notes optionnelles, et selectionnez le fichier (PDF ou image, max 2MB). Le document est sauvegarde et telechargeable a tout moment.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Personnel" dans le menu | Icone Personnel dans la navigation |
| 2 | PAGE EMPLOYEES | Cliquer sur le nom de l employe | Liste des employes |
| 3 | FICHE EMPLOYE | Cliquer l onglet ou section "Documents" | Section Documents sur la fiche employe |
| 4 | SECTION DOCUMENTS - Liste | Observer les documents existants | Liste des documents deja uploades : Nom, Categorie, Date d ajout, Taille, Bouton telecharger |
| 5 | SECTION DOCUMENTS - Ajouter | Cliquer "Ajouter un document" | Formulaire d ajout de document |
| 6 | FORMULAIRE - Nom | Saisir le nom du document | Champ texte "Nom du document" (ex: "Contrat CDI signe") |
| 7 | FORMULAIRE - Categorie | Selectionner la categorie | Dropdown : Contrat, Avenant, Attestation, Fiche de paie, Certificat medical, Autre |
| 8 | FORMULAIRE - Notes | Ajouter des notes optionnelles | Champ texte libre "Notes" (ex: "Version signee le 15/03/2026") |
| 9 | FORMULAIRE - Fichier | Selectionner le fichier a uploader | Bouton "Choisir un fichier". Formats acceptes : PDF, PNG, JPG. Taille max : 2MB. |
| 10 | FORMULAIRE - Enregistrer | Cliquer "Enregistrer" | Le document apparait dans la liste. Badge de confirmation. |
| 11 | SECTION DOCUMENTS - Telecharger | Cliquer l icone de telechargement a cote d un document | Le fichier se telecharge sur votre ordinateur |

### Sous-titres resumes (affichage video)

1. "Ouvrez la fiche employe"
2. "Allez dans Documents"
3. "Cliquez Ajouter un document"
4. "Nommez, categorisez, uploadez"
5. "Le document est sauvegarde"

### Informations de production

- **Duree estimee de la video** : 40 secondes
- **Pages/URLs concernees** : `/employees/[id]` (section Documents)
- **Prerequis** : Au moins un employe cree, fichier a uploader (PDF ou image, max 2MB)

---

## 17. NOTIFICATIONS (Gestionnaire et Employe)

**Role concerne** : Les deux (Gestionnaire RH et Employe)

### Script voiceover

> La cloche en haut a droite affiche le nombre de notifications non lues. Cliquez dessus pour voir les 10 dernieres. Les notifications vous alertent quand : une demande de conge est soumise, approuvee ou refusee, un contrat arrive a expiration, un employe atteint un nouveau palier de salaire. Cliquez sur une notification pour la marquer comme lue. Cliquez Voir tout pour acceder a la page complete avec filtres.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | HEADER - Cloche | Observer l icone cloche en haut a droite | Icone cloche avec badge rouge indiquant le nombre de notifications non lues (ex: "3") |
| 2 | HEADER - Clic cloche | Cliquer sur la cloche | Menu deroulant s ouvre avec les 10 dernieres notifications |
| 3 | DROPDOWN - Liste | Observer les notifications | Chaque notification : icone type, texte descriptif, date/heure. Ex: "Demande de conge soumise par DUPONT Marie - il y a 2h" |
| 4 | DROPDOWN - Types | Observer les differents types de notifications | Types : Demande conge soumise (pour le manager), Conge approuve/refuse (pour l employe), Contrat expiration proche, Nouveau palier salaire |
| 5 | DROPDOWN - Marquer lue | Cliquer sur une notification | La notification est marquee comme lue (le style change : texte moins gras, fond plus clair). Redirection eventuelle vers la page concernee. |
| 6 | DROPDOWN - Voir tout | Cliquer "Voir tout" en bas du dropdown | Redirection vers la page complete des notifications |
| 7 | PAGE NOTIFICATIONS | Observer la page complete | Liste paginee de toutes les notifications avec filtres : Toutes / Non lues / Par type. Bouton "Tout marquer comme lu". |

### Sous-titres resumes (affichage video)

1. "La cloche indique les notifications non lues"
2. "Cliquez pour voir les dernieres"
3. "Differents types d alertes"
4. "Cliquez pour marquer comme lu"
5. "Voir tout pour la page complete"

### Informations de production

- **Duree estimee de la video** : 35 secondes
- **Pages/URLs concernees** : Header global (toutes pages), `/notifications`
- **Prerequis** : Des evenements generant des notifications (demandes conge, expirations contrat, changements palier)

---

## 18. PARAMETRES - ORGANISATION ET LOGO (Gestionnaire)

**Role concerne** : Gestionnaire RH

### Script voiceover

> Pour configurer l organisation, allez dans Parametres puis Organisation. Remplissez le nom de l entreprise, le numero TVA, l adresse, les coordonnees. Dans la section Logo, uploadez le logo de l entreprise (PNG, JPG ou SVG, max 500KB). Ce logo apparaitra sur tous les documents imprimes : rapports, calendriers, exports PDF.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | SIDEBAR | Cliquer "Parametres" dans le menu | Icone Parametres dans la navigation |
| 2 | PAGE PARAMETRES | Cliquer "Organisation" | Sous-menu ou onglet "Organisation" |
| 3 | PAGE ORGANISATION - Identite | Remplir les champs d identite | Champs : Nom de l entreprise, Numero TVA, Adresse, Code postal, Ville, Pays |
| 4 | PAGE ORGANISATION - Contact | Remplir les coordonnees | Champs : Telephone, Email, Site web |
| 5 | PAGE ORGANISATION - Logo | Section Logo | Zone d upload avec apercu du logo actuel (ou placeholder si aucun logo) |
| 6 | PAGE ORGANISATION - Upload Logo | Cliquer "Choisir un fichier" ou glisser-deposer | Formats acceptes : PNG, JPG, SVG. Taille max : 500KB. L apercu se met a jour immediatement. |
| 7 | PAGE ORGANISATION - Enregistrer | Cliquer "Enregistrer" | Bouton vert "Enregistrer". Message de confirmation. |
| 8 | VERIFICATION | Observer le logo sur un document | Le logo apparait sur : rapports PDF, calendriers imprimes, exports, en-tete des documents officiels |

### Sous-titres resumes (affichage video)

1. "Ouvrez Parametres puis Organisation"
2. "Remplissez les informations de l entreprise"
3. "Uploadez votre logo"
4. "Le logo apparait sur tous les documents"

### Informations de production

- **Duree estimee de la video** : 35 secondes
- **Pages/URLs concernees** : `/settings`, `/settings/organization`
- **Prerequis** : Acces administrateur, fichier logo prepare (PNG/JPG/SVG, max 500KB)

---

## 19. INSTALLER L APPLICATION SUR MOBILE (Employe)

**Role concerne** : Employe

### Script voiceover

> WorkDays fonctionne comme une application sur votre telephone. Sur iPhone, ouvrez l application dans Safari (pas Chrome). Cliquez l icone de partage (le carre avec la fleche vers le haut). Faites defiler et cliquez Ajouter a l ecran d accueil. L icone WorkDays apparait sur votre ecran comme une application normale. Sur Android avec Chrome, appuyez sur le menu trois points puis Installer l application ou Ajouter a l ecran d accueil.

### Etapes visuelles

| # | Page / Section | Action | Donnees visibles a l ecran |
|---|---|---|---|
| 1 | NAVIGATEUR MOBILE - Safari (iPhone) | Ouvrir l URL de WorkDays dans Safari | Page de connexion WorkDays chargee dans Safari. Important : utiliser Safari, pas Chrome sur iPhone. |
| 2 | SAFARI - Icone partage | Cliquer l icone de partage (carre avec fleche vers le haut) en bas de l ecran | Menu de partage iOS s ouvre avec les options |
| 3 | SAFARI - Ajouter | Faire defiler le menu et cliquer "Ajouter a l ecran d accueil" | Option "Ajouter a l ecran d accueil" avec icone "+" |
| 4 | SAFARI - Confirmation | Confirmer le nom et cliquer "Ajouter" | Champ avec le nom "WorkDays" pre-rempli. Bouton "Ajouter" en haut a droite. |
| 5 | ECRAN ACCUEIL iPhone | Observer l icone WorkDays | L icone WorkDays apparait sur l ecran d accueil comme une application native. Cliquer dessus ouvre l app en plein ecran (sans barre Safari). |
| 6 | NAVIGATEUR MOBILE - Chrome (Android) | Ouvrir l URL de WorkDays dans Chrome | Page de connexion WorkDays chargee dans Chrome Android |
| 7 | CHROME - Menu | Appuyer sur le menu trois points (en haut a droite) | Menu deroulant Chrome s ouvre |
| 8 | CHROME - Installer | Cliquer "Installer l application" ou "Ajouter a l ecran d accueil" | Option visible dans le menu. Sur certains appareils : "Installer l application", sur d autres : "Ajouter a l ecran d accueil" |
| 9 | CHROME - Confirmation | Confirmer l installation | Popup de confirmation. Cliquer "Installer" ou "Ajouter". |
| 10 | ECRAN ACCUEIL Android | Observer l icone WorkDays | L icone WorkDays apparait sur l ecran d accueil. Cliquer dessus ouvre l app en mode standalone (plein ecran). |

### Sous-titres resumes (affichage video)

1. "Ouvrez WorkDays dans Safari (iPhone) ou Chrome (Android)"
2. "iPhone : icone partage puis Ajouter a l ecran d accueil"
3. "Android : menu trois points puis Installer"
4. "L icone WorkDays apparait comme une app"
5. "Ouvrez en plein ecran sans barre de navigateur"

### Informations de production

- **Duree estimee de la video** : 45 secondes
- **Pages/URLs concernees** : URL de l application WorkDays (domaine de production)
- **Prerequis** : Smartphone (iPhone avec Safari ou Android avec Chrome), URL de l application WorkDays

---

## Resume des durees totales

| # | Fonction | Duree estimee |
|---|---|---|
| 1 | Encoder une absence (Gestionnaire) | 90 sec |
| 2 | Encoder une absence (Employe) | 45 sec |
| 3 | Calendrier annuel | 60 sec |
| 4 | Soldes conges | 35 sec |
| 5 | Approuver/Refuser demande | 50 sec |
| 6 | Creer un employe | 50 sec |
| 7 | Modifier fiche employe | 45 sec |
| 8 | Organigramme | 50 sec |
| 9 | Salaire | 40 sec |
| 10 | Simulateur salaire | 35 sec |
| 11 | Alertes augmentation | 30 sec |
| 12 | Rapport dynamique | 75 sec |
| 13 | Rapport sauvegarde | 40 sec |
| 14 | Import donnees | 70 sec |
| 15 | Recrutement | 80 sec |
| 16 | Documents employe | 40 sec |
| 17 | Notifications | 35 sec |
| 18 | Organisation et logo | 35 sec |
| 19 | Installation mobile | 45 sec |
| **TOTAL** | | **~16 minutes 30 secondes** |

---

## Conventions de couleurs dans l application

| Couleur | Signification |
|---|---|
| Vert | Conges annuels (CA), boutons d action positive (Enregistrer, Approuver) |
| Rouge | Maladie (MA), boutons d action negative (Refuser), jours feries |
| Bleu | RTT, informations, liens, bandeaux explicatifs |
| Orange | Warnings (solde depasse, expiration proche) |
| Gris | Weekends, elements inactifs, texte secondaire |

---

## Glossaire des codes absence

| Code | Libelle complet | Unite |
|---|---|---|
| CA | Conges annuels | Jours |
| RTT | Reduction temps de travail | Heures |
| MA | Maladie | Jours |
| JP | Jour personnel | Jours |
| PC | Petit chomage | Jours |
| HS | Heures supplementaires (recuperation) | Heures |

---

*Document genere pour la production de videos tutorielles WorkDays.*
*Derniere mise a jour : Aout 2025*
