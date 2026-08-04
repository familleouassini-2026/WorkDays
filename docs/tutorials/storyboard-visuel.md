# Storyboard Visuel - Tutoriels Video WorkDays

> Ce document decrit frame par frame le contenu visuel exact de chaque tutoriel video.
> Il sert de reference pour la capture de screenshots et le montage video.

---

## CONVENTIONS VISUELLES

| Zone | Description |
|------|-------------|
| **SIDEBAR** | Barre laterale gauche, fond bleu fonce (bg-blue-900), largeur ~250px. Logo "WorkDays" en blanc + sous-titre "Gestion RH Belgique" en bleu-200. Menu : Tableau de bord, Personnel, Absences & Conges, Horaires, Remuneration, Actifs, Recrutement, Journal interne, Rapports, Parametres, Self-service. En bas : avatar rond + "Admin" + email admin@workdays.be |
| **HEADER** | Barre horizontale blanche en haut, ombre legere. Contient : champ recherche (placeholder "Rechercher un employe, un document..."), icone cloche (notifications), affichage date "mardi 4 aout 2026" |
| **CONTENU** | Zone centrale fond blanc, padding 24px. Cartes avec border rounded-lg border-slate-200 shadow-sm |
| **ENCODER BTN** | Bouton flottant vert (bg-emerald-600) en bas a droite, icone "+", texte "Encoder" |
| **CURSEUR** | Fleche de souris visible, indiquant l'element cible |

## DONNEES D'EXEMPLE

- **Employee** : BIOUCAS Lidia, poste "Accueil Diplome Superieur", secteur "ACCUEIL NON IFIC BAR 1/55"
- **Manager** : OUASSINI Youssef, poste "Directeur"
- **Mois courant** : aout 2026
- **Solde CA** : 20 jours (dont 5 pris, reste 15)
- **Solde RTT** : 152h00 (dont 11h08 pris, reste 140h52)

---

## FONCTION 1 : Encoder une absence (Gestionnaire)
Duree video : 45 secondes
Nombre de frames : 8

### Frame 1 — Vue Tableau de bord
**Duree** : 4 secondes
**Narration** : "Pour encoder une absence en tant que gestionnaire, commencez depuis le tableau de bord."
**Ecran** :
- [SIDEBAR] Menu visible, item "Tableau de bord" surligne en bleu clair (bg-blue-800 arrondi) indiquant la page active. Les autres items en texte blanc/bleu-200
- [HEADER] Barre blanche, champ recherche vide, icone cloche avec badge "0" (pas de notif), date "mardi 4 aout 2026"
- [CONTENU] Dashboard : 4 cartes KPI en ligne (Effectif total : 47, Absents aujourd'hui : 3, Conges en attente : 2, Heures encodees : 312h). En dessous : calendrier semaine + liste activites recentes
- [ENCODER BTN] Bouton vert "Encoder" visible en bas a droite, icone "+" blanche
- [CURSEUR] Positionne au centre de l'ecran
**Action** : Le curseur se deplace vers le bouton vert "Encoder" en bas a droite
**Transition** : Clic sur le bouton, drawer s'ouvre depuis la droite

### Frame 2 — Ouverture du drawer Encodeur rapide
**Duree** : 5 secondes
**Narration** : "Cliquez sur le bouton vert Encoder. Le panneau d'encodage rapide s'ouvre."
**Ecran** :
- [SIDEBAR] Toujours visible, "Tableau de bord" actif
- [HEADER] Inchange
- [CONTENU] Dashboard visible mais legerement assombri (overlay semi-transparent)
- [DRAWER] Panneau fixe a droite, largeur ~384px (sm:w-96). Header vert (bg-emerald-600) avec texte blanc "Encodeur rapide" + icone X pour fermer. Corps blanc avec formulaire :
  - Champ "Type" : dropdown affichant "Absence"
  - Champ "Employe" : champ autocomplete vide, placeholder "Rechercher un employe..."
  - Champ "Motif" : dropdown vide, placeholder "Selectionner un motif"
  - Champ "Date debut" : input date vide
  - Champ "Date fin" : input date vide
  - Champ "Commentaire" : textarea vide
  - Bouton "Enregistrer" (bg-blue-600 text-white rounded-md) desactive (opacity-50)
- [CURSEUR] Sur le champ "Employe"
**Action** : Le curseur clique dans le champ "Employe"
**Transition** : Focus sur le champ, clavier virtuel apparait (suggestion)

### Frame 3 — Recherche de l'employe
**Duree** : 6 secondes
**Narration** : "Tapez le nom de l'employe. Les suggestions apparaissent en temps reel."
**Ecran** :
- [DRAWER] Champ "Employe" en focus (border-blue-500 ring-2 ring-blue-200). Texte tape : "BIO". En dessous du champ, dropdown de suggestions :
  - Ligne 1 : avatar rond gris + "BIOUCAS Lidia" + texte gris "Accueil Diplome Superieur" (surlignee en bg-blue-50)
  - Ligne 2 : avatar rond gris + "BIOTEAU Marc" + texte gris "Infirmier"
- [CURSEUR] Sur la premiere suggestion "BIOUCAS Lidia"
**Action** : Clic sur "BIOUCAS Lidia"
**Transition** : Le champ se remplit, dropdown disparait

### Frame 4 — Selection du motif d'absence
**Duree** : 6 secondes
**Narration** : "Selectionnez le motif de l'absence dans la liste deroulante."
**Ecran** :
- [DRAWER] Champ "Employe" rempli : "BIOUCAS Lidia". Champ "Motif" en focus, dropdown ouvert affichant :
  - Conge annuel (CA)
  - RTT
  - Maladie
  - Conge sans solde
  - Formation
  - Evenement familial
  - Autre
- [CURSEUR] Sur "Conge annuel (CA)" (surligne en bg-blue-50)
**Action** : Clic sur "Conge annuel (CA)"
**Transition** : Dropdown se ferme, motif selectionne

### Frame 5 — Saisie des dates
**Duree** : 7 secondes
**Narration** : "Indiquez la date de debut et la date de fin de l'absence."
**Ecran** :
- [DRAWER] Formulaire partiellement rempli :
  - Employe : "BIOUCAS Lidia" (check vert)
  - Motif : "Conge annuel (CA)" (check vert)
  - Date debut : calendrier mini ouvert (datepicker), mois "Aout 2026" affiche. Jours 1-31 en grille, samedi/dimanche en gris clair. Le 11 est surligne (hover bg-blue-100)
  - Date fin : vide
- [CURSEUR] Sur le 11 aout dans le calendrier
**Action** : Clic sur 11, puis clic sur champ "Date fin", selection du 15 aout
**Transition** : Les deux dates sont remplies

### Frame 6 — Formulaire complet avec recapitulatif
**Duree** : 5 secondes
**Narration** : "Le formulaire est complet. Un recapitulatif affiche le nombre de jours ouvrables."
**Ecran** :
- [DRAWER] Formulaire entierement rempli :
  - Employe : "BIOUCAS Lidia"
  - Motif : "Conge annuel (CA)"
  - Date debut : "11/08/2026"
  - Date fin : "15/08/2026"
  - Commentaire : vide
  - Encadre bleu clair (bg-blue-50 border-blue-200 rounded-md p-3) : "Recapitulatif : 5 jours ouvrables. Solde restant apres encodage : 10 jours CA"
  - Bouton "Enregistrer" maintenant actif (bg-blue-600, pleine opacite)
- [CURSEUR] Sur le bouton "Enregistrer"
**Action** : Clic sur "Enregistrer"
**Transition** : Animation de chargement breve (spinner)

### Frame 7 — Confirmation toast
**Duree** : 4 secondes
**Narration** : "L'absence est enregistree. Une notification de confirmation apparait."
**Ecran** :
- [DRAWER] Se ferme avec animation slide-out vers la droite
- [CONTENU] Dashboard redevient visible, sans overlay
- [TOAST] Notification toast en haut a droite : fond vert (bg-emerald-50 border-emerald-200), icone check vert, texte "Absence encodee avec succes pour BIOUCAS Lidia (11/08 - 15/08/2026)"
- [ENCODER BTN] Bouton vert "Encoder" visible a nouveau
- [CURSEUR] Au centre
**Action** : Aucune (observation)
**Transition** : Le toast disparait apres 3 secondes

### Frame 8 — Verification dans le calendrier
**Duree** : 8 secondes
**Narration** : "Vous pouvez verifier l'absence dans le calendrier des absences."
**Ecran** :
- [SIDEBAR] Item "Absences & Conges" maintenant surligne (actif)
- [HEADER] Inchange
- [CONTENU] Vue calendrier mensuel "Aout 2026". Grille avec noms employes a gauche, jours 1-31 en colonnes. Ligne "BIOUCAS Lidia" : cellules du 11 au 15 colorees en bleu clair (bg-blue-200) avec texte "CA". Autres absences visibles pour d'autres employes (barres orange pour maladie, vert pour formation)
- [CURSEUR] Survole la barre bleue de BIOUCAS Lidia du 11 au 15
- [TOOLTIP] Bulle au survol : "BIOUCAS Lidia - Conge annuel - 11/08 au 15/08/2026 (5j)"
**Action** : Aucune (observation finale)
**Transition** : Fondu sortant

---

## FONCTION 2 : Encoder une absence (Employe Self-service)
Duree video : 30 secondes
Nombre de frames : 5

### Frame 1 — Connexion Self-service
**Duree** : 5 secondes
**Narration** : "En tant qu'employe, vous pouvez demander un conge directement depuis le portail Self-service."
**Ecran** :
- [SIDEBAR] Menu reduit pour le role employe. Items visibles : Tableau de bord, Mes Absences, Mes Documents, Mon Salaire. Item "Self-service" surligne en bleu (actif). En bas : avatar "BIOUCAS Lidia" + email l.bioucas@workdays.be
- [HEADER] Barre blanche, date "mardi 4 aout 2026", pas de champ recherche avance (mode employe)
- [CONTENU] Page Self-service : titre "Mon espace" en h1 (text-2xl font-bold text-slate-900). Deux cartes en ligne :
  - Carte 1 : "Mes soldes conges" - CA : 15j restants (barre progression verte 75%), RTT : 140h52 restantes
  - Carte 2 : "Mes demandes recentes" - tableau 2 lignes : "CA 01/07-03/07" badge vert "Approuvee", "RTT 20/06" badge vert "Approuvee"
- Bouton bleu "Nouvelle demande" (bg-blue-600 rounded-md px-4 py-2) bien visible sous les cartes
- [CURSEUR] Au centre de l'ecran
**Action** : Le curseur se deplace vers le bouton "Nouvelle demande"
**Transition** : Clic, ouverture modale

### Frame 2 — Modale de demande d'absence
**Duree** : 7 secondes
**Narration** : "Le formulaire de demande apparait. Selectionnez le type de conge souhaite."
**Ecran** :
- [OVERLAY] Fond gris semi-transparent (bg-black/50)
- [MODALE] Centree, fond blanc, rounded-xl shadow-2xl, largeur max-w-lg. Header : "Nouvelle demande d'absence" (text-lg font-semibold) + bouton X en haut a droite. Corps :
  - Champ "Type de conge" : dropdown ouvert, options listees :
    - Conge annuel (CA) — surligne bg-blue-50
    - RTT
    - Conge sans solde
  - Champ "Du" : input date vide
  - Champ "Au" : input date vide
  - Champ "Motif / Commentaire" : textarea placeholder "Facultatif..."
  - Info : texte slate-500 "Votre demande sera soumise a l'approbation de votre responsable"
- [CURSEUR] Sur "Conge annuel (CA)"
**Action** : Selection CA, puis saisie dates 18/08/2026 au 19/08/2026
**Transition** : Champs se remplissent

### Frame 3 — Formulaire rempli, soumission
**Duree** : 6 secondes
**Narration** : "Verifiez les informations et soumettez votre demande."
**Ecran** :
- [MODALE] Formulaire rempli :
  - Type : "Conge annuel (CA)"
  - Du : "18/08/2026"
  - Au : "19/08/2026"
  - Motif : "Rendez-vous administratif"
  - Encadre info (bg-amber-50 border-amber-200) : "2 jours ouvrables seront deduits. Solde restant : 13 jours"
  - Footer modale : bouton "Annuler" (text-slate-600, bg-white border) + bouton "Soumettre" (bg-blue-600 text-white)
- [CURSEUR] Sur le bouton "Soumettre"
**Action** : Clic sur "Soumettre"
**Transition** : Spinner 1s puis modale se ferme

### Frame 4 — Confirmation et statut En attente
**Duree** : 6 secondes
**Narration** : "Votre demande est envoyee. Elle apparait avec le statut En attente."
**Ecran** :
- [MODALE] Fermee
- [CONTENU] Retour sur la page Self-service. Carte "Mes demandes recentes" mise a jour :
  - Nouvelle ligne en haut du tableau : "CA 18/08-19/08" + badge jaune/amber (bg-amber-100 text-amber-800 rounded-full px-2 py-0.5) "En attente"
  - Lignes precedentes toujours visibles en dessous
- [TOAST] Notification toast en haut a droite : fond bleu (bg-blue-50 border-blue-200), icone info, "Demande soumise. Votre responsable sera notifie."
- [CURSEUR] Au centre
**Action** : Aucune (observation)
**Transition** : Toast disparait

### Frame 5 — Email/notification au manager (schema)
**Duree** : 6 secondes
**Narration** : "Votre responsable recoit une notification pour approuver ou refuser la demande."
**Ecran** :
- [CONTENU] Ecran divise en deux (illustration pedagogique) :
  - Gauche (60%) : ecran de l'employe avec le badge "En attente" visible
  - Droite (40%) : representation d'une notification (encadre avec icone cloche) :
    - Titre : "Nouvelle demande de conge"
    - Texte : "BIOUCAS Lidia demande un CA du 18/08 au 19/08/2026 (2j)"
    - Boutons : "Voir la demande" en bleu
  - Fleche animee pointant de gauche vers droite
- [CURSEUR] Non visible (frame pedagogique)
**Action** : Aucune
**Transition** : Fondu sortant

---

## FONCTION 3 : Consulter le calendrier annuel
Duree video : 35 secondes
Nombre de frames : 6

### Frame 1 — Navigation vers Absences & Conges
**Duree** : 4 secondes
**Narration** : "Pour consulter le calendrier annuel des absences, rendez-vous dans le menu Absences et Conges."
**Ecran** :
- [SIDEBAR] Tous les items visibles, "Tableau de bord" actuellement actif (bg-blue-800)
- [HEADER] Inchange, date "mardi 4 aout 2026"
- [CONTENU] Dashboard standard avec KPIs
- [CURSEUR] Se deplace vers l'item "Absences & Conges" dans la sidebar
- [HIGHLIGHT] Item "Absences & Conges" encadre par un rectangle pointille jaune (annotation tutoriel)
**Action** : Clic sur "Absences & Conges"
**Transition** : Chargement de la page absences

### Frame 2 — Page Absences vue liste
**Duree** : 5 secondes
**Narration** : "La page des absences s'ouvre. Par defaut, la vue liste est affichee."
**Ecran** :
- [SIDEBAR] "Absences & Conges" maintenant actif (bg-blue-800, texte blanc)
- [HEADER] Inchange
- [CONTENU] Titre page "Absences & Conges" (text-2xl font-bold). Sous le titre : barre d'outils avec :
  - Onglets : "Liste" (actif, border-b-2 border-blue-600 text-blue-600) | "Calendrier" | "Soldes"
  - Filtres a droite : dropdown "Tous les services" + dropdown "Aout 2026" + input recherche
  - Tableau (vue liste) :
    - Header : Employe | Motif | Debut | Fin | Jours | Statut
    - Ligne 1 : BIOUCAS Lidia | CA | 11/08/2026 | 15/08/2026 | 5 | badge vert "Approuvee"
    - Ligne 2 : DUPONT Marie | Maladie | 05/08/2026 | 07/08/2026 | 3 | badge vert "Approuvee"
    - Ligne 3 : JANSSENS Pieter | RTT | 20/08/2026 | 20/08/2026 | 1 | badge amber "En attente"
    - Ligne 4 : BIOUCAS Lidia | CA | 18/08/2026 | 19/08/2026 | 2 | badge amber "En attente"
- [CURSEUR] Sur l'onglet "Calendrier"
**Action** : Clic sur l'onglet "Calendrier"
**Transition** : Vue bascule en mode calendrier

### Frame 3 — Vue calendrier mensuel
**Duree** : 7 secondes
**Narration** : "La vue calendrier affiche toutes les absences du mois sur une grille visuelle."
**Ecran** :
- [CONTENU] Onglet "Calendrier" actif (border-b-2 border-blue-600). Grille calendrier :
  - Axe Y (gauche) : noms employes avec avatar mini rond (BIOUCAS Lidia, DUPONT Marie, JANSSENS Pieter, LAMBERT Sophie, OUASSINI Youssef... 12 lignes visibles)
  - Axe X (haut) : jours 1-31 aout, format "L M M J V S D" repete. Samedi/dimanche en bg-slate-50 (grise)
  - Barres colorees :
    - BIOUCAS Lidia : barre bleue jours 11-15 ("CA"), barre bleue jours 18-19 ("CA") avec bordure pointillee (en attente)
    - DUPONT Marie : barre orange jours 5-7 ("MAL")
    - JANSSENS Pieter : barre violet jours 20 ("RTT") bordure pointillee
    - LAMBERT Sophie : barre verte jour 25 ("FOR")
  - Legende en bas : carre bleu "CA", carre orange "Maladie", carre violet "RTT", carre vert "Formation". Bordure pointillee = en attente
- [CURSEUR] Survole la barre bleue de BIOUCAS 11-15
**Action** : Survol pour afficher tooltip
**Transition** : Tooltip apparait

### Frame 4 — Tooltip detail absence
**Duree** : 5 secondes
**Narration** : "Survolez une barre pour voir le detail de l'absence."
**Ecran** :
- [CONTENU] Meme vue calendrier. Tooltip visible (bg-white shadow-lg rounded-lg p-3 border) positionne au-dessus de la barre survolee :
  - "BIOUCAS Lidia"
  - "Conge annuel (CA)"
  - "Du 11/08/2026 au 15/08/2026"
  - "5 jours ouvrables"
  - "Statut : Approuvee" (badge vert inline)
  - "Approuve par : OUASSINI Youssef"
- [CURSEUR] Sur la barre, tooltip visible
**Action** : Le curseur se deplace vers les fleches de navigation mois
**Transition** : Navigation vers un autre mois

### Frame 5 — Navigation entre mois
**Duree** : 5 secondes
**Narration** : "Utilisez les fleches pour naviguer entre les mois ou selectionnez directement un mois."
**Ecran** :
- [CONTENU] En haut du calendrier : navigation mois avec fleche gauche "<" + texte "Aout 2026" (font-semibold text-lg) + fleche droite ">". Le curseur clique sur ">" :
  - Transition : le calendrier glisse vers "Septembre 2026"
  - Nouvelles barres apparaissent pour septembre (moins d'absences : 2 barres visibles)
  - Dropdown mois visible aussi comme alternative (clic sur "Septembre 2026" ouvre un selecteur)
- [CURSEUR] Sur la fleche droite ">"
**Action** : Clic sur ">"
**Transition** : Calendrier passe a septembre

### Frame 6 — Filtrage par service
**Duree** : 9 secondes
**Narration** : "Vous pouvez filtrer le calendrier par service pour ne voir que votre equipe."
**Ecran** :
- [CONTENU] Retour sur Aout 2026. Le curseur ouvre le dropdown "Tous les services" :
  - Options : Tous les services (actif, check), ACCUEIL NON IFIC BAR 1/55, ADMINISTRATION, SOINS INFIRMIERS, DIRECTION, MAINTENANCE
  - Selection de "ACCUEIL NON IFIC BAR 1/55"
  - Le calendrier se filtre : seuls BIOUCAS Lidia et 3 autres employes du service sont visibles
  - Les barres restent identiques pour les employes filtres
  - Texte sous la grille : "4 employes affiches (service ACCUEIL NON IFIC BAR 1/55)"
- [CURSEUR] Sur l'option de service
**Action** : Selection du filtre
**Transition** : Fondu sortant

---

## FONCTION 4 : Voir les soldes conges
Duree video : 20 secondes
Nombre de frames : 3

### Frame 1 — Acces a l'onglet Soldes
**Duree** : 5 secondes
**Narration** : "Pour consulter les soldes de conges de vos employes, cliquez sur l'onglet Soldes."
**Ecran** :
- [SIDEBAR] "Absences & Conges" actif
- [HEADER] Inchange
- [CONTENU] Page Absences & Conges, onglets visibles : "Liste" | "Calendrier" | "Soldes". Onglet "Soldes" encadre par annotation jaune pointillee
- [CURSEUR] Sur l'onglet "Soldes"
**Action** : Clic sur "Soldes"
**Transition** : Affichage tableau des soldes

### Frame 2 — Tableau des soldes par employe
**Duree** : 8 secondes
**Narration** : "Le tableau affiche les soldes de chaque employe : conges annuels, RTT et autres types."
**Ecran** :
- [CONTENU] Onglet "Soldes" actif (border-b-2 border-blue-600). Tableau pleine largeur :
  - Header (bg-slate-50 text-slate-600 font-medium text-sm) : Employe | Service | CA Total | CA Pris | CA Reste | RTT Total | RTT Pris | RTT Reste
  - Ligne 1 (bg-white) : BIOUCAS Lidia | ACCUEIL NON IFIC BAR 1/55 | 20j | 5j | **15j** (font-semibold text-emerald-600) | 152h00 | 11h08 | **140h52** (text-emerald-600)
  - Ligne 2 (bg-slate-50 alternee) : DUPONT Marie | ADMINISTRATION | 20j | 12j | **8j** (text-amber-600) | 152h00 | 95h00 | **57h00** (text-amber-600)
  - Ligne 3 : JANSSENS Pieter | SOINS INFIRMIERS | 25j | 20j | **5j** (text-red-600) | 152h00 | 140h00 | **12h00** (text-red-600)
  - Ligne 4 : LAMBERT Sophie | MAINTENANCE | 20j | 3j | **17j** (text-emerald-600) | 152h00 | 0h00 | **152h00** (text-emerald-600)
  - ... (scroll possible, 12 lignes visibles)
  - Code couleur soldes : vert (>50%), amber (25-50%), rouge (<25%)
- Barre de recherche au-dessus du tableau : "Filtrer par nom..." + dropdown "Tous les services"
- [CURSEUR] Survole la ligne BIOUCAS Lidia (fond hover bg-blue-50)
**Action** : Survol de la ligne pour mettre en evidence
**Transition** : Vers frame suivante

### Frame 3 — Detail solde individuel
**Duree** : 7 secondes
**Narration** : "Cliquez sur un employe pour voir le detail de ses prises et son historique."
**Ecran** :
- [CONTENU] Panneau detail qui s'ouvre (slide-in depuis la droite ou expansion de la ligne) :
  - Titre : "Soldes conges - BIOUCAS Lidia" (text-lg font-semibold)
  - Section "Conge Annuel (CA)" :
    - Barre de progression (h-3 rounded-full) : 75% remplie en emerald-500, reste en slate-200
    - Texte : "15 jours restants sur 20" + "5 jours pris"
    - Detail des prises (liste) :
      - 01/07 - 03/07/2026 : 3j (badge vert "Approuve")
      - 11/08 - 15/08/2026 : 5j (badge vert "Approuve") -- la plus recente, surlignee
      - 18/08 - 19/08/2026 : 2j (badge amber "En attente")
  - Section "RTT" :
    - Barre de progression : 92% remplie en emerald-500
    - Texte : "140h52 restantes sur 152h00" + "11h08 prises"
    - Detail : 20/06/2026 : 3h30 (Approuve), 15/07/2026 : 7h38 (Approuve)
  - Bouton "Exporter PDF" (text-slate-600 border rounded-md) en bas
- [CURSEUR] Sur la barre de progression CA
**Action** : Aucune (observation)
**Transition** : Fondu sortant

---

## FONCTION 5 : Approuver/Refuser une demande
Duree video : 35 secondes
Nombre de frames : 6

### Frame 1 — Notification de demande en attente
**Duree** : 5 secondes
**Narration** : "En tant que manager, vous recevez une notification lorsqu'un employe soumet une demande."
**Ecran** :
- [SIDEBAR] "Tableau de bord" actif. Connecte en tant que OUASSINI Youssef (avatar en bas + "Directeur")
- [HEADER] Icone cloche avec badge rouge "1" (une notification non lue). Date "mardi 4 aout 2026"
- [CONTENU] Dashboard manager. Carte "Demandes en attente" en haut a droite : chiffre "2" en grand (text-3xl font-bold text-amber-600), sous-texte "demandes a traiter"
- [CURSEUR] Se deplace vers l'icone cloche
- [HIGHLIGHT] Icone cloche encadree annotation jaune
**Action** : Clic sur la cloche
**Transition** : Dropdown notifications s'ouvre

### Frame 2 — Dropdown notifications
**Duree** : 5 secondes
**Narration** : "Le panneau de notifications affiche les demandes recentes."
**Ecran** :
- [HEADER] Dropdown notifications ouvert (bg-white shadow-xl rounded-lg border, largeur w-80, max-h-96 overflow-y-auto) :
  - Header dropdown : "Notifications" (font-semibold) + lien "Tout marquer comme lu" a droite (text-blue-600 text-sm)
  - Notification 1 (bg-blue-50, non lue, point bleu a gauche) :
    - Icone calendrier bleu + "Demande de conge"
    - "BIOUCAS Lidia demande un CA du 18/08 au 19/08/2026"
    - "Il y a 2 heures" (text-slate-400 text-xs)
  - Notification 2 (bg-white, lue) :
    - Icone calendrier + "Demande RTT"
    - "JANSSENS Pieter demande un RTT le 20/08/2026"
    - "Il y a 5 heures"
  - Footer : "Voir toutes les notifications" (lien text-blue-600)
- [CURSEUR] Sur la notification 1 (BIOUCAS)
**Action** : Clic sur la notification BIOUCAS
**Transition** : Navigation vers la page de detail demande

### Frame 3 — Page detail demande
**Duree** : 6 secondes
**Narration** : "La page de detail affiche toutes les informations de la demande."
**Ecran** :
- [SIDEBAR] "Absences & Conges" actif
- [CONTENU] Page detail demande, structure en carte :
  - Header carte : "Demande #2024-087" (text-xl font-bold) + badge amber "En attente" a droite
  - Section informations (grid 2 colonnes) :
    - Employe : BIOUCAS Lidia (lien bleu)
    - Service : ACCUEIL NON IFIC BAR 1/55
    - Type : Conge annuel (CA)
    - Dates : 18/08/2026 au 19/08/2026
    - Duree : 2 jours ouvrables
    - Motif : "Rendez-vous administratif"
    - Soumise le : 04/08/2026 a 09:15
    - Solde actuel : 15 jours CA (apres : 13 jours)
  - Section "Historique equipe" : mini calendrier du service pour la semaine 18-22 aout, montrant les autres presences/absences
  - Zone action en bas (bg-slate-50 p-4 rounded-b-lg) :
    - Champ "Commentaire manager" : textarea placeholder "Ajouter un commentaire (facultatif)..."
    - Boutons : "Refuser" (bg-red-600 text-white rounded-md px-4 py-2) + "Approuver" (bg-emerald-600 text-white rounded-md px-4 py-2)
- [CURSEUR] Positionne entre les deux boutons
**Action** : Le curseur se deplace vers "Approuver"
**Transition** : Vers la frame suivante

### Frame 4 — Clic Approuver
**Duree** : 5 secondes
**Narration** : "Cliquez sur Approuver pour valider la demande."
**Ecran** :
- [CONTENU] Meme page. Le curseur est sur "Approuver" (bouton avec hover bg-emerald-700)
- [MODALE CONFIRMATION] Petite modale centree (max-w-sm) :
  - Icone check cercle vert en haut
  - Texte : "Confirmer l'approbation ?"
  - Sous-texte : "CA pour BIOUCAS Lidia du 18/08 au 19/08/2026 (2j)"
  - Boutons : "Annuler" (border) + "Confirmer" (bg-emerald-600)
- [CURSEUR] Sur "Confirmer"
**Action** : Clic sur "Confirmer"
**Transition** : Modale se ferme, statut mis a jour

### Frame 5 — Demande approuvee
**Duree** : 6 secondes
**Narration** : "La demande est approuvee. Le statut passe au vert."
**Ecran** :
- [CONTENU] Retour sur la page detail. Changements visibles :
  - Badge en haut : passe de amber "En attente" a vert "Approuvee" (bg-emerald-100 text-emerald-800)
  - Nouvelle ligne dans historique : "Approuvee par OUASSINI Youssef le 04/08/2026 a 14:30"
  - Zone action en bas : boutons disparus, remplace par texte "Cette demande a ete approuvee" avec check vert
- [TOAST] Toast vert en haut a droite : "Demande approuvee pour BIOUCAS Lidia"
- [CURSEUR] Au centre
**Action** : Aucune
**Transition** : Vers demonstration du refus

### Frame 6 — Demonstration du refus (alternative)
**Duree** : 8 secondes
**Narration** : "Pour refuser, cliquez sur Refuser. Un commentaire obligatoire est demande."
**Ecran** :
- [CONTENU] Nouvelle demande affichee (JANSSENS Pieter, RTT 20/08). Zone action visible :
  - Le curseur clique sur "Refuser" (bg-red-600)
  - Modale de refus apparait :
    - Icone X cercle rouge en haut
    - Texte : "Motif du refus"
    - Textarea obligatoire (border-red-300 si vide) : le curseur tape "Effectif insuffisant ce jour-la"
    - Boutons : "Annuler" + "Confirmer le refus" (bg-red-600)
  - Apres confirmation : badge passe en rouge "Refusee" (bg-red-100 text-red-800)
  - Historique : "Refusee par OUASSINI Youssef - Motif : Effectif insuffisant ce jour-la"
- [CURSEUR] Sur le bouton "Confirmer le refus"
**Action** : Clic confirmation
**Transition** : Fondu sortant

---

## FONCTION 6 : Creer un employe
Duree video : 30 secondes
Nombre de frames : 5

### Frame 1 — Navigation vers Personnel
**Duree** : 4 secondes
**Narration** : "Pour creer un nouvel employe, accedez au module Personnel."
**Ecran** :
- [SIDEBAR] Item "Personnel" encadre annotation jaune. Curseur se deplace dessus
- [HEADER] Inchange
- [CONTENU] Dashboard visible
- [CURSEUR] Sur "Personnel" dans la sidebar
**Action** : Clic sur "Personnel"
**Transition** : Page Personnel se charge

### Frame 2 — Page Personnel avec liste employes
**Duree** : 6 secondes
**Narration** : "La page Personnel affiche la liste de tous vos employes. Cliquez sur Ajouter."
**Ecran** :
- [SIDEBAR] "Personnel" actif (bg-blue-800)
- [CONTENU] Titre "Personnel" (text-2xl font-bold). Barre d'outils :
  - Bouton "+ Ajouter un employe" (bg-blue-600 text-white rounded-md px-4 py-2) a droite
  - Input recherche a gauche "Rechercher..." + dropdown "Tous les services" + dropdown "Tous les statuts"
  - Compteur : "47 employes" (text-sm text-slate-500)
  - Tableau employes :
    - Header (bg-slate-50) : Photo | Nom | Prenom | Service | Poste | Statut | Actions
    - Ligne 1 : avatar | BIOUCAS | Lidia | ACCUEIL NON IFIC BAR 1/55 | Accueil Diplome Sup. | badge vert "Actif" | icone oeil + crayon
    - Ligne 2 : avatar | DUPONT | Marie | ADMINISTRATION | Assistante admin | badge vert "Actif" | icones
    - Ligne 3 : avatar | JANSSENS | Pieter | SOINS INFIRMIERS | Infirmier chef | badge vert "Actif" | icones
    - ... (pagination en bas : "Page 1 sur 5" + fleches)
- [CURSEUR] Sur le bouton "+ Ajouter un employe"
- [HIGHLIGHT] Bouton encadre annotation jaune
**Action** : Clic sur "+ Ajouter un employe"
**Transition** : Ouverture formulaire creation

### Frame 3 — Formulaire creation employe (etape 1 - Identite)
**Duree** : 8 secondes
**Narration** : "Remplissez les informations d'identite du nouvel employe."
**Ecran** :
- [CONTENU] Page formulaire multi-etapes. Stepper en haut :
  - Etape 1 : "Identite" (cercle bleu plein, actif) — Etape 2 : "Contrat" (cercle gris) — Etape 3 : "Affectation" (cercle gris) — Etape 4 : "Confirmation" (cercle gris)
  - Lignes connectant les cercles (bleu pour complete, gris pour a venir)
- Formulaire (grid 2 colonnes, gap-4) :
  - Nom* : input rempli "MARTINEZ"
  - Prenom* : input rempli "Carlos"
  - Date de naissance* : "15/03/1988"
  - Numero national* : "88.03.15-123.45"
  - Genre : radio "M" selectionne (cercle bleu) / "F" / "Autre"
  - Nationalite : dropdown "Belge"
  - Adresse : "Rue de la Loi 42, 1000 Bruxelles"
  - Telephone : "+32 472 123 456"
  - Email personnel : "c.martinez@email.be"
  - Photo : zone drag-and-drop (border-dashed border-slate-300 rounded-lg p-6) "Glissez une photo ou cliquez pour parcourir"
- Footer : bouton "Suivant" (bg-blue-600) a droite
- [CURSEUR] Remplissant les champs (animation de frappe)
**Action** : Champs se remplissent, clic "Suivant"
**Transition** : Passage etape 2

### Frame 4 — Formulaire creation (etape 2 - Contrat + etape 3 - Affectation)
**Duree** : 7 secondes
**Narration** : "Definissez le type de contrat et l'affectation au service."
**Ecran** :
- [CONTENU] Stepper : etape 1 check vert, etape 2 active (bleu), etapes 3-4 grises. Formulaire :
  - Type de contrat* : dropdown "CDI" selectionne
  - Date d'entree* : "01/09/2026"
  - Regime horaire* : dropdown "Temps plein (38h/semaine)"
  - Salaire brut mensuel : "3.200,00 EUR"
  - Puis transition rapide vers etape 3 :
    - Stepper : etapes 1-2 check vert, etape 3 active
    - Service* : dropdown "ACCUEIL NON IFIC BAR 1/55" selectionne
    - Poste* : input "Accueil"
    - Responsable hierarchique* : dropdown "OUASSINI Youssef - Directeur"
    - Bureau/Localisation : "Batiment A - RDC"
- Footer : "Precedent" (text-slate-600 border) + "Suivant" (bg-blue-600)
- [CURSEUR] Clic sur "Suivant"
**Action** : Progression dans le formulaire
**Transition** : Passage etape 4

### Frame 5 — Confirmation et creation
**Duree** : 5 secondes
**Narration** : "Verifiez le recapitulatif et confirmez la creation."
**Ecran** :
- [CONTENU] Stepper : etapes 1-3 check vert, etape 4 "Confirmation" active. Recapitulatif en carte :
  - Section "Identite" : MARTINEZ Carlos, ne le 15/03/1988, Belge
  - Section "Contrat" : CDI, entree 01/09/2026, temps plein, 3.200 EUR brut
  - Section "Affectation" : ACCUEIL NON IFIC BAR 1/55, responsable OUASSINI Youssef
  - Chaque section avec icone crayon pour editer
  - Checkbox : "Envoyer un email d'invitation au nouvel employe" (coche)
  - Bouton "Creer l'employe" (bg-emerald-600 text-white rounded-md px-6 py-2.5 font-semibold)
- [CURSEUR] Sur "Creer l'employe"
**Action** : Clic, spinner 1s
**Transition** : Toast vert "Employe MARTINEZ Carlos cree avec succes", redirection vers la fiche employe. Fondu sortant.

---

## FONCTION 7 : Modifier une fiche employe
Duree video : 25 secondes
Nombre de frames : 4

### Frame 1 — Acces a la fiche employe
**Duree** : 5 secondes
**Narration** : "Pour modifier les informations d'un employe, ouvrez sa fiche depuis la liste Personnel."
**Ecran** :
- [SIDEBAR] "Personnel" actif
- [CONTENU] Tableau Personnel visible. Ligne BIOUCAS Lidia survolée (bg-blue-50). Colonne Actions : icone crayon (edit) encadree annotation jaune
- [CURSEUR] Sur l'icone crayon de la ligne BIOUCAS
**Action** : Clic sur l'icone crayon
**Transition** : Page fiche employe s'ouvre

### Frame 2 — Fiche employe en mode consultation
**Duree** : 6 secondes
**Narration** : "La fiche employe s'affiche. Cliquez sur Modifier pour editer les informations."
**Ecran** :
- [CONTENU] Page fiche employe, layout en header + tabs :
  - Header fiche : grande carte avec fond gradient bleu subtil (bg-gradient-to-r from-blue-50 to-white). Photo employe (rond 80px) + Nom "BIOUCAS Lidia" (text-2xl font-bold) + Poste "Accueil Diplome Superieur" (text-slate-500) + Badge vert "Actif" + Service "ACCUEIL NON IFIC BAR 1/55"
  - Boutons en haut a droite : "Modifier" (bg-blue-600 text-white) + "..." (menu more)
  - Onglets sous le header : Informations | Contrat | Absences | Documents | Historique
  - Onglet "Informations" actif. Grid 2 colonnes :
    - Gauche : Nom, Prenom, Date naissance (15/04/1990), Numero national, Genre (F), Nationalite (Belge)
    - Droite : Adresse, Telephone (+32 474 xxx xxx), Email, Contact urgence
  - Chaque champ en mode lecture (text-slate-900 sur fond neutre)
- [CURSEUR] Sur le bouton "Modifier" en haut a droite
**Action** : Clic sur "Modifier"
**Transition** : Passage en mode edition

### Frame 3 — Fiche en mode edition
**Duree** : 8 secondes
**Narration** : "Les champs deviennent editables. Modifiez les informations souhaitees."
**Ecran** :
- [CONTENU] Meme layout mais les champs sont maintenant des inputs editables (border border-slate-300 rounded-md bg-white) :
  - Le champ "Telephone" est en focus (border-blue-500 ring-2 ring-blue-200), valeur modifiee de "+32 474 123 456" a "+32 474 987 654" (texte bleu pour montrer la modification)
  - Le champ "Adresse" modifie : nouvelle valeur "Avenue Louise 150, 1050 Ixelles"
  - Champs modifies ont un indicateur point bleu a gauche
  - Bandeau sticky en bas (bg-white border-t shadow-lg p-4) :
    - Texte "2 modifications non sauvegardees" (text-amber-600)
    - Boutons : "Annuler les modifications" (text-slate-600) + "Sauvegarder" (bg-blue-600 text-white)
- [CURSEUR] Sur le bouton "Sauvegarder"
**Action** : Clic sur "Sauvegarder"
**Transition** : Sauvegarde en cours

### Frame 4 — Confirmation sauvegarde
**Duree** : 6 secondes
**Narration** : "Les modifications sont enregistrees. L'historique conserve une trace des changements."
**Ecran** :
- [CONTENU] Retour mode consultation. Les nouvelles valeurs sont affichees :
  - Telephone : "+32 474 987 654"
  - Adresse : "Avenue Louise 150, 1050 Ixelles"
  - Onglet "Historique" clignote brievement (indicateur de mise a jour)
- [TOAST] Toast vert : "Fiche employe mise a jour avec succes"
- [CONTENU ADDITIONNEL] Clic rapide sur onglet "Historique" montrant :
  - Tableau chronologique :
    - 04/08/2026 14:45 | OUASSINI Youssef | Modification telephone | +32 474 123 456 -> +32 474 987 654
    - 04/08/2026 14:45 | OUASSINI Youssef | Modification adresse | Rue... -> Avenue Louise 150...
- [CURSEUR] Sur l'onglet Historique
**Action** : Observation
**Transition** : Fondu sortant

---

## FONCTION 8 : Configurer l'organigramme
Duree video : 30 secondes
Nombre de frames : 5

### Frame 1 — Acces au module Organigramme
**Duree** : 5 secondes
**Narration** : "L'organigramme permet de visualiser la structure hierarchique de votre organisation."
**Ecran** :
- [SIDEBAR] "Personnel" actif. Sous-menu deploye montrant "Organigramme" comme sous-item
- [HEADER] Inchange
- [CONTENU] Page Personnel avec un onglet ou lien "Organigramme" visible dans la navigation secondaire
- [CURSEUR] Sur "Organigramme"
**Action** : Clic sur "Organigramme"
**Transition** : Affichage de l'organigramme

### Frame 2 — Vue organigramme hierarchique
**Duree** : 7 secondes
**Narration** : "L'organigramme s'affiche sous forme d'arbre hierarchique. Chaque noeud represente un employe."
**Ecran** :
- [CONTENU] Titre "Organigramme" (text-2xl font-bold). Barre d'outils :
  - Boutons vue : "Arbre" (actif, bg-blue-100 text-blue-700) | "Liste" | "Grille"
  - Bouton "Modifier" (bg-blue-600) a droite
  - Zoom : slider + boutons +/-
- Arbre hierarchique (orgchart) centre :
  - Niveau 1 (racine) : Carte OUASSINI Youssef - Directeur (border-2 border-blue-500, bg-white shadow-md rounded-lg p-3). Avatar + nom + poste
  - Niveau 2 (3 branches avec lignes connectrices grises) :
    - Carte "DUPONT Marie - Resp. Administration" (border border-slate-200)
    - Carte "BIOUCAS Lidia - Accueil Diplome Sup." (border border-slate-200)
    - Carte "VAN DEN BERG Koen - Resp. Soins" (border border-slate-200)
  - Niveau 3 sous VAN DEN BERG :
    - "JANSSENS Pieter - Infirmier chef"
    - "LAMBERT Sophie - Maintenance"
  - Lignes de connexion : trait gris (stroke-slate-300) reliant parent a enfants
- [CURSEUR] Sur le bouton "Modifier"
**Action** : Clic sur "Modifier"
**Transition** : Mode edition s'active

### Frame 3 — Mode edition de l'organigramme
**Duree** : 7 secondes
**Narration** : "En mode edition, vous pouvez reorganiser les positions par glisser-deposer."
**Ecran** :
- [CONTENU] Meme arbre mais avec indicateurs d'edition :
  - Bandeau jaune en haut (bg-amber-50 border-amber-200 p-2 rounded) : "Mode edition actif - Glissez les cartes pour reorganiser"
  - Chaque carte a un indicateur drag (6 points en haut a gauche, text-slate-400) et un bouton X (supprimer le lien)
  - La carte "BIOUCAS Lidia" est en train d'etre deplacee (shadow-2xl, scale-105, opacity-90, position ghostee)
  - Zone de drop surlignee en bleu (border-2 border-dashed border-blue-400 bg-blue-50) sous "VAN DEN BERG Koen"
  - Lignes de connexion deviennent pointillees pendant le drag
- [CURSEUR] Drag en cours, deplace la carte BIOUCAS
**Action** : Drop de la carte sous un nouveau parent
**Transition** : Reorganisation s'anime

### Frame 4 — Ajout d'un nouveau lien hierarchique
**Duree** : 6 secondes
**Narration** : "Vous pouvez aussi ajouter un nouveau lien hierarchique manuellement."
**Ecran** :
- [CONTENU] Organigramme reorganise. BIOUCAS est maintenant sous VAN DEN BERG (nouveau parent). Bouton "+ Ajouter un lien" (text-blue-600 border-blue-300 border-dashed rounded-md) visible en bas. Modale d'ajout ouverte :
  - Titre : "Nouveau lien hierarchique"
  - Champ "Responsable" : dropdown avec "VAN DEN BERG Koen" selectionne
  - Champ "Subordonne" : dropdown avec autocomplete, "MARTINEZ Carlos" selectionne
  - Champ "Type de lien" : radio "Hierarchique direct" (selectionne) / "Fonctionnel"
  - Boutons : "Annuler" + "Ajouter" (bg-blue-600)
- [CURSEUR] Sur "Ajouter"
**Action** : Clic "Ajouter"
**Transition** : Nouveau noeud apparait dans l'arbre

### Frame 5 — Sauvegarde de l'organigramme
**Duree** : 5 secondes
**Narration** : "Sauvegardez vos modifications pour les appliquer."
**Ecran** :
- [CONTENU] Organigramme mis a jour avec MARTINEZ Carlos visible sous VAN DEN BERG. Bandeau sticky en bas :
  - "3 modifications non sauvegardees" (text-amber-600)
  - Boutons : "Annuler tout" (text-slate-600) + "Sauvegarder l'organigramme" (bg-emerald-600 text-white)
- [CURSEUR] Sur "Sauvegarder l'organigramme"
**Action** : Clic sauvegarde
**Transition** : Toast vert "Organigramme mis a jour avec succes". Bandeau edition disparait. Mode consultation retrouve. Fondu sortant.

---

## FONCTION 9 : Consulter le salaire
Duree video : 25 secondes
Nombre de frames : 4

### Frame 1 — Navigation vers Remuneration
**Duree** : 5 secondes
**Narration** : "Pour consulter les informations salariales, accedez au module Remuneration."
**Ecran** :
- [SIDEBAR] Item "Remuneration" encadre annotation jaune
- [HEADER] Inchange
- [CONTENU] Dashboard visible
- [CURSEUR] Sur "Remuneration" dans la sidebar
**Action** : Clic sur "Remuneration"
**Transition** : Page Remuneration se charge

### Frame 2 — Page Remuneration vue globale
**Duree** : 6 secondes
**Narration** : "La page affiche un apercu global de la masse salariale et les fiches individuelles."
**Ecran** :
- [SIDEBAR] "Remuneration" actif (bg-blue-800)
- [CONTENU] Titre "Remuneration" (text-2xl font-bold). Layout :
  - 3 cartes KPI en ligne :
    - "Masse salariale mensuelle" : 156.800 EUR (text-2xl font-bold text-slate-900) + fleche verte "+2.1% vs mois precedent"
    - "Salaire moyen" : 3.336 EUR (text-2xl font-bold)
    - "Effectif remunere" : 47 personnes
  - Sous les KPI : onglets "Fiches de paie" (actif) | "Historique" | "Parametres"
  - Tableau fiches de paie mois courant (Aout 2026) :
    - Header : Employe | Brut | Cotisations | Net | Statut
    - Ligne 1 : BIOUCAS Lidia | 2.850,00 EUR | 892,45 EUR | 1.957,55 EUR | badge vert "Validee"
    - Ligne 2 : DUPONT Marie | 3.100,00 EUR | 969,65 EUR | 2.130,35 EUR | badge vert "Validee"
    - Ligne 3 : JANSSENS Pieter | 3.450,00 EUR | 1.079,10 EUR | 2.370,90 EUR | badge amber "En preparation"
    - ... (scroll)
- [CURSEUR] Sur la ligne BIOUCAS Lidia
**Action** : Clic sur la ligne BIOUCAS
**Transition** : Ouverture detail salaire

### Frame 3 — Fiche de paie detaillee
**Duree** : 8 secondes
**Narration** : "La fiche detaillee montre la decomposition complete du salaire."
**Ecran** :
- [CONTENU] Page detail fiche de paie. Header : "Fiche de paie - BIOUCAS Lidia - Aout 2026" + bouton "Telecharger PDF" (icone download + text-blue-600 border rounded-md)
  - Carte principale (divide-y divide-slate-100) :
    - Section "Salaire brut" :
      - Salaire de base : 2.650,00 EUR
      - Prime anciennete : 150,00 EUR
      - Complement sectoriel : 50,00 EUR
      - **Total brut : 2.850,00 EUR** (font-bold)
    - Section "Retenues" :
      - ONSS (13,07%) : -372,50 EUR
      - Precompte professionnel : -456,80 EUR
      - Cotisation speciale secu sociale : -63,15 EUR
      - **Total retenues : -892,45 EUR** (font-bold text-red-600)
    - Section "Net a payer" :
      - **1.957,55 EUR** (text-2xl font-bold text-emerald-600)
      - Verse le : 25/08/2026
      - Compte : BE68 5390 0754 xxxx
    - Section "Conges payes deduits ce mois" :
      - CA : 5 jours (11/08 - 15/08)
- [CURSEUR] Survole les differentes sections
**Action** : Observation des details
**Transition** : Vers l'historique

### Frame 4 — Historique des salaires
**Duree** : 6 secondes
**Narration** : "L'historique permet de comparer les salaires sur plusieurs mois."
**Ecran** :
- [CONTENU] Onglet "Historique" actif. Graphique en barres (chart.js/recharts style) :
  - Axe X : Jan 2026, Fev 2026, ..., Aout 2026 (8 barres)
  - Axe Y : montant en EUR (0 a 3000)
  - Barres bleues (salaire brut) : ~2850 EUR stable
  - Ligne verte superposee (net) : ~1950 EUR stable
  - Mois aout surligne (barre plus large ou encadree)
  - Legende : carre bleu "Brut" + ligne verte "Net"
  - Sous le graphique : tableau recapitulatif simplifie des 6 derniers mois
- Bouton "Exporter historique CSV" (text-slate-600 border rounded-md) en haut a droite
- [CURSEUR] Survole la barre d'aout (tooltip : "Aout 2026 - Brut: 2.850 EUR / Net: 1.957,55 EUR")
**Action** : Observation
**Transition** : Fondu sortant

---

## FONCTION 10 : Simulateur salaire
Duree video : 25 secondes
Nombre de frames : 4

### Frame 1 — Acces au simulateur
**Duree** : 5 secondes
**Narration** : "Le simulateur de salaire permet de projeter l'impact d'une augmentation ou d'un changement de regime."
**Ecran** :
- [SIDEBAR] "Remuneration" actif
- [CONTENU] Page Remuneration. Un bouton "Simulateur" (bg-white border border-blue-300 text-blue-600 rounded-md px-4 py-2, icone calculatrice) visible dans la barre d'outils sous le titre
- [CURSEUR] Sur le bouton "Simulateur"
- [HIGHLIGHT] Bouton encadre annotation jaune
**Action** : Clic sur "Simulateur"
**Transition** : Page simulateur s'ouvre

### Frame 2 — Formulaire de simulation
**Duree** : 7 secondes
**Narration** : "Configurez les parametres de votre simulation : employe, nouveau brut, regime horaire."
**Ecran** :
- [CONTENU] Page "Simulateur de salaire" (text-2xl font-bold). Deux colonnes :
  - Colonne gauche (formulaire, 60%) :
    - Champ "Employe" : autocomplete, "BIOUCAS Lidia" selectionne
    - Champ "Salaire brut actuel" : affiche "2.850,00 EUR" (text-slate-500, lecture seule, bg-slate-50)
    - Champ "Nouveau salaire brut" : input editable, valeur saisie "3.100,00 EUR" (border-blue-500 focus)
    - Champ "Regime horaire" : dropdown "Temps plein (38h)" selectionne
    - Champ "Situation familiale" : dropdown "Isolee, 0 enfant"
    - Checkbox : "Inclure avantages en nature (voiture, GSM)" non coche
    - Bouton "Calculer" (bg-blue-600 text-white rounded-md px-6 py-2.5)
  - Colonne droite (resultats, 40%) : zone grisee "Lancez une simulation pour voir les resultats" (text-slate-400 italic, bg-slate-50 rounded-lg p-8 text-center)
- [CURSEUR] Sur le bouton "Calculer"
**Action** : Clic sur "Calculer"
**Transition** : Resultats apparaissent a droite

### Frame 3 — Resultats de simulation
**Duree** : 8 secondes
**Narration** : "Les resultats montrent l'impact sur le net et la comparaison avec le salaire actuel."
**Ecran** :
- [CONTENU] Meme layout. Colonne droite maintenant remplie (bg-white border rounded-lg p-6 shadow-sm) :
  - Titre : "Resultat de la simulation" (font-semibold text-lg)
  - Tableau comparatif :
    - Header : | | Actuel | Simule | Difference
    - Brut : 2.850,00 | 3.100,00 | +250,00 (text-emerald-600)
    - ONSS : -372,50 | -405,17 | -32,67
    - Precompte : -456,80 | -502,30 | -45,50
    - Cotisation speciale : -63,15 | -68,90 | -5,75
    - **Net** : **1.957,55** | **2.123,63** | **+166,08** (text-emerald-600 font-bold text-lg)
  - Encadre vert (bg-emerald-50 border-emerald-200 p-3 rounded-md) :
    - "Gain net mensuel : +166,08 EUR (+8,5%)"
    - "Gain net annuel estime : +1.992,96 EUR"
  - Texte disclaimer (text-xs text-slate-400) : "Simulation indicative basee sur les baremes 2026"
- [CURSEUR] Survole le tableau comparatif
**Action** : Observation des resultats
**Transition** : Vers export

### Frame 4 — Export et sauvegarde simulation
**Duree** : 5 secondes
**Narration** : "Vous pouvez exporter la simulation en PDF ou la sauvegarder pour reference."
**Ecran** :
- [CONTENU] Meme vue. Sous les resultats, deux boutons :
  - "Exporter PDF" (icone PDF + text-blue-600 border rounded-md px-3 py-1.5)
  - "Sauvegarder la simulation" (icone bookmark + text-slate-600 border rounded-md px-3 py-1.5)
  - Le curseur clique sur "Exporter PDF"
  - Indicateur de telechargement : toast bleu "Simulation exportee en PDF" + icone download
- [CURSEUR] Sur "Exporter PDF"
**Action** : Clic export
**Transition** : Fondu sortant

---

## FONCTION 11 : Alertes augmentation
Duree video : 20 secondes
Nombre de frames : 3

### Frame 1 — Indicateur d'alerte sur le tableau de bord
**Duree** : 6 secondes
**Narration** : "Le systeme vous alerte automatiquement lorsqu'un employe est eligible a une augmentation."
**Ecran** :
- [SIDEBAR] "Tableau de bord" actif
- [HEADER] Icone cloche avec badge "2" rouge
- [CONTENU] Dashboard. Carte speciale "Alertes RH" (border-l-4 border-amber-500 bg-amber-50 rounded-r-lg p-4) :
  - Icone alerte triangle amber + titre "Augmentations a prevoir" (font-semibold text-amber-800)
  - Texte : "2 employes sont eligibles a une augmentation barémique"
  - Lien "Voir le detail" (text-blue-600 underline)
- [CURSEUR] Sur "Voir le detail"
- [HIGHLIGHT] Carte encadree annotation jaune
**Action** : Clic sur "Voir le detail"
**Transition** : Navigation vers page alertes

### Frame 2 — Liste des alertes augmentation
**Duree** : 8 secondes
**Narration** : "La liste detaille chaque employe concerne avec le montant prevu de l'augmentation."
**Ecran** :
- [SIDEBAR] "Remuneration" actif
- [CONTENU] Page "Alertes augmentation" (text-2xl font-bold). Tableau :
  - Header (bg-slate-50) : Employe | Service | Anciennete | Echelon actuel | Nouvel echelon | Augmentation prevue | Echeance | Action
  - Ligne 1 (bg-amber-50 border-l-4 border-amber-400) : BIOUCAS Lidia | ACCUEIL... | 5 ans | Echelon 4 | Echelon 5 | +120,00 EUR brut | 01/09/2026 | bouton "Traiter" (bg-blue-600 text-white text-sm rounded px-2 py-1)
  - Ligne 2 (bg-amber-50 border-l-4 border-amber-400) : JANSSENS Pieter | SOINS... | 10 ans | Echelon 8 | Echelon 9 | +180,00 EUR brut | 01/09/2026 | bouton "Traiter"
  - Info box (bg-blue-50 border-blue-200 rounded-md p-3) : "Ces augmentations sont basees sur les baremes sectoriels CP330. Echeance : debut de mois suivant l'anniversaire d'anciennete."
- [CURSEUR] Sur le bouton "Traiter" de BIOUCAS
**Action** : Clic sur "Traiter"
**Transition** : Modale de traitement

### Frame 3 — Traitement de l'alerte
**Duree** : 6 secondes
**Narration** : "Validez ou reportez l'augmentation. Le salaire sera mis a jour automatiquement."
**Ecran** :
- [MODALE] Centree, max-w-md :
  - Titre : "Traiter l'augmentation - BIOUCAS Lidia"
  - Recapitulatif :
    - Echelon actuel : 4 (2.850,00 EUR brut)
    - Nouvel echelon : 5 (2.970,00 EUR brut)
    - Augmentation : +120,00 EUR brut (+4,2%)
    - Date d'effet : 01/09/2026
  - Options radio :
    - "Appliquer l'augmentation" (selectionne, cercle bleu)
    - "Reporter a une date ulterieure" (non selectionne)
    - "Ignorer (augmentation non applicable)" (non selectionne)
  - Boutons : "Annuler" (border) + "Confirmer" (bg-emerald-600 text-white)
- [CURSEUR] Sur "Confirmer"
**Action** : Clic confirmer
**Transition** : Toast vert "Augmentation validee pour BIOUCAS Lidia - Effet au 01/09/2026". Ligne disparait du tableau alertes. Fondu sortant.

---

## FONCTION 12 : Creer un rapport dynamique
Duree video : 45 secondes
Nombre de frames : 8

### Frame 1 — Navigation vers Rapports
**Duree** : 4 secondes
**Narration** : "Pour creer un rapport personnalise, accedez au module Rapports."
**Ecran** :
- [SIDEBAR] Item "Rapports" encadre annotation jaune
- [HEADER] Inchange
- [CONTENU] Dashboard visible
- [CURSEUR] Sur "Rapports" dans la sidebar
**Action** : Clic sur "Rapports"
**Transition** : Page Rapports se charge

### Frame 2 — Page Rapports avec rapports existants
**Duree** : 5 secondes
**Narration** : "La page Rapports liste les rapports existants et permet d'en creer de nouveaux."
**Ecran** :
- [SIDEBAR] "Rapports" actif (bg-blue-800)
- [CONTENU] Titre "Rapports" (text-2xl font-bold). Layout :
  - Bouton "+ Nouveau rapport" (bg-blue-600 text-white rounded-md px-4 py-2) en haut a droite
  - Grille de cartes (3 colonnes) rapports sauvegardes :
    - Carte 1 : icone graphique + "Absences par service" + "Derniere execution : 01/08/2026" + badge "Mensuel"
    - Carte 2 : icone tableau + "Effectifs par contrat" + "Derniere execution : 15/07/2026" + badge "Ponctuel"
    - Carte 3 : icone camembert + "Repartition salariale" + "Derniere execution : 01/08/2026" + badge "Mensuel"
    - Carte vide avec border-dashed : "+ Creer un rapport"
  - Chaque carte : bg-white border rounded-lg shadow-sm p-4, hover:shadow-md transition
- [CURSEUR] Sur "+ Nouveau rapport"
**Action** : Clic sur "+ Nouveau rapport"
**Transition** : Assistant de creation s'ouvre

### Frame 3 — Assistant rapport - Etape 1 : Type
**Duree** : 6 secondes
**Narration** : "L'assistant vous guide etape par etape. Choisissez d'abord le type de rapport."
**Ecran** :
- [CONTENU] Page creation rapport. Stepper : Etape 1 "Type" (active) — Etape 2 "Donnees" — Etape 3 "Filtres" — Etape 4 "Mise en forme" — Etape 5 "Apercu"
  - Titre : "Quel type de rapport souhaitez-vous creer ?"
  - Grid de choix (3 cartes selectionnables) :
    - Carte "Tableau" (icone table, selectionnee : border-2 border-blue-500 bg-blue-50) : "Donnees en lignes et colonnes"
    - Carte "Graphique" (icone bar-chart) : "Visualisation graphique des donnees"
    - Carte "Mixte" (icone layout) : "Tableau + graphique"
  - Selection actuelle : "Tableau" (coche bleue en coin)
- Footer : bouton "Suivant" (bg-blue-600) a droite
- [CURSEUR] Sur la carte "Tableau" (selectionnee)
**Action** : Clic "Suivant"
**Transition** : Passage etape 2

### Frame 4 — Assistant rapport - Etape 2 : Donnees
**Duree** : 7 secondes
**Narration** : "Selectionnez les colonnes de donnees a inclure dans votre rapport."
**Ecran** :
- [CONTENU] Stepper : etape 1 check, etape 2 "Donnees" active. Layout deux panneaux :
  - Panneau gauche "Colonnes disponibles" (bg-slate-50 rounded-lg p-4, h-96 overflow-y-auto) :
    - Categories depliables :
      - "Employe" (deplie) : Nom, Prenom, Service, Poste, Date entree, Statut
      - "Absences" (deplie) : Type absence, Date debut, Date fin, Nb jours, Statut demande
      - "Remuneration" (replie) : Brut, Net, Anciennete...
    - Chaque item est un tag draggable (bg-white border rounded px-2 py-1 text-sm cursor-grab)
  - Panneau droite "Colonnes selectionnees" (bg-white border-2 border-dashed border-blue-300 rounded-lg p-4) :
    - Items glisses (ordre) : 
      1. "Nom" (bg-blue-100 border-blue-300 rounded px-2 py-1) + icone poignee + X
      2. "Prenom" (bg-blue-100...)
      3. "Service" (bg-blue-100...)
      4. "Type absence" (bg-blue-100...)
      5. "Nb jours" (bg-blue-100...)
    - Zone drop vide en bas (placeholder "Glissez d'autres colonnes ici")
- [CURSEUR] Drag de "Date debut" vers le panneau droite
**Action** : Glisser-deposer d'une colonne supplementaire
**Transition** : Colonne ajoutee, clic Suivant

### Frame 5 — Assistant rapport - Etape 3 : Filtres
**Duree** : 6 secondes
**Narration** : "Ajoutez des filtres pour cibler les donnees souhaitees."
**Ecran** :
- [CONTENU] Stepper : etapes 1-2 check, etape 3 "Filtres" active. Formulaire filtres :
  - Section "Conditions" :
    - Ligne filtre 1 : dropdown "Service" + dropdown "egal a" + dropdown "ACCUEIL NON IFIC BAR 1/55" + bouton X (supprimer)
    - Ligne filtre 2 : dropdown "Date debut" + dropdown "entre" + input "01/08/2026" + "et" + input "31/08/2026" + bouton X
    - Bouton "+ Ajouter un filtre" (text-blue-600 text-sm, icone +)
  - Section "Tri" :
    - Dropdown "Trier par" : "Nb jours" selectionne
    - Radio : "Decroissant" selectionne (cercle bleu)
  - Section "Limite" :
    - Input "Nombre max de resultats" : "50" (valeur par defaut)
- Footer : "Precedent" + "Suivant" (bg-blue-600)
- [CURSEUR] Sur "Suivant"
**Action** : Clic "Suivant"
**Transition** : Etape 4

### Frame 6 — Assistant rapport - Etape 4 : Mise en forme
**Duree** : 5 secondes
**Narration** : "Personnalisez l'apparence de votre rapport."
**Ecran** :
- [CONTENU] Stepper : etapes 1-3 check, etape 4 "Mise en forme" active. Options :
  - Champ "Titre du rapport" : input "Absences service Accueil - Aout 2026" (text rempli)
  - Champ "Description" : textarea "Rapport mensuel des absences pour le service ACCUEIL NON IFIC BAR 1/55"
  - Section "Options d'affichage" :
    - Checkbox "Afficher les totaux" : coche
    - Checkbox "Afficher les sous-totaux par groupe" : non coche
    - Checkbox "Inclure la date de generation" : coche
    - Checkbox "Numerotation des lignes" : non coche
  - Section "Planification" :
    - Dropdown "Frequence" : "Ponctuel" selectionne (options : Ponctuel, Quotidien, Hebdomadaire, Mensuel)
- Footer : "Precedent" + "Apercu" (bg-blue-600)
- [CURSEUR] Sur "Apercu"
**Action** : Clic "Apercu"
**Transition** : Etape 5 apercu

### Frame 7 — Assistant rapport - Etape 5 : Apercu
**Duree** : 7 secondes
**Narration** : "L'apercu montre le resultat final de votre rapport avant sauvegarde."
**Ecran** :
- [CONTENU] Stepper : etapes 1-4 check, etape 5 "Apercu" active. Rendu du rapport :
  - Titre affiche : "Absences service Accueil - Aout 2026" (text-xl font-bold)
  - Sous-titre : "Genere le 04/08/2026"
  - Tableau previsualise (style impression, border-collapse) :
    - Header : # | Nom | Prenom | Service | Type absence | Nb jours | Date debut
    - 1 | BIOUCAS | Lidia | ACCUEIL NON IFIC BAR 1/55 | CA | 5 | 11/08/2026
    - 2 | BIOUCAS | Lidia | ACCUEIL NON IFIC BAR 1/55 | CA | 2 | 18/08/2026
    - (eventuellement d'autres lignes fictives pour le service)
    - Ligne total (font-bold bg-slate-50) : Total | | | | | 7 jours |
  - Texte : "3 resultats affiches"
  - Bandeau info (bg-blue-50) : "Ceci est un apercu. Les donnees reelles seront extraites a l'execution."
- Footer : "Precedent" + "Sauvegarder" (bg-emerald-600 text-white)
- [CURSEUR] Sur "Sauvegarder"
**Action** : Clic "Sauvegarder"
**Transition** : Sauvegarde

### Frame 8 — Confirmation et acces au rapport
**Duree** : 5 secondes
**Narration** : "Le rapport est sauvegarde et accessible depuis la liste des rapports."
**Ecran** :
- [CONTENU] Retour page Rapports. Nouvelle carte ajoutee dans la grille :
  - Carte "Absences service Accueil - Aout 2026" (border-2 border-emerald-300 pour indiquer nouveau, animation pulse 1s) + icone tableau + "Jamais execute" + badge "Ponctuel"
- [TOAST] Toast vert : "Rapport sauvegarde avec succes"
- Boutons sur la carte au survol : "Executer" (bg-blue-600 text-sm) + "Modifier" (text-slate-600 text-sm) + "Supprimer" (text-red-600 text-sm)
- [CURSEUR] Survole la nouvelle carte
**Action** : Observation
**Transition** : Fondu sortant

---

## FONCTION 13 : Executer un rapport sauvegarde
Duree video : 25 secondes
Nombre de frames : 4

### Frame 1 — Selection du rapport a executer
**Duree** : 5 secondes
**Narration** : "Pour executer un rapport deja cree, retrouvez-le dans la liste et cliquez sur Executer."
**Ecran** :
- [SIDEBAR] "Rapports" actif
- [CONTENU] Page Rapports, grille de cartes. La carte "Absences service Accueil - Aout 2026" est survolee (shadow-md). Bouton "Executer" visible au survol (bg-blue-600 text-white text-sm rounded px-3 py-1)
- [CURSEUR] Sur le bouton "Executer"
- [HIGHLIGHT] Bouton encadre annotation jaune
**Action** : Clic sur "Executer"
**Transition** : Chargement du rapport

### Frame 2 — Execution en cours
**Duree** : 5 secondes
**Narration** : "Le rapport s'execute. Un indicateur de progression montre l'avancement."
**Ecran** :
- [CONTENU] Page de chargement du rapport :
  - Titre : "Execution du rapport..." (text-lg)
  - Barre de progression animee (h-2 bg-blue-600 rounded-full, largeur animee de 0% a 100%)
  - Texte sous la barre : "Extraction des donnees... 47 enregistrements analyses"
  - Icone spinner a cote du titre (animate-spin)
- [CURSEUR] Non visible (attente)
**Action** : Attente automatique
**Transition** : Rapport pret, affichage resultats

### Frame 3 — Resultats du rapport
**Duree** : 9 secondes
**Narration** : "Le rapport affiche les resultats. Vous pouvez les exporter en differents formats."
**Ecran** :
- [CONTENU] Page resultats rapport :
  - Header : "Absences service Accueil - Aout 2026" (text-xl font-bold) + badge "Execute le 04/08/2026 a 14:52"
  - Barre d'actions : bouton "Exporter" (dropdown : PDF, Excel, CSV) + bouton "Imprimer" (icone printer) + bouton "Partager" (icone share)
  - Tableau de resultats (pleine largeur, style propre) :
    - Header (bg-slate-50 font-medium) : # | Nom | Prenom | Service | Type absence | Nb jours | Date debut
    - 1 | BIOUCAS | Lidia | ACCUEIL NON IFIC BAR 1/55 | CA | 5 | 11/08/2026
    - 2 | BIOUCAS | Lidia | ACCUEIL NON IFIC BAR 1/55 | CA | 2 | 18/08/2026
    - 3 | HENDRICKX | Anna | ACCUEIL NON IFIC BAR 1/55 | Maladie | 1 | 22/08/2026
    - Ligne total (font-bold bg-slate-100) : Total | | | | | **8 jours** |
  - Pied de page : "3 lignes - Genere en 1.2s"
- [CURSEUR] Sur le bouton "Exporter"
**Action** : Clic "Exporter" pour ouvrir le dropdown
**Transition** : Dropdown s'ouvre

### Frame 4 — Export du rapport
**Duree** : 6 secondes
**Narration** : "Choisissez le format d'export souhaite. Le fichier se telecharge automatiquement."
**Ecran** :
- [CONTENU] Dropdown "Exporter" ouvert (bg-white shadow-lg rounded-md border) :
  - Option 1 : icone PDF rouge + "Exporter en PDF" (survol bg-slate-50)
  - Option 2 : icone Excel vert + "Exporter en Excel (.xlsx)"
  - Option 3 : icone fichier + "Exporter en CSV"
- [CURSEUR] Sur "Exporter en PDF" (surligne)
**Action** : Clic "Exporter en PDF"
**Transition** : Toast bleu "Rapport exporte en PDF - Telechargement en cours". Icone telechargement breve dans la barre navigateur. Fondu sortant.

---

## FONCTION 14 : Importer des donnees en masse
Duree video : 40 secondes
Nombre de frames : 7

### Frame 1 — Acces a l'import
**Duree** : 4 secondes
**Narration** : "Pour importer des donnees en masse, utilisez la fonction d'import disponible dans Parametres."
**Ecran** :
- [SIDEBAR] Item "Parametres" encadre annotation jaune
- [HEADER] Inchange
- [CONTENU] Page courante
- [CURSEUR] Sur "Parametres"
**Action** : Clic sur "Parametres"
**Transition** : Page Parametres se charge

### Frame 2 — Page Parametres avec section Import
**Duree** : 5 secondes
**Narration** : "Dans les parametres, trouvez la section Import/Export de donnees."
**Ecran** :
- [SIDEBAR] "Parametres" actif (bg-blue-800)
- [CONTENU] Page Parametres. Navigation laterale secondaire (a gauche du contenu) :
  - Items : Organisation, Utilisateurs, Roles, Import/Export, Notifications, Securite, Apparence
  - "Import/Export" surligne (bg-blue-50 border-l-2 border-blue-600 text-blue-700)
- Section droite "Import/Export" :
  - Titre "Import/Export de donnees" (text-xl font-semibold)
  - Deux cartes :
    - Carte "Importer" (bg-white border rounded-lg p-6) : icone upload fleche montante, titre "Importer des donnees", description "Importez des employes, absences ou salaires depuis un fichier Excel/CSV", bouton "Demarrer l'import" (bg-blue-600 text-white)
    - Carte "Exporter" (bg-white border rounded-lg p-6) : icone download, titre "Exporter des donnees", description "Exportez vos donnees au format Excel ou CSV", bouton "Exporter" (border text-blue-600)
- [CURSEUR] Sur "Demarrer l'import"
**Action** : Clic sur "Demarrer l'import"
**Transition** : Assistant d'import s'ouvre

### Frame 3 — Assistant import - Etape 1 : Type de donnees
**Duree** : 5 secondes
**Narration** : "Selectionnez le type de donnees que vous souhaitez importer."
**Ecran** :
- [CONTENU] Assistant import, stepper : Etape 1 "Type" (active) — Etape 2 "Fichier" — Etape 3 "Mapping" — Etape 4 "Validation" — Etape 5 "Execution"
  - Titre : "Que souhaitez-vous importer ?"
  - Grille de choix (cartes selectionnables, 2x2) :
    - "Employes" (icone users, selectionnee border-2 border-blue-500 bg-blue-50) : "Donnees d'identite et contrats"
    - "Absences" (icone calendar) : "Historique des absences"
    - "Salaires" (icone banknote) : "Grilles salariales et fiches"
    - "Horaires" (icone clock) : "Plannings et rotations"
  - Lien "Telecharger le modele Excel" (text-blue-600 underline, icone download) sous les cartes
- [CURSEUR] Sur la carte "Employes" (selectionnee)
**Action** : Clic "Suivant"
**Transition** : Etape 2

### Frame 4 — Assistant import - Etape 2 : Upload fichier
**Duree** : 6 secondes
**Narration** : "Glissez votre fichier Excel ou CSV dans la zone de depot."
**Ecran** :
- [CONTENU] Stepper : etape 1 check, etape 2 "Fichier" active.
  - Zone de drop grande (h-48 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center) :
    - Icone upload grande (text-slate-400 w-12 h-12)
    - Texte principal : "Glissez votre fichier ici" (text-lg text-slate-600)
    - Texte secondaire : "ou cliquez pour parcourir" (text-sm text-slate-400)
    - Formats acceptes : "Formats : .xlsx, .xls, .csv (max 10 Mo)"
  - Fichier depose (transition) : la zone passe en bg-emerald-50 border-emerald-300 :
    - Icone fichier Excel vert + "import_employes_2026.xlsx" (font-medium) + "245 Ko - 12 lignes detectees" + bouton X pour supprimer
- [CURSEUR] Animation de drag (fichier glisse depuis le bureau vers la zone)
**Action** : Fichier depose
**Transition** : Clic Suivant, passage mapping

### Frame 5 — Assistant import - Etape 3 : Mapping des colonnes
**Duree** : 7 secondes
**Narration** : "Associez les colonnes de votre fichier aux champs du systeme."
**Ecran** :
- [CONTENU] Stepper : etapes 1-2 check, etape 3 "Mapping" active. Tableau de correspondance :
  - Header : Colonne fichier | Apercu donnees | Champ WorkDays | Statut
  - Ligne 1 : "nom" | "MARTINEZ, DUBOIS, CLAES..." | dropdown "Nom" (selectionne, check vert) | badge vert "OK"
  - Ligne 2 : "prenom" | "Carlos, Julie, Hans..." | dropdown "Prenom" (selectionne) | badge vert "OK"
  - Ligne 3 : "date_naissance" | "15/03/1988, 22/07/1992..." | dropdown "Date de naissance" (selectionne) | badge vert "OK"
  - Ligne 4 : "service_code" | "ACC01, ADM02, SOI01..." | dropdown "Service" (selectionne) | badge amber "Verification requise"
  - Ligne 5 : "salaire" | "3200, 2850, 3100..." | dropdown "Salaire brut" (selectionne) | badge vert "OK"
  - Ligne 6 : "custom_field" | "X, Y, Z..." | dropdown "-- Ignorer --" (text-slate-400) | badge gris "Ignore"
  - Info : "5 colonnes mappees, 1 ignoree. 0 colonnes obligatoires manquantes."
- [CURSEUR] Sur le dropdown de la ligne 4 (pour corriger)
**Action** : Verification du mapping, clic Suivant
**Transition** : Etape 4

### Frame 6 — Assistant import - Etape 4 : Validation
**Duree** : 7 secondes
**Narration** : "Le systeme valide les donnees et signale les erreurs eventuelles."
**Ecran** :
- [CONTENU] Stepper : etapes 1-3 check, etape 4 "Validation" active. Resultats de validation :
  - Resume (3 cartes en ligne) :
    - Carte verte : "10 lignes valides" (icone check, text-emerald-600)
    - Carte amber : "1 ligne avec avertissement" (icone alerte, text-amber-600)
    - Carte rouge : "1 ligne en erreur" (icone X, text-red-600)
  - Detail des problemes (liste expansible) :
    - Avertissement (bg-amber-50 border-l-4 border-amber-400 p-3) : "Ligne 7 : Le service 'ACC03' n'existe pas. Il sera cree automatiquement."
    - Erreur (bg-red-50 border-l-4 border-red-400 p-3) : "Ligne 11 : Le numero national '99.13.45-678.90' est invalide (format incorrect)."
  - Options :
    - Checkbox "Ignorer les lignes en erreur et importer le reste" (coche)
    - Checkbox "Creer automatiquement les services manquants" (coche)
  - Compteur : "11 lignes seront importees (1 ignoree)"
- [CURSEUR] Sur "Lancer l'import" (bg-emerald-600 text-white)
**Action** : Clic "Lancer l'import"
**Transition** : Execution

### Frame 7 — Execution et resultat final
**Duree** : 6 secondes
**Narration** : "L'import s'execute. Un rapport final confirme les donnees importees."
**Ecran** :
- [CONTENU] Stepper : toutes etapes check. Ecran de resultat :
  - Grande icone check cercle vert au centre (w-16 h-16 animate-bounce-once)
  - Titre : "Import termine avec succes !" (text-2xl font-bold text-emerald-700)
  - Resume :
    - "11 employes importes" (text-emerald-600)
    - "1 ligne ignoree (erreur)" (text-slate-500)
    - "1 service cree automatiquement (ACC03)"
    - "Duree : 3.2 secondes"
  - Boutons :
    - "Voir les employes importes" (bg-blue-600 text-white rounded-md)
    - "Telecharger le rapport d'import" (border text-slate-600 rounded-md)
    - "Retour aux parametres" (text-blue-600 underline)
- [TOAST] Toast vert : "Import reussi : 11 employes ajoutes"
- [CURSEUR] Au centre, observation
**Action** : Aucune
**Transition** : Fondu sortant

---

## FONCTION 15 : Recrutement - Candidat vers embauche
Duree video : 55 secondes
Nombre de frames : 10

### Frame 1 — Navigation vers Recrutement
**Duree** : 4 secondes
**Narration** : "Le module Recrutement vous accompagne de la candidature jusqu'a l'embauche."
**Ecran** :
- [SIDEBAR] Item "Recrutement" encadre annotation jaune
- [HEADER] Inchange
- [CONTENU] Dashboard
- [CURSEUR] Sur "Recrutement"
**Action** : Clic sur "Recrutement"
**Transition** : Page Recrutement se charge

### Frame 2 — Page Recrutement vue Kanban
**Duree** : 6 secondes
**Narration** : "Le tableau Kanban offre une vue d'ensemble de votre pipeline de recrutement."
**Ecran** :
- [SIDEBAR] "Recrutement" actif (bg-blue-800)
- [CONTENU] Titre "Recrutement" (text-2xl font-bold). Barre d'outils :
  - Bouton "+ Nouveau candidat" (bg-blue-600 text-white)
  - Toggle vue : "Kanban" (actif, bg-blue-100 text-blue-700) | "Liste" | "Calendrier"
  - Dropdown "Tous les postes"
- Vue Kanban (colonnes horizontales scrollables) :
  - Colonne 1 "Candidatures recues" (header bg-slate-100 rounded-t-lg, badge "4") :
    - Carte candidat : "MARTINEZ Carlos" + "Accueil" + "Recu le 01/08" (bg-white border rounded-lg p-3 shadow-sm)
    - Carte : "DUBOIS Julie" + "Infirmiere" + "Recu le 28/07"
    - ... (2 autres cartes)
  - Colonne 2 "Entretien planifie" (header bg-blue-100, badge "2") :
    - Carte : "CLAES Hans" + "Maintenance" + "Entretien 06/08"
    - Carte : "PEETERS Eva" + "Administration" + "Entretien 08/08"
  - Colonne 3 "Evaluation" (header bg-amber-100, badge "1") :
    - Carte : "VERMEER Dirk" + "Infirmier" + "En evaluation"
  - Colonne 4 "Offre envoyee" (header bg-emerald-100, badge "0") : vide, placeholder
  - Colonne 5 "Embauche" (header bg-emerald-200, badge "1") :
    - Carte : "NGOMA David" + "Accueil" + "Debut 01/09"
- [CURSEUR] Sur le bouton "+ Nouveau candidat"
**Action** : Clic "+ Nouveau candidat"
**Transition** : Formulaire d'ajout

### Frame 3 — Formulaire nouveau candidat
**Duree** : 6 secondes
**Narration** : "Entrez les informations du nouveau candidat et le poste vise."
**Ecran** :
- [MODALE] Grande modale centree (max-w-lg). Header "Nouveau candidat" + X.
  - Formulaire :
    - Nom* : "ROSSI"
    - Prenom* : "Anna"
    - Email* : "a.rossi@email.be"
    - Telephone : "+32 478 555 123"
    - Poste vise* : dropdown "Accueil Diplome Superieur" selectionne
    - Source : dropdown "Site carriere" (options : Site carriere, LinkedIn, Cooptation, Spontanee, Autre)
    - CV : zone upload mini "Deposer le CV (PDF)" - fichier "CV_ROSSI_Anna.pdf" charge (icone PDF + nom)
    - Lettre motivation : zone upload mini, vide
    - Notes : textarea "Profil interessant, experience 3 ans en accueil hospitalier"
  - Boutons : "Annuler" + "Creer le candidat" (bg-blue-600)
- [CURSEUR] Sur "Creer le candidat"
**Action** : Clic creation
**Transition** : Toast + modale ferme, carte apparait dans Kanban

### Frame 4 — Candidat cree, visible dans Kanban
**Duree** : 4 secondes
**Narration** : "Le candidat apparait dans la premiere colonne du pipeline."
**Ecran** :
- [CONTENU] Kanban. Colonne "Candidatures recues" : nouvelle carte ajoutee en haut avec animation slide-down :
  - "ROSSI Anna" + "Accueil Diplome Sup." + "Recu le 04/08" (border-2 border-emerald-300 pulse breve pour indiquer nouveaute)
  - Badge colonne mis a jour : "5"
- [TOAST] Toast vert "Candidat ROSSI Anna ajoute au pipeline"
- [CURSEUR] Sur la carte ROSSI (prevoyant de la deplacer)
**Action** : Observation
**Transition** : Vers planification entretien

### Frame 5 — Drag vers "Entretien planifie"
**Duree** : 6 secondes
**Narration** : "Glissez la carte du candidat vers la colonne Entretien planifie pour avancer dans le processus."
**Ecran** :
- [CONTENU] Kanban en mode drag :
  - Carte "ROSSI Anna" soulevee (shadow-2xl, scale-105, opacity-90)
  - Colonne "Entretien planifie" surlignee (border-2 border-dashed border-blue-400 bg-blue-50)
  - Fleche visuelle animee de la colonne 1 vers colonne 2
- [CURSEUR] Drag de la carte vers la colonne 2
**Action** : Drop dans "Entretien planifie"
**Transition** : Modale de planification s'ouvre

### Frame 6 — Planification de l'entretien
**Duree** : 6 secondes
**Narration** : "Une fenetre de planification apparait pour fixer la date et l'heure de l'entretien."
**Ecran** :
- [MODALE] Modale "Planifier l'entretien - ROSSI Anna" :
  - Champ "Date" : datepicker, "12/08/2026" selectionne
  - Champ "Heure" : timepicker, "10:00" selectionne
  - Champ "Duree" : dropdown "45 minutes"
  - Champ "Intervieweur(s)" : multi-select tags, "OUASSINI Youssef" ajoute (tag bleu)
  - Champ "Type" : radio "Presentiel" (selectionne) / "Video"
  - Champ "Salle/Lieu" : input "Bureau Direction - Bat A"
  - Checkbox "Envoyer invitation par email au candidat" (coche)
  - Boutons : "Annuler" + "Planifier" (bg-blue-600)
- [CURSEUR] Sur "Planifier"
**Action** : Clic "Planifier"
**Transition** : Toast + carte mise a jour dans Kanban

### Frame 7 — Evaluation post-entretien
**Duree** : 6 secondes
**Narration** : "Apres l'entretien, saisissez votre evaluation pour avancer le candidat."
**Ecran** :
- [CONTENU] Fiche candidat ROSSI Anna (page detail) :
  - Header : nom + poste vise + badge bleu "Entretien planifie"
  - Timeline chronologique a gauche :
    - 04/08 : Candidature recue (check vert)
    - 04/08 : Entretien planifie 12/08 (check vert)
    - 12/08 : Entretien realise (etape courante, cercle bleu)
  - Section "Evaluation" (formulaire) :
    - Note globale : 5 etoiles cliquables (4/5 selectionnees, etoiles dorees)
    - Criteres :
      - Competences techniques : barre 4/5 (bg-emerald-500)
      - Savoir-etre : barre 5/5 (bg-emerald-500)
      - Motivation : barre 4/5 (bg-emerald-500)
      - Adequation poste : barre 3/5 (bg-amber-500)
    - Commentaire : textarea "Tres bonne candidate, experience pertinente. A recevoir en 2e entretien ou proposition directe."
    - Decision : radio "Avancer" (selectionne) / "En attente" / "Refuser"
  - Bouton "Enregistrer l'evaluation" (bg-blue-600)
- [CURSEUR] Sur "Enregistrer l'evaluation"
**Action** : Clic
**Transition** : Evaluation sauvegardee

### Frame 8 — Envoi de l'offre
**Duree** : 5 secondes
**Narration** : "Si le candidat est retenu, envoyez-lui une offre d'emploi."
**Ecran** :
- [CONTENU] Fiche ROSSI Anna. Badge mis a jour "Evaluation" -> action suivante. Bouton "Envoyer une offre" (bg-emerald-600 text-white rounded-md px-4 py-2) visible.
  - Modale "Proposition d'offre" :
    - Poste : "Accueil Diplome Superieur" (pre-rempli)
    - Salaire brut propose : input "2.850,00 EUR"
    - Type contrat : dropdown "CDI"
    - Date de debut : "01/10/2026"
    - Avantages : checkboxes (Cheques repas coche, Eco-cheques coche, Assurance groupe coche)
    - Bouton "Envoyer l'offre par email" (bg-emerald-600) + "Sauvegarder brouillon" (border)
- [CURSEUR] Sur "Envoyer l'offre par email"
**Action** : Clic envoi
**Transition** : Toast + carte passe en "Offre envoyee"

### Frame 9 — Offre acceptee, conversion en employe
**Duree** : 6 secondes
**Narration** : "Lorsque le candidat accepte, convertissez-le en employe en un clic."
**Ecran** :
- [CONTENU] Kanban mis a jour. Carte "ROSSI Anna" dans colonne "Offre envoyee" avec badge vert "Offre acceptee" (mise a jour manuelle ou automatique).
  - Bouton sur la carte ou en detail : "Convertir en employe" (bg-emerald-600 text-white font-semibold rounded-md)
  - Clic sur ce bouton ouvre une modale de confirmation :
    - "Convertir ROSSI Anna en employe ?"
    - Recapitulatif : CDI, Accueil Diplome Superieur, debut 01/10/2026, 2.850 EUR brut
    - "Les informations seront transferees dans le module Personnel"
    - Boutons : "Annuler" + "Confirmer la conversion" (bg-emerald-600)
- [CURSEUR] Sur "Confirmer la conversion"
**Action** : Clic confirmation
**Transition** : Animation de succes

### Frame 10 — Employe cree, pipeline mis a jour
**Duree** : 6 secondes
**Narration** : "Le candidat est devenu employe. Son dossier est automatiquement cree dans Personnel."
**Ecran** :
- [CONTENU] Ecran de succes :
  - Grande icone check vert avec confetti animation breve
  - Titre : "ROSSI Anna est maintenant employee !" (text-xl font-bold text-emerald-700)
  - Resume :
    - "Fiche employe creee dans Personnel"
    - "Contrat CDI a partir du 01/10/2026"
    - "Service : ACCUEIL NON IFIC BAR 1/55"
    - "Responsable : OUASSINI Youssef"
  - Boutons : "Voir la fiche employe" (bg-blue-600 text-white) + "Retour au recrutement" (border text-slate-600)
- [KANBAN] En arriere-plan : carte ROSSI Anna dans colonne "Embauche" (badge "5" sur la colonne)
- [TOAST] Toast vert "Employe ROSSI Anna cree avec succes"
- [CURSEUR] Au centre
**Action** : Observation
**Transition** : Fondu sortant

---

## FONCTION 16 : Gerer les documents employe
Duree video : 30 secondes
Nombre de frames : 5

### Frame 1 — Acces aux documents depuis la fiche employe
**Duree** : 5 secondes
**Narration** : "Chaque employe dispose d'un espace documents pour stocker ses fichiers RH."
**Ecran** :
- [SIDEBAR] "Personnel" actif
- [CONTENU] Fiche employe BIOUCAS Lidia visible. Onglets : Informations | Contrat | Absences | **Documents** (encadre annotation jaune) | Historique
- [CURSEUR] Sur l'onglet "Documents"
**Action** : Clic sur "Documents"
**Transition** : Section documents s'affiche

### Frame 2 — Liste des documents existants
**Duree** : 6 secondes
**Narration** : "La liste affiche tous les documents classes par categorie."
**Ecran** :
- [CONTENU] Onglet "Documents" actif. Layout :
  - Barre d'outils : bouton "+ Ajouter un document" (bg-blue-600 text-white) + dropdown "Toutes les categories" + input recherche
  - Tableau documents :
    - Header (bg-slate-50) : Document | Categorie | Date ajout | Taille | Actions
    - Ligne 1 : icone PDF + "Contrat_CDI_BIOUCAS.pdf" | badge "Contrat" (bg-purple-100 text-purple-700) | 15/04/2021 | 245 Ko | icones oeil + download + corbeille
    - Ligne 2 : icone PDF + "Certificat_medical_mars2026.pdf" | badge "Medical" (bg-red-100 text-red-700) | 10/03/2026 | 89 Ko | icones
    - Ligne 3 : icone image + "Photo_identite.jpg" | badge "Identite" (bg-blue-100 text-blue-700) | 15/04/2021 | 1.2 Mo | icones
    - Ligne 4 : icone PDF + "Fiche_paie_juillet2026.pdf" | badge "Paie" (bg-emerald-100 text-emerald-700) | 01/08/2026 | 156 Ko | icones
    - Compteur : "4 documents"
- [CURSEUR] Sur le bouton "+ Ajouter un document"
**Action** : Clic pour ajouter
**Transition** : Modale d'upload

### Frame 3 — Upload d'un nouveau document
**Duree** : 7 secondes
**Narration** : "Deposez un nouveau document et categorisez-le."
**Ecran** :
- [MODALE] "Ajouter un document - BIOUCAS Lidia" :
  - Zone de drop (h-32 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50) :
    - Fichier depose : "Attestation_formation_2026.pdf" (icone PDF + nom + "320 Ko") avec check vert
  - Champ "Categorie"* : dropdown ouvert :
    - Contrat
    - Medical
    - Identite
    - Paie
    - **Formation** (surligne bg-blue-50, selectionne)
    - Diplome
    - Autre
  - Champ "Description" : textarea "Attestation de formation securite incendie - Juin 2026"
  - Champ "Date du document" : "15/06/2026"
  - Checkbox "Visible par l'employe en Self-service" (coche)
  - Boutons : "Annuler" + "Enregistrer" (bg-blue-600)
- [CURSEUR] Sur "Enregistrer"
**Action** : Clic "Enregistrer"
**Transition** : Document ajoute

### Frame 4 — Document ajoute et previsualisation
**Duree** : 6 secondes
**Narration** : "Le document est ajoute. Vous pouvez le previsualiser directement."
**Ecran** :
- [CONTENU] Tableau mis a jour avec nouvelle ligne en haut (animation highlight bg-emerald-50 breve) :
  - Ligne nouvelle : icone PDF + "Attestation_formation_2026.pdf" | badge "Formation" (bg-teal-100 text-teal-700) | 04/08/2026 | 320 Ko | icones
  - Compteur : "5 documents"
- [TOAST] Toast vert "Document ajoute avec succes"
- Le curseur clique sur l'icone oeil de la nouvelle ligne :
  - Panneau de previsualisation s'ouvre (slide-in droite ou modale large) :
    - Header : nom fichier + boutons "Telecharger" + "Fermer"
    - Corps : previsualisation PDF (rendu du document, premiere page visible avec texte "Attestation de formation..." visible)
- [CURSEUR] Sur l'icone oeil
**Action** : Clic previsualisation
**Transition** : Preview visible

### Frame 5 — Gestion des permissions et suppression
**Duree** : 6 secondes
**Narration** : "Vous pouvez gerer les permissions d'acces et supprimer les documents obsoletes."
**Ecran** :
- [CONTENU] Retour au tableau. Le curseur clique sur l'icone corbeille d'un document ancien :
  - Modale de confirmation (petite, max-w-sm) :
    - Icone alerte rouge triangle
    - "Supprimer ce document ?"
    - "Certificat_medical_mars2026.pdf sera definitivement supprime."
    - Boutons : "Annuler" + "Supprimer" (bg-red-600 text-white)
  - Alternative montree : menu contextuel "..." sur une ligne avec options :
    - "Telecharger"
    - "Renommer"
    - "Changer la categorie"
    - "Modifier la visibilite" (toggle)
    - "Supprimer" (text-red-600)
- [CURSEUR] Sur "Annuler" (pour ne pas supprimer dans la demo)
**Action** : Clic "Annuler"
**Transition** : Fondu sortant

---

## FONCTION 17 : Notifications
Duree video : 25 secondes
Nombre de frames : 4

### Frame 1 — Icone notifications et badge
**Duree** : 5 secondes
**Narration** : "Le systeme de notifications vous tient informe en temps reel des evenements importants."
**Ecran** :
- [SIDEBAR] "Tableau de bord" actif
- [HEADER] Icone cloche encadree annotation jaune. Badge rouge "3" visible (3 notifications non lues). Date "mardi 4 aout 2026"
- [CONTENU] Dashboard standard
- [CURSEUR] Sur l'icone cloche
- [HIGHLIGHT] Cloche encadree jaune pointille + fleche annotation "Cliquez ici"
**Action** : Clic sur la cloche
**Transition** : Dropdown s'ouvre

### Frame 2 — Centre de notifications ouvert
**Duree** : 7 secondes
**Narration** : "Le centre de notifications regroupe toutes les alertes par ordre chronologique."
**Ecran** :
- [HEADER] Dropdown notifications ouvert (bg-white shadow-2xl rounded-lg border w-96 max-h-[500px] overflow-y-auto) :
  - Header : "Notifications (3 non lues)" (font-semibold) + "Tout marquer comme lu" (text-blue-600 text-sm cursor-pointer)
  - Section "Aujourd'hui" (text-xs text-slate-400 uppercase font-medium px-4 py-2) :
    - Notif 1 (bg-blue-50, point bleu, non lue) : icone calendrier bleu + "Demande de conge" + "BIOUCAS Lidia demande un CA du 18/08 au 19/08" + "Il y a 2h" (text-xs text-slate-400)
    - Notif 2 (bg-blue-50, non lue) : icone user vert + "Nouvel employe" + "MARTINEZ Carlos a ete ajoute au systeme" + "Il y a 3h"
    - Notif 3 (bg-blue-50, non lue) : icone alerte amber + "Alerte augmentation" + "2 employes eligibles a une augmentation" + "Il y a 5h"
  - Section "Hier" :
    - Notif 4 (bg-white, lue) : icone check vert + "Absence validee" + "CA approuve pour DUPONT Marie (01/08-03/08)" + "Hier 16:30"
    - Notif 5 (bg-white, lue) : icone document + "Document ajoute" + "Nouvelle fiche de paie disponible" + "Hier 09:00"
  - Footer : lien "Voir toutes les notifications" (text-blue-600 text-center py-3 border-t)
- [CURSEUR] Sur la premiere notification (non lue)
**Action** : Clic sur la notification BIOUCAS
**Transition** : Navigation vers la demande

### Frame 3 — Page toutes les notifications
**Duree** : 7 secondes
**Narration** : "La page complete permet de filtrer et gerer toutes vos notifications."
**Ecran** :
- [SIDEBAR] Pas de changement specifique (navigation via le lien "Voir toutes")
- [CONTENU] Page "Notifications" (text-2xl font-bold). Layout :
  - Barre de filtres :
    - Onglets : "Toutes" (actif, 15) | "Non lues" (3) | "Absences" (5) | "RH" (4) | "Systeme" (6)
    - Bouton "Parametres notifications" (icone gear + text-slate-600) a droite
  - Liste de notifications (style timeline, plus spacieuse que le dropdown) :
    - Chaque notification : icone | titre (font-medium) | texte detail | horodatage | bouton "..." (actions)
    - Non lues avec fond bg-blue-50 et bordure gauche bleu (border-l-4 border-blue-500)
    - Lues sur fond blanc
    - Pagination en bas : "Page 1 sur 3"
  - Actions par notification (menu "...") : "Marquer comme lu", "Supprimer", "Desactiver ce type"
- [CURSEUR] Sur le bouton "Parametres notifications"
**Action** : Clic parametres
**Transition** : Page parametres notifications

### Frame 4 — Parametres de notifications
**Duree** : 6 secondes
**Narration** : "Personnalisez les types de notifications que vous souhaitez recevoir."
**Ecran** :
- [CONTENU] Page ou modale "Parametres de notifications" :
  - Titre : "Preferences de notifications" (text-xl font-semibold)
  - Tableau de preferences :
    - Header : Type | In-app | Email | Push
    - Ligne "Demandes de conge" : toggle bleu ON | toggle bleu ON | toggle gris OFF
    - Ligne "Absences validees" : toggle ON | toggle OFF | toggle OFF
    - Ligne "Alertes augmentation" : toggle ON | toggle ON | toggle OFF
    - Ligne "Nouveaux employes" : toggle ON | toggle OFF | toggle OFF
    - Ligne "Documents ajoutes" : toggle ON | toggle OFF | toggle OFF
    - Ligne "Rapports executes" : toggle OFF | toggle OFF | toggle OFF
  - Chaque toggle : bg-blue-600 rounded-full w-10 h-5 quand ON, bg-slate-300 quand OFF
  - Section "Frequence emails" : dropdown "Immediate" (options : Immediate, Resume quotidien, Resume hebdomadaire)
  - Bouton "Sauvegarder les preferences" (bg-blue-600 text-white)
- [CURSEUR] Sur un toggle pour le basculer
**Action** : Toggle un parametre
**Transition** : Toast "Preferences mises a jour". Fondu sortant.

---

## FONCTION 18 : Parametres organisation et logo
Duree video : 30 secondes
Nombre de frames : 5

### Frame 1 — Navigation vers Parametres
**Duree** : 4 secondes
**Narration** : "Personnalisez votre organisation depuis les Parametres : nom, logo et informations generales."
**Ecran** :
- [SIDEBAR] Item "Parametres" encadre annotation jaune
- [HEADER] Inchange
- [CONTENU] Page courante
- [CURSEUR] Sur "Parametres"
**Action** : Clic sur "Parametres"
**Transition** : Page Parametres se charge

### Frame 2 — Section Organisation dans Parametres
**Duree** : 6 secondes
**Narration** : "La section Organisation contient les informations de votre structure."
**Ecran** :
- [SIDEBAR] "Parametres" actif (bg-blue-800)
- [CONTENU] Page Parametres. Navigation secondaire gauche :
  - "Organisation" selectionne (bg-blue-50 border-l-2 border-blue-600 text-blue-700 font-medium)
  - Autres : Utilisateurs, Roles, Import/Export, Notifications, Securite, Apparence
- Section droite "Organisation" :
  - Titre "Informations de l'organisation" (text-xl font-semibold)
  - Formulaire (grid 2 colonnes) :
    - Nom de l'organisation* : input "Centre Hospitalier WorkDays"
    - Numero BCE : input "0123.456.789"
    - Secteur d'activite : dropdown "Sante - CP330"
    - Adresse siege : input "Avenue de la Sante 10, 1200 Woluwe-Saint-Lambert"
    - Telephone : input "+32 2 123 45 67"
    - Email contact : input "rh@workdays-hospital.be"
    - Site web : input "www.workdays-hospital.be"
  - Section "Logo" en dessous (carte separee) :
    - Logo actuel : image carree 80x80 affichant le logo WorkDays (fond bleu, texte W stylise)
    - Bouton "Modifier le logo" (text-blue-600 border rounded-md px-3 py-1.5)
    - Texte helper : "Format recommande : PNG ou SVG, 512x512px minimum"
- [CURSEUR] Sur le bouton "Modifier le logo"
**Action** : Clic "Modifier le logo"
**Transition** : Zone upload logo s'active

### Frame 3 — Upload nouveau logo
**Duree** : 7 secondes
**Narration** : "Telechargez votre nouveau logo. Un apercu s'affiche immediatement."
**Ecran** :
- [CONTENU] Section logo mise a jour :
  - Zone upload activee (border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-6) :
    - Texte "Glissez votre logo ici ou cliquez pour parcourir"
    - Fichier selectionne (transition) : "nouveau_logo.png" avec preview miniature
  - Apercu en temps reel (a droite de la zone upload) :
    - Label "Apercu" (text-sm font-medium text-slate-600)
    - Mockup sidebar miniature montrant le nouveau logo en position (rond 40px en haut de la sidebar simulee)
    - Mockup header montrant le logo en petit format
  - Boutons sous l'apercu : "Annuler" + "Appliquer le logo" (bg-blue-600)
- [CURSEUR] Sur "Appliquer le logo"
**Action** : Clic "Appliquer le logo"
**Transition** : Logo mis a jour partout

### Frame 4 — Modification des informations organisation
**Duree** : 7 secondes
**Narration** : "Modifiez les informations de votre organisation selon vos besoins."
**Ecran** :
- [SIDEBAR] Logo mis a jour visible en haut (le nouveau logo remplace l'ancien)
- [CONTENU] Formulaire organisation en mode edition :
  - Champ "Nom" modifie : curseur efface le texte et tape "Centre de Soins WorkDays" (border-blue-500 focus visible)
  - Champ "Adresse" modifie : nouvelle adresse tapee
  - Indicateur "2 modifications" en bas (text-amber-600)
  - Bouton "Sauvegarder" (bg-blue-600) actif en bas du formulaire
- [CURSEUR] Sur le bouton "Sauvegarder"
**Action** : Clic "Sauvegarder"
**Transition** : Sauvegarde

### Frame 5 — Confirmation des modifications
**Duree** : 6 secondes
**Narration** : "Les modifications sont enregistrees et appliquees immediatement."
**Ecran** :
- [SIDEBAR] Logo et nom mis a jour. Sous-titre sous le logo : "Centre de Soins WorkDays" (si affiche)
- [CONTENU] Formulaire en mode lecture, nouvelles valeurs affichees :
  - Nom : "Centre de Soins WorkDays"
  - Toutes les autres valeurs mises a jour
- [TOAST] Toast vert "Informations de l'organisation mises a jour"
- Encadre info (bg-blue-50 border-blue-200 p-3 rounded-md) : "Le logo et les informations seront utilises sur les documents generes (fiches de paie, contrats, rapports)."
- [CURSEUR] Au centre
**Action** : Observation
**Transition** : Fondu sortant

---

## FONCTION 19 : Installer l'app sur mobile (PWA)
Duree video : 20 secondes
Nombre de frames : 3

### Frame 1 — Bandeau d'installation PWA
**Duree** : 7 secondes
**Narration** : "WorkDays peut etre installe comme une application sur votre telephone. Un bandeau vous invite a l'installer."
**Ecran** :
- [DEVICE] Ecran simule de smartphone (cadre telephone, ratio 9:16, ~375px largeur)
- [SIDEBAR] Cachee (mode mobile, menu hamburger en haut a gauche)
- [HEADER MOBILE] Barre blanche avec : icone hamburger (3 lignes) a gauche + logo "WorkDays" centre + cloche a droite
- [BANDEAU PWA] En haut de l'ecran sous le header (bg-blue-600 text-white p-3 rounded-b-lg shadow-lg) :
  - Icone smartphone + texte "Installer WorkDays sur votre appareil" (text-sm font-medium)
  - Bouton "Installer" (bg-white text-blue-600 rounded-md px-3 py-1 text-sm font-semibold) a droite
  - Bouton X mini pour fermer a l'extreme droite
- [CONTENU MOBILE] Dashboard simplifie : 2 cartes KPI empilees (Absents: 3, Demandes: 2) + liste activites condensee
- [CURSEUR] Doigt/curseur sur le bouton "Installer"
**Action** : Tap/clic sur "Installer"
**Transition** : Dialogue systeme apparait

### Frame 2 — Dialogue d'installation du navigateur
**Duree** : 7 secondes
**Narration** : "Le navigateur affiche un dialogue de confirmation. Appuyez sur Installer ou Ajouter."
**Ecran** :
- [DEVICE] Meme ecran smartphone
- [DIALOGUE SYSTEME] Dialogue natif du navigateur (style Chrome Android) au centre-bas :
  - Fond blanc rounded-t-2xl shadow-2xl
  - Icone app (logo WorkDays, carre arrondi 48px) + "WorkDays" (font-semibold) + "workdays.app" (text-slate-500 text-sm)
  - Description : "Gestion RH Belgique"
  - Deux boutons pleine largeur :
    - "Installer" (bg-blue-600 text-white rounded-lg py-3 font-semibold) -- le principal
    - "Annuler" (text-slate-600 py-3)
  - Le contenu de l'app est visible mais floute/assombri en arriere-plan
- [CURSEUR] Sur le bouton "Installer" du dialogue systeme
**Action** : Tap sur "Installer"
**Transition** : Animation d'installation (icone se deplace vers l'ecran d'accueil)

### Frame 3 — App installee sur l'ecran d'accueil
**Duree** : 6 secondes
**Narration** : "L'application est installee. Retrouvez-la sur votre ecran d'accueil comme n'importe quelle app."
**Ecran** :
- [DEVICE] Ecran d'accueil du telephone simule :
  - Grille d'icones apps (style Android/iOS) : icones variees (telephone, messages, camera, etc.)
  - Icone "WorkDays" nouvellement ajoutee (mise en evidence) :
    - Carre arrondi, fond bleu avec logo W blanc
    - Label "WorkDays" en dessous
    - Animation subtile (glow/pulse) pour attirer l'attention
    - Annotation fleche jaune pointant vers l'icone "Votre app est prete !"
- Puis transition : tap sur l'icone, l'app s'ouvre en mode standalone (pas de barre d'adresse navigateur) :
  - Splash screen WorkDays (fond bleu, logo centre, 1s)
  - Puis dashboard complet en mode app native (plein ecran, pas de barre URL)
  - Status bar telephone visible en haut (heure, batterie, signal)
- [CURSEUR] Sur l'icone WorkDays
**Action** : Tap pour ouvrir l'app
**Transition** : Fondu sortant avec texte "L'app est prete a l'emploi !"

---

## RECAPITULATIF

| # | Fonction | Frames | Duree estimee |
|---|----------|--------|---------------|
| 1 | Encoder une absence (Gestionnaire) | 8 | 45s |
| 2 | Encoder une absence (Employe Self-service) | 5 | 30s |
| 3 | Consulter le calendrier annuel | 6 | 35s |
| 4 | Voir les soldes conges | 3 | 20s |
| 5 | Approuver/Refuser une demande | 6 | 35s |
| 6 | Creer un employe | 5 | 30s |
| 7 | Modifier une fiche employe | 4 | 25s |
| 8 | Configurer l'organigramme | 5 | 30s |
| 9 | Consulter le salaire | 4 | 25s |
| 10 | Simulateur salaire | 4 | 25s |
| 11 | Alertes augmentation | 3 | 20s |
| 12 | Creer un rapport dynamique | 8 | 45s |
| 13 | Executer un rapport sauvegarde | 4 | 25s |
| 14 | Importer des donnees en masse | 7 | 40s |
| 15 | Recrutement : candidat vers embauche | 10 | 55s |
| 16 | Gerer les documents employe | 5 | 30s |
| 17 | Notifications | 4 | 25s |
| 18 | Parametres organisation et logo | 5 | 30s |
| 19 | Installer l'app sur mobile (PWA) | 3 | 20s |
| **TOTAL** | | **99** | **~9 min 50s** |

