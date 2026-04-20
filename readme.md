# Gooningmon

Application web simple (HTML/CSS/JS) avec Firebase pour:
- Connexion Google.
- Attribution aléatoire d'un Pokémon de la Gen 1.
- Upload de dessin (stocké en base Realtime Database).
- Galerie publique.

## Configuration Firebase (important pour GitHub Pages)

Le front est prévu pour tourner sur **`joykix.github.io`**.

### 1) Authentication > Sign-in method
Active **Google**.

### 2) Authentication > Settings > Authorized domains
Ajoute au minimum:
- `joykix.github.io`
- `localhost` (pour les tests locaux)
- `<project-id>.firebaseapp.com` (souvent ajouté automatiquement)

### 3) Dans `app.js`
Vérifie `firebaseConfig` (`apiKey`, `authDomain`, `projectId`, etc.).

### 4) Déploiement
Publie le repo sur GitHub Pages sous le domaine `joykix.github.io` pour éviter l'erreur `auth/unauthorized-domain`.

## Améliorations de connexion Google incluses

- Fallback popup → redirect si le popup est bloqué.
- Message explicite si le domaine n'est pas autorisé.
- Vérification du hostname attendu (`joykix.github.io`) avec feedback utilisateur.
- `prompt: "select_account"` pour forcer le choix du compte Google.
