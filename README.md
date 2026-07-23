# Site web Hypostratège — Courtiers hypothécaires

Site **statique** (HTML/CSS/JS, sans serveur ni base de données) inspiré de la structure d'equipemarois.com,
prêt à être hébergé gratuitement sur **GitHub Pages** et branché sur votre **domaine GoDaddy**.

---

## 📁 Structure du projet

```
hypostratege/
├── index.html                      → Accueil            (/)
├── services/index.html             → Services           (/services/)
├── a-propos/index.html             → À propos           (/a-propos/)
├── notre-equipe/index.html         → Notre équipe       (/notre-equipe/)
├── marie-josee-lepage/index.html   → Profil M.-J.       (/marie-josee-lepage/)
├── matis-leger/index.html          → Profil Matis       (/matis-leger/)
├── adam-masse/index.html           → Profil Adam        (/adam-masse/)
├── avis-clients/index.html         → Avis clients       (/avis-clients/)
├── nous-joindre/index.html         → Contact            (/nous-joindre/)
├── css/styles.css        → Tous les styles (couleurs, mise en page)
├── js/main.js            → Menu mobile + envoi du formulaire
├── js/rates.js           → Affichage des taux (marché + votre Google Sheet)
├── data/rates-marche.json→ Taux du marché (régénéré par le robot)
├── scripts/update-rates.mjs        → Script qui interroge la Banque du Canada
├── .github/workflows/update-rates.yml → Robot quotidien (GitHub Actions)
├── assets/images/        → Vos photos (voir LISEZ-MOI.txt)
├── CNAME                 → Votre domaine (à ajuster)
└── .nojekyll             → Indique à GitHub de servir les fichiers tels quels
```

---

## ✅ ÉTAPE 1 — Personnaliser le contenu (avant la mise en ligne)

Ouvrez les fichiers `.html` et remplacez les éléments génériques. Cherchez ces textes :

| À remplacer | Où | Par |
|---|---|---|
| `Prénom Nom`, `HB` / `AB` / `CB` | `notre-equipe.html` | Les vrais noms + initiales des 3 courtiers |
| `000 000-0000` | tous les fichiers | Vos numéros de téléphone |
| `info@hypostratege.com`, `prenom@...` | tous les fichiers | Vos vraies adresses courriel |
| `Adresse, Ville (Québec)` | tous les fichiers | Votre adresse |
| `X,XX %` | `index.html` (tableau des taux) | Les taux courants |
| `[nom du cabinet]` | pied de page | Le cabinet auquel vous êtes rattachés (ex. PlanIPrêt, M3, etc.) |
| Témoignages « Exemple... » | `avis-clients.html`, `index.html` | De vrais avis clients |

**Photos** : déposez vos images dans `assets/images/` puis suivez `assets/images/LISEZ-MOI.txt`.

---

## ✅ ÉTAPE 2 — Activer le formulaire (réception par courriel)

Un site statique ne peut pas envoyer de courriel lui-même (GitHub Pages sert des fichiers, il ne
traite rien). Il faut donc un « facteur » : un service qui reçoit les données et vous les envoie.
On utilise **Web3Forms** — **gratuit, 250 demandes/mois, sans compte à créer**.

### Routage : chaque formulaire va à la bonne personne

Chez Web3Forms, **c'est la clé qui détermine le destinataire**, pas le HTML. Il faut donc
**une clé par destinataire**. Chaque courtier crée la sienne (gratuit, 2 min) et vous la transmet.

| Page | Destinataire | Marqueur à remplacer |
|------|--------------|----------------------|
| `index.html` (accueil) | Marie-Josée | `VOTRE_CLE_WEB3FORMS` |
| `nous-joindre/index.html` | Marie-Josée | `VOTRE_CLE_WEB3FORMS` |
| `marie-josee-lepage/index.html` | Marie-Josée | `VOTRE_CLE_MARIE_JOSEE` |
| `matis-leger/index.html` | Matis | `VOTRE_CLE_MATIS` |
| `adam-masse/index.html` | Adam | `VOTRE_CLE_ADAM` |

**Comment chacun crée sa clé** : aller sur **https://web3forms.com**, entrer son courriel
professionnel (`mleger@planipret.com`, `adammasse@planipret.com`, `mlepage@planipret.com`).
La clé arrive par courriel (ex. `a1b2c3d4-...`). Aucun mot de passe, aucune carte de crédit.

> Marie-Josée peut réutiliser **sa même clé** pour les trois premières lignes du tableau.
> Il ne faut donc que **3 clés au total** (une par courtier).

> Chaque courriel reçu contient un champ **`courtier`** indiquant la page d'origine de la demande.

C'est tout. Les demandes arrivent directement dans votre boîte courriel, et le visiteur voit le
message de confirmation vert sans quitter le site. Un filtre anti-pourriel est déjà inclus
(champ `botcheck` invisible).

> Tant que ce n'est pas fait, le bouton bascule automatiquement sur un envoi par courriel (mailto) de secours.

**Rendez-vous en ligne (optionnel)** : créez un compte gratuit **Calendly**, puis collez le code d'intégration
à l'endroit indiqué en commentaire dans `nous-joindre.html`.

---

## ✅ ÉTAPE 2.5 — Les taux hypothécaires (mise à jour sans effort)

Le site reste **100 % statique**, mais les taux se mettent à jour tout seuls grâce à **deux sources** :

### A. Taux du marché → automatiques (Banque du Canada)
Rien à faire. Un robot **GitHub Actions** (`.github/workflows/update-rates.yml`) interroge chaque jour
l'API publique de la Banque du Canada et réécrit `data/rates-marche.json` (taux préférentiel, hypothécaire
conventionnel, obligation 5 ans). Le site lit ce fichier et affiche les valeurs à jour, avec la date.

> Pour que le robot puisse committer : sur GitHub, **Settings → Actions → General → Workflow permissions**,
> choisissez **« Read and write permissions »**. (Une fois en ligne, vous pouvez aussi le lancer à la main
> depuis l'onglet **Actions → Mise à jour des taux → Run workflow**.)

### B. Vos taux négociés → un Google Sheet (modifiable sans code, sans push)
1. Créez un Google Sheet. Dans un onglet nommé **`Taux`**, mettez ces colonnes :

   | A — Terme | B — Type | C — Taux (%) | D — Mise à jour |
   |-----------|----------|--------------|-----------------|
   | 3 ans     | Fixe fermé | 4.79       | 2026-07-16      |
   | 5 ans     | Fixe fermé | 4.44       |                 |
   | 5 ans     | Variable fermé | 5.20   |                 |

   (La colonne D est facultative : la 1re date trouvée s'affiche comme « mis à jour le… ».)
2. **Partagez** le Sheet : bouton *Partager* → *Tout utilisateur disposant du lien* → **Lecteur**.
3. Copiez l'**identifiant** du Sheet depuis son URL :
   `https://docs.google.com/spreadsheets/d/`**`CET_IDENTIFIANT`**`/edit`
4. Ouvrez `js/rates.js` et collez-le : `var SHEET_ID = "CET_IDENTIFIANT";`

Désormais, pour changer un taux : vous modifiez une cellule du tableur (même depuis votre téléphone).
Le site l'affiche au prochain chargement. **Aucun code, aucun `git push`.** Vous pouvez déléguer cette tâche.

> **Sécurité d'affichage** : si une source est indisponible, les valeurs de secours inscrites dans le HTML
> restent affichées — le tableau n'est jamais brisé.

> **Test en local** : ouvrez le site via le serveur de prévisualisation (http://localhost:8000), pas en
> double-cliquant le fichier — les navigateurs bloquent la lecture de fichiers locaux en mode `file://`.

> ⚖️ **Conformité** : l'affichage de taux par un courtier est encadré (AMF). Gardez la mention « à titre
> indicatif » et validez vos affichages avec votre cabinet.

---

## ✅ ÉTAPE 3 — Publier sur GitHub Pages

### A. Créer le dépôt
1. Créez un compte sur **https://github.com** (gratuit).
2. Cliquez sur **New repository**. Nom suggéré : `hypostratege-site`. Laissez-le **Public**. Créez.

### B. Envoyer les fichiers
**Option simple (sans logiciel)** : sur la page du dépôt, bouton **« Add file » → « Upload files »**,
glissez-déposez TOUT le contenu de ce dossier (les `.html`, les dossiers `css`, `js`, `assets`, et les
fichiers `CNAME` / `.nojekyll`), puis **Commit changes**.

**Option ligne de commande** (si Git est installé) :
```powershell
cd C:\Users\emeri\Travail\hypostratege
git init
git add .
git commit -m "Site Hypostratège"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/hypostratege-site.git
git push -u origin main
```

### C. Activer Pages
1. Dans le dépôt : **Settings → Pages**.
2. Sous *Build and deployment*, **Source : Deploy from a branch**.
3. Branch : **main**, dossier **/ (root)**. **Save**.
4. Après 1–2 minutes, votre site est en ligne à `https://VOTRE-COMPTE.github.io/hypostratege-site/`.

---

## ✅ ÉTAPE 4 — Brancher votre domaine GoDaddy

Objectif : que `www.hypostratege.com` (votre domaine) affiche le site GitHub.

### A. Côté GitHub
1. Ajustez le fichier **`CNAME`** de ce projet pour qu'il contienne EXACTEMENT votre domaine, ex. :
   ```
   www.hypostratege.com
   ```
2. **Settings → Pages → Custom domain** : entrez `www.hypostratege.com` puis **Save**.
3. Cochez **Enforce HTTPS** une fois le domaine vérifié (peut prendre quelques heures).

### B. Côté GoDaddy (DNS)
Connectez-vous à GoDaddy → **My Products → DNS** de votre domaine, puis :

1. **Enregistrement CNAME** pour le sous-domaine `www` :
   | Type | Nom | Valeur |
   |------|-----|--------|
   | CNAME | `www` | `VOTRE-COMPTE.github.io` |

2. **Rediriger le domaine « nu »** (`hypostratege.com` sans www) vers le www. Deux façons :
   - **Simple** : GoDaddy → *Forwarding / Redirection de domaine* → rediriger `hypostratege.com` vers `https://www.hypostratege.com` (301, permanent).
   - **Ou via 4 enregistrements A** pointant `@` vers les IP de GitHub Pages :
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
     (Type **A**, Nom **@**, une ligne par IP.)

3. Enregistrez. La propagation DNS prend de **quelques minutes à 48 h** (souvent < 1 h).

> ⚠️ Utilisez SOIT le www en CNAME + redirection du nu, SOIT les 4 A + un CNAME www. Le combo
> « CNAME www vers github.io » + « 4 A sur @ » est le plus courant et le plus fiable.

---

## 🔄 Mettre à jour le site plus tard
Modifiez un fichier → réenvoyez-le sur GitHub (Upload files, ou `git add/commit/push`).
GitHub Pages se met à jour tout seul en 1–2 minutes.

---

## 🎨 Changer les couleurs
Tout est centralisé en haut de `css/styles.css`, dans le bloc `:root` :
```css
--royal: #0A2A5E;   /* bleu royal foncé */
--gold:  #C8A24B;   /* or */
```
Modifiez ces valeurs et toute la palette du site suit.
