# Gooningmon

Application web (HTML/CSS/JS + Firebase Realtime Database) :
- Connexion Google.
- Attribution aléatoire d'un Pokémon de la Gen 1.
- Reroll limité à 3.
- Upload d'un dessin (stocké en base).
- Galerie publique + page Fresque dynamique.
- Navigation SPA (Accueil / Galerie / Fresque) via `history.pushState` compatible GitHub Pages (`/Gooningmon/...`).

## Configuration Firebase (important pour GitHub Pages)

Le front est prévu pour tourner sur **`joykix.github.io`**.

### 1) Authentication > Sign-in method
Active **Google**.

### 2) Authentication > Settings > Authorized domains
Ajoute au minimum:
- `joykix.github.io`
- `localhost`
- `<project-id>.firebaseapp.com`

### 3) Dans `app.js`
Vérifie `firebaseConfig` (`apiKey`, `authDomain`, `projectId`, etc.).

### 4) Déploiement
Publie sur GitHub Pages sous le domaine `joykix.github.io` pour éviter l'erreur `auth/unauthorized-domain`.

## Parcours utilisateur

1. Connexion Google.
2. Attribution d'un Pokémon.
3. Upload du dessin => statut Pokémon `completed`.
4. Bouton **"Recommencer une nouvelle aventure"** :
   - remet l'utilisateur à l'état `idle`
   - remet `rerollsUsed` à `0`
   - retire l'association `pokemonId`
   - **conserve** le dessin terminé dans la galerie/fresque.

## Fresque

- Source : tous les Pokémon `completed` avec image.
- Modes :
  - Automatique (grille équilibrée)
  - Colonnes fixes
  - Lignes fixes
- Bonus : export PNG de la fresque depuis le navigateur.

## Routage GitHub Pages (SPA)

Le fichier `404.html` doit être présent (copie de `index.html`) pour que le rechargement direct de `/galerie` ou `/fresque` fonctionne sur GitHub Pages.
