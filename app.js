import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  runTransaction,
  onValue
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmC1_Hklc1SgvVQXyNT07TYDfVn2euRO8",
  authDomain: "stream-overlay-creator.firebaseapp.com",
  databaseURL: "https://stream-overlay-creator-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stream-overlay-creator",
  storageBucket: "stream-overlay-creator.firebasestorage.app",
  messagingSenderId: "79079678682",
  appId: "1:79079678682:web:98dd5a684859ee98273be3"
};

const ADMIN_UIDS = [];
const ADMIN_EMAILS = ["duveaubenoit@gmail.com"];

const APP_HOSTNAME = window.location.hostname;
const EXPECTED_HOSTNAME = "joykix.github.io";
const IS_GITHUB_PAGES = APP_HOSTNAME.endsWith(".github.io");
const REPO_BASE_PATH = "/Gooningmon";

const ROUTES = {
  "/": "view-home",
  "/galerie": "view-galerie",
  "/fresque": "view-fresque"
};

const ROUTES = {
  "/": "view-home",
  "/galerie": "view-galerie",
  "/fresque": "view-fresque"
};

const POKEMON_151 = [
  "Bulbizarre", "Herbizarre", "Florizarre", "Salamèche", "Reptincel", "Dracaufeu", "Carapuce", "Carabaffe", "Tortank", "Chenipan", "Chrysacier", "Papilusion", "Aspicot", "Coconfort", "Dardargnan", "Roucool", "Roucoups", "Roucarnage", "Rattata", "Rattatac", "Piafabec", "Rapasdepic", "Abo", "Arbok", "Pikachu", "Raichu", "Sabelette", "Sablaireau", "Nidoran♀", "Nidorina", "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Mélofée", "Mélodelfe", "Goupix", "Feunard", "Rondoudou", "Grodoudou", "Nosferapti", "Nosferalto", "Mystherbe", "Ortide", "Rafflesia", "Paras", "Parasect", "Mimitoss", "Aéromite", "Taupiqueur", "Triopikeur", "Miaouss", "Persian", "Psykokwak", "Akwakwak", "Férosinge", "Colossinge", "Caninos", "Arcanin", "Ptitard", "Têtarte", "Tartard", "Abra", "Kadabra", "Alakazam", "Machoc", "Machopeur", "Mackogneur", "Chétiflor", "Boustiflor", "Empiflor", "Tentacool", "Tentacruel", "Racaillou", "Gravalanch", "Grolem", "Ponyta", "Galopa", "Ramoloss", "Flagadoss", "Magnéti", "Magnéton", "Canarticho", "Doduo", "Dodrio", "Otaria", "Lamantine", "Tadmorv", "Grotadmorv", "Kokiyas", "Crustabri", "Fantominus", "Spectrum", "Ectoplasma", "Onix", "Soporifik", "Hypnomade", "Krabby", "Krabboss", "Voltorbe", "Électrode", "Noeunoeuf", "Noadkoko", "Osselait", "Ossatueur", "Kicklee", "Tygnon", "Excelangue", "Smogo", "Smogogo", "Rhinocorne", "Rhinoféros", "Leveinard", "Saquedeneu", "Kangourex", "Hypotrempe", "Hypocéan", "Poissirène", "Poissoroy", "Stari", "Staross", "M. Mime", "Insécateur", "Lippoutou", "Élektek", "Magmar", "Scarabrute", "Tauros", "Magicarpe", "Léviator", "Lokhlass", "Métamorph", "Évoli", "Aquali", "Voltali", "Pyroli", "Porygon", "Amonita", "Amonistar", "Kabuto", "Kabutops", "Ptéra", "Ronflex", "Artikodin", "Électhor", "Sulfura", "Minidraco", "Draco", "Dracolosse", "Mewtwo", "Mew"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const el = {
  pageContainer: document.querySelector(".page-transition"),
  routeViews: document.querySelectorAll(".route-view"),
  navTabs: document.querySelectorAll(".nav-tab"),
  authLoggedOut: document.getElementById("authLoggedOut"),
  authLoggedIn: document.getElementById("authLoggedIn"),
  authUserPhoto: document.getElementById("authUserPhoto"),
  authUserName: document.getElementById("authUserName"),
  authUserEmail: document.getElementById("authUserEmail"),
  nicknameForm: document.getElementById("nicknameForm"),
  nicknameInput: document.getElementById("nicknameInput"),
  nicknameBtn: document.getElementById("nicknameBtn"),
  authStatus: document.getElementById("authStatus"),
  googleLoginBtn: document.getElementById("googleLoginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  appSection: document.getElementById("appSection"),
  welcomeText: document.getElementById("welcomeText"),
  statusText: document.getElementById("statusText"),
  pokemonCard: document.getElementById("pokemonCard"),
  assignBtn: document.getElementById("assignBtn"),
  rerollBtn: document.getElementById("rerollBtn"),
  restartBtn: document.getElementById("restartBtn"),
  rerollInfo: document.getElementById("rerollInfo"),
  uploadForm: document.getElementById("uploadForm"),
  uploadBtn: document.getElementById("uploadBtn"),
  drawingFile: document.getElementById("drawingFile"),
  gallery: document.getElementById("gallery"),
  fresqueGrid: document.getElementById("fresqueGrid"),
  fresqueInfo: document.getElementById("fresqueInfo"),
  fresqueMode: document.getElementById("fresqueMode"),
  fresqueValue: document.getElementById("fresqueValue"),
  fresqueForm: document.getElementById("fresqueForm"),
  downloadFresqueBtn: document.getElementById("downloadFresqueBtn"),
  adminSection: document.getElementById("adminSection"),
  adminList: document.getElementById("adminList"),
  toast: document.getElementById("toast")
};

let currentUser = null;
let currentPokemon = null;
let isAuthActionPending = false;
let completedPokemonList = [];

function normalizeEmail(value) {
  return (value || "").trim().toLowerCase();
}

function sanitizeNickname(value) {
  return (value || "").trim().slice(0, 30);
}

function logFirebaseError(context, err) {
  console.error(`[Firebase][${context}]`, {
    code: err?.code || "unknown",
    message: err?.message || "Unknown Firebase error",
    raw: err
  });
}

function showToast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.style.borderLeftColor = isError ? "#ff718f" : "#44d09f";
  el.toast.classList.remove("hidden");
  setTimeout(() => el.toast.classList.add("hidden"), 3200);
}

function setAuthBusy(busy) {
  el.googleLoginBtn.disabled = busy;
  el.logoutBtn.disabled = busy;
  el.nicknameBtn.disabled = busy;
}

function isWhitelistedAdmin(authUser) {
  const email = normalizeEmail(authUser?.email);
  return ADMIN_UIDS.includes(authUser?.uid) || (email && ADMIN_EMAILS.includes(email));
}

function getDisplayNameFromAuth(authUser) {
  if (authUser?.displayName?.trim()) return authUser.displayName.trim();
  const email = authUser?.email || "";
  return email.includes("@") ? email.split("@")[0] : "Utilisateur";
}

function getSafeRoute(pathname) {
  return ROUTES[pathname] ? pathname : "/";
}

function getAppPathFromLocation() {
  const currentPath = window.location.pathname || "/";
  if (currentPath === REPO_BASE_PATH || currentPath.startsWith(`${REPO_BASE_PATH}/`)) {
    const relative = currentPath.slice(REPO_BASE_PATH.length) || "/";
    return relative.startsWith("/") ? relative : `/${relative}`;
  }
  return currentPath;
}

function toBrowserPath(routePath) {
  if (IS_GITHUB_PAGES) {
    return routePath === "/" ? `${REPO_BASE_PATH}/` : `${REPO_BASE_PATH}${routePath}`;
  }
  return routePath;
}

function navigateTo(pathname, pushState = true) {
  const safePath = getSafeRoute(pathname);
  const browserPath = toBrowserPath(safePath);
  if (pushState && window.location.pathname !== browserPath) {
    window.history.pushState({}, "", browserPath);
  }

  el.pageContainer.classList.add("leaving");
  window.setTimeout(() => {
    el.routeViews.forEach((view) => view.classList.toggle("hidden", view.id !== ROUTES[safePath]));
    el.navTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.route === safePath));
    el.pageContainer.classList.remove("leaving");
  }, 110);
}

function bindRouter() {
  el.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => navigateTo(tab.dataset.route));
  });
  window.addEventListener("popstate", () => navigateTo(getAppPathFromLocation(), false));
  navigateTo(getAppPathFromLocation(), false);
}

async function ensurePokemonPool() {
  const snap = await get(ref(db, "pokemon"));
  if (snap.exists()) return;

  const payload = {};
  POKEMON_151.forEach((name, i) => {
    const id = i + 1;
    payload[id] = { id, name, status: "available", userId: null, imageUrl: null, assignedAt: null, completedAt: null };
  });
  await set(ref(db, "pokemon"), payload);
}

async function syncCurrentUserFromAuth(authUser) {
  const userRef = ref(db, `users/${authUser.uid}`);
  const snap = await get(userRef);
  const existing = snap.exists() ? snap.val() : {};

  const email = normalizeEmail(authUser.email);
  const adminByWhitelist = isWhitelistedAdmin(authUser);
  const role = adminByWhitelist || existing.role === "admin" ? "admin" : "user";

  const merged = {
    displayName: sanitizeNickname(existing.displayName) || getDisplayNameFromAuth(authUser),
    email,
    emailNorm: email,
    photoURL: authUser.photoURL || null,
    provider: "google",
    role,
    isAdmin: role === "admin",
    rerollsUsed: existing.rerollsUsed || 0,
    pokemonId: existing.pokemonId || null,
    status: existing.status || "idle",
    createdAt: existing.createdAt || Date.now(),
    updatedAt: Date.now()
  };

  await update(userRef, merged);
  currentUser = { id: authUser.uid, ...merged };
}

function renderAuthState() {
  const logged = Boolean(currentUser);
  el.authLoggedOut.classList.toggle("hidden", logged);
  el.authLoggedIn.classList.toggle("hidden", !logged);
  el.appSection.classList.toggle("hidden", !logged);

  if (!logged) {
    el.authStatus.textContent = IS_GITHUB_PAGES
      ? "Non connecté. Utilise la connexion Google (popup/redirect)."
      : `Non connecté. Pour GitHub Pages, ouvre ce site depuis https://${EXPECTED_HOSTNAME}.`;
    el.authUserPhoto.classList.add("hidden");
    el.authUserPhoto.removeAttribute("src");
    el.authUserName.textContent = "Compte connecté";
    el.authUserEmail.textContent = "";
    el.welcomeText.textContent = "Bienvenue";
    el.statusText.textContent = "";
    el.adminSection.classList.add("hidden");
    el.rerollInfo.textContent = "";
    return;
  }

  el.authUserName.textContent = currentUser.displayName;
  el.nicknameInput.value = currentUser.displayName || "";
  el.authUserEmail.textContent = currentUser.email || "";

  if (currentUser.photoURL) {
    el.authUserPhoto.src = currentUser.photoURL;
    el.authUserPhoto.classList.remove("hidden");
  } else {
    el.authUserPhoto.classList.add("hidden");
  }

  const roleLabel = currentUser.role === "admin" ? "Administrateur" : "Utilisateur";
  el.authStatus.textContent = `Connecté via Google (${roleLabel}).`;
  el.welcomeText.textContent = `Bienvenue, ${currentUser.displayName}`;
  el.statusText.textContent = `Rôle: ${roleLabel}`;
  el.adminSection.classList.toggle("hidden", !currentUser.isAdmin);
  renderMyPokemon();
}

function renderMyPokemon() {
  const rerollsUsed = currentUser?.rerollsUsed || 0;
  const rerollsLeft = Math.max(0, 3 - rerollsUsed);
  el.rerollInfo.textContent = `Rerolls restants: ${rerollsLeft}/3`;

  if (!currentPokemon) {
    el.pokemonCard.className = "pokemon-card muted";
    el.pokemonCard.textContent = "Aucun Pokémon attribué.";
    el.assignBtn.disabled = false;
    el.rerollBtn.disabled = true;
    el.uploadBtn.disabled = true;
    el.restartBtn.classList.add("hidden");
    return;
  }

  const statusClass = currentPokemon.status === "completed" ? "completed" : "assigned";
  el.pokemonCard.className = "pokemon-card";
  el.pokemonCard.innerHTML = `
    <div class="pokemon-id">#${String(currentPokemon.id).padStart(3, "0")}</div>
    <div class="pokemon-name">${currentPokemon.name}</div>
    <span class="badge ${statusClass}">${currentPokemon.status === "completed" ? "Terminé" : "En cours"}</span>
  `;

  const isAssigned = currentPokemon.status === "assigned";
  const isCompleted = currentPokemon.status === "completed";

  el.assignBtn.disabled = true;
  el.rerollBtn.disabled = !isAssigned || rerollsUsed >= 3;
  el.uploadBtn.disabled = !isAssigned;
  el.restartBtn.classList.toggle("hidden", !isCompleted);
}

function getCompletedPokemon(allPokemon) {
  return Object.values(allPokemon || {})
    .filter((p) => p.status === "completed" && p.imageUrl)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
}

function renderGallery() {
  if (!completedPokemonList.length) {
    el.gallery.innerHTML = '<p class="small">Aucun dessin terminé pour le moment.</p>';
    return;
  }

  el.gallery.innerHTML = completedPokemonList.map((p) => `
    <article class="gallery-item">
      <img src="${p.imageUrl}" alt="Dessin de ${p.name}" loading="lazy" />
      <div class="gallery-meta">
        <strong>#${String(p.id).padStart(3, "0")} ${p.name}</strong>
        ${p.artistName ? `<div class="small">Par ${p.artistName}</div>` : ""}
      </div>
    </article>
  `).join("");
}

function computeFresqueLayout(total, mode, value) {
  if (!total) return { cols: 0, rows: 0 };
  if (mode === "columns") {
    const cols = Math.max(1, value);
    return { cols, rows: Math.ceil(total / cols) };
  }
  if (mode === "rows") {
    const rows = Math.max(1, value);
    return { rows, cols: Math.ceil(total / rows) };
  }

  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  return { cols, rows: Math.ceil(total / cols) };
}

function renderFresque() {
  if (!completedPokemonList.length) {
    el.fresqueInfo.textContent = "Aucun dessin terminé pour construire une fresque pour le moment.";
    el.fresqueGrid.innerHTML = "";
    el.downloadFresqueBtn.disabled = true;
    return;
  }

  const mode = el.fresqueMode.value;
  const value = Number(el.fresqueValue.value || 1);
  const fresquePokemonList = [...completedPokemonList].sort((a, b) => a.id - b.id);
  el.fresqueValue.disabled = mode === "auto";

  const { cols, rows } = computeFresqueLayout(fresquePokemonList.length, mode, value);
  el.fresqueInfo.textContent = `${fresquePokemonList.length} dessins · ${cols} colonnes × ${rows} lignes`;
  el.fresqueGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  el.fresqueGrid.innerHTML = fresquePokemonList.map((p) => `
    <article class="fresque-cell">
      <img src="${p.imageUrl}" alt="${p.name}" loading="lazy" />
      <div class="fresque-meta">#${String(p.id).padStart(3, "0")} ${p.name}</div>
    </article>
  `).join("");
  el.downloadFresqueBtn.disabled = false;
}

async function syncCurrentPokemon() {
  if (!currentUser?.pokemonId) {
    currentPokemon = null;
    renderMyPokemon();
    return;
  }

  const snap = await get(ref(db, `pokemon/${currentUser.pokemonId}`));
  currentPokemon = snap.exists() ? snap.val() : null;
  renderMyPokemon();
}

async function pickAndAssignPokemon(user, oldPokemonId = null) {
  const allSnap = await get(ref(db, "pokemon"));
  const all = allSnap.val() || {};
  const available = Object.values(all).filter((p) => p.status === "available");

  if (!available.length) throw new Error("Plus aucun Pokémon disponible.");

  let selected = null;
  for (let i = 0; i < 20 && !selected; i += 1) {
    const candidate = available[Math.floor(Math.random() * available.length)];
    const tx = await runTransaction(ref(db, `pokemon/${candidate.id}`), (p) => {
      if (!p || p.status !== "available") return;
      return {
        ...p,
        status: "assigned",
        userId: user.id,
        assignedAt: Date.now(),
        completedAt: null,
        imageUrl: null,
        artistName: null
      };
    });
    if (tx.committed) selected = tx.snapshot.val();
  }

  if (!selected) throw new Error("Conflit d'attribution, réessaie.");

  const updates = {
    [`users/${user.id}/pokemonId`]: selected.id,
    [`users/${user.id}/status`]: "assigned"
  };

  if (oldPokemonId) {
    updates[`pokemon/${oldPokemonId}`] = {
      ...all[oldPokemonId],
      status: "available",
      userId: null,
      assignedAt: null,
      completedAt: null,
      imageUrl: null,
      artistName: null
    };
  }

  await update(ref(db), updates);
  return selected;
}

async function assignPokemon() {
  if (currentUser?.pokemonId && currentPokemon) {
    showToast("Ton aventure est déjà en cours (ou terminée).", true);
    return;
  }

  const selected = await pickAndAssignPokemon(currentUser);
  currentUser.pokemonId = selected.id;
  currentUser.status = "assigned";
  currentPokemon = selected;
  renderMyPokemon();
  showToast(`Pokémon attribué: ${selected.name}`);
}

async function rerollPokemon() {
  if (!currentPokemon || currentPokemon.status !== "assigned") throw new Error("Aucun Pokémon en cours.");
  const rerollsUsed = currentUser.rerollsUsed || 0;
  if (rerollsUsed >= 3) throw new Error("Limite de reroll atteinte.");

  const selected = await pickAndAssignPokemon(currentUser, currentPokemon.id);
  const newCount = rerollsUsed + 1;
  await update(ref(db), {
    [`users/${currentUser.id}/rerollsUsed`]: newCount,
    [`users/${currentUser.id}/pokemonId`]: selected.id,
    [`users/${currentUser.id}/status`]: "assigned"
  });

  currentUser.rerollsUsed = newCount;
  currentUser.pokemonId = selected.id;
  currentUser.status = "assigned";
  currentPokemon = selected;
  renderMyPokemon();
  showToast(`Reroll réussi: ${selected.name}`);
}

async function uploadDrawing(file) {
  if (!currentPokemon || currentPokemon.status !== "assigned") throw new Error("Aucun Pokémon en cours.");
  const imageData = await fileToDataUrl(file);

  await update(ref(db), {
    [`pokemon/${currentPokemon.id}/status`]: "completed",
    [`pokemon/${currentPokemon.id}/imageUrl`]: imageData,
    [`pokemon/${currentPokemon.id}/artistName`]: currentUser.displayName,
    [`pokemon/${currentPokemon.id}/completedAt`]: Date.now(),
    [`users/${currentUser.id}/status`]: "completed"
  });

  currentPokemon.status = "completed";
  currentPokemon.imageUrl = imageData;
  currentPokemon.artistName = currentUser.displayName;
  currentUser.status = "completed";
  renderMyPokemon();
  showToast("Dessin uploadé avec succès ! Tu peux recommencer une nouvelle aventure.");
}

async function restartAdventure() {
  if (!currentUser?.id || !currentPokemon || currentPokemon.status !== "completed") {
    throw new Error("Aucun Pokémon terminé à réinitialiser.");
  }

  await update(ref(db), {
    [`users/${currentUser.id}/pokemonId`]: null,
    [`users/${currentUser.id}/status`]: "idle",
    [`users/${currentUser.id}/rerollsUsed`]: 0,
    [`users/${currentUser.id}/updatedAt`]: Date.now()
  });

  currentUser.pokemonId = null;
  currentUser.status = "idle";
  currentUser.rerollsUsed = 0;
  currentPokemon = null;
  renderMyPokemon();
  showToast("Aventure réinitialisée. Tu peux obtenir un nouveau Pokémon.");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    reader.readAsDataURL(file);
  });
}

function bindPokemonFeed() {
  onValue(ref(db, "pokemon"), (snap) => {
    const allPokemon = snap.val() || {};
    completedPokemonList = getCompletedPokemon(allPokemon);
    renderGallery();
    renderFresque();
  });
}

async function adminSetAvailable(pokemon) {
  const updates = {
    [`pokemon/${pokemon.id}/status`]: "available",
    [`pokemon/${pokemon.id}/imageUrl`]: null,
    [`pokemon/${pokemon.id}/artistName`]: null,
    [`pokemon/${pokemon.id}/userId`]: null,
    [`pokemon/${pokemon.id}/assignedAt`]: null,
    [`pokemon/${pokemon.id}/completedAt`]: null
  };

  if (pokemon.userId) {
    updates[`users/${pokemon.userId}/pokemonId`] = null;
    updates[`users/${pokemon.userId}/status`] = "idle";
  }

  await update(ref(db), updates);
  showToast(`Pokémon #${pokemon.id} remis disponible.`);
}

function bindAdmin() {
  onValue(ref(db, "pokemon"), (snap) => {
    if (!currentUser?.isAdmin) return;
    const items = Object.values(snap.val() || {})
      .filter((p) => p.status !== "available")
      .sort((a, b) => a.id - b.id);

    if (!items.length) {
      el.adminList.innerHTML = '<p class="small">Rien à modérer.</p>';
      return;
    }

    el.adminList.innerHTML = items.map((p) => `
      <div class="admin-row">
        <div>
          <strong>#${String(p.id).padStart(3, "0")} ${p.name}</strong>
          <div class="small">Statut: ${p.status} ${p.userId ? `· User UID: ${p.userId}` : ""}</div>
        </div>
        <div class="admin-actions">
          ${p.status === "completed" ? `<button data-action="delete-drawing" data-id="${p.id}">Supprimer dessin</button>` : ""}
          ${p.status === "assigned" ? `<button data-action="reset-inprogress" data-id="${p.id}">Reset en cours</button>` : ""}
          <button data-action="force-available" data-id="${p.id}" class="ghost">Remettre dispo</button>
        </div>
      </div>
    `).join("");
  });

  el.adminList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn || !currentUser?.isAdmin) return;

    try {
      const snap = await get(ref(db, `pokemon/${btn.dataset.id}`));
      if (!snap.exists()) return;

      await adminSetAvailable(snap.val());
      await syncCurrentUser();
      await syncCurrentPokemon();
    } catch (err) {
      showToast(err.message || "Action admin impossible.", true);
    }
  });
}

async function syncCurrentUser() {
  if (!currentUser?.id) return;
  const snap = await get(ref(db, `users/${currentUser.id}`));
  currentUser = snap.exists() ? { id: currentUser.id, ...snap.val() } : null;
  renderAuthState();
}

async function loginWithGoogle() {
  if (isAuthActionPending) return;

  if (IS_GITHUB_PAGES && APP_HOSTNAME !== EXPECTED_HOSTNAME) {
    showToast(`Domaine invalide (${APP_HOSTNAME}). Utilise https://${EXPECTED_HOSTNAME}.`, true);
    return;
  }

  isAuthActionPending = true;
  setAuthBusy(true);
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    logFirebaseError("google-login-popup", err);

    const needsRedirectFallback = [
      "auth/popup-blocked",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment"
    ].includes(err?.code);

    if (needsRedirectFallback) {
      showToast("Popup bloquée, redirection en cours...");
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    if (err?.code === "auth/unauthorized-domain") {
      showToast(`Domaine non autorisé. Ajoute ${EXPECTED_HOSTNAME} dans Firebase Authentication > Authorized domains.`, true);
      return;
    }

    showToast(err.message || "Connexion Google impossible.", true);
  } finally {
    isAuthActionPending = false;
    setAuthBusy(false);
  }
}

async function logout() {
  if (isAuthActionPending) return;
  isAuthActionPending = true;
  setAuthBusy(true);
  try {
    await signOut(auth);
    showToast("Déconnecté.");
  } catch (err) {
    logFirebaseError("logout", err);
    showToast(err.message || "Déconnexion impossible.", true);
  } finally {
    isAuthActionPending = false;
    setAuthBusy(false);
  }
}

async function updateNickname(newNickname) {
  if (!currentUser?.id) throw new Error("Connecte-toi d'abord.");
  const nickname = sanitizeNickname(newNickname);
  if (!nickname) throw new Error("Le pseudo ne peut pas être vide.");

  await update(ref(db, `users/${currentUser.id}`), {
    displayName: nickname,
    updatedAt: Date.now()
  });

  currentUser.displayName = nickname;
  renderAuthState();
  showToast("Pseudo mis à jour.");
}

async function downloadFresqueImage() {
  if (!completedPokemonList.length) throw new Error("Aucune image à exporter.");

  const mode = el.fresqueMode.value;
  const value = Number(el.fresqueValue.value || 1);
  const fresquePokemonList = [...completedPokemonList].sort((a, b) => a.id - b.id);
  const { cols } = computeFresqueLayout(fresquePokemonList.length, mode, value);

  const cell = 220;
  const rows = Math.ceil(fresquePokemonList.length / cols);
  const canvas = document.createElement("canvas");
  canvas.width = cols * cell;
  canvas.height = rows * cell;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tasks = fresquePokemonList.map((pokemon, index) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      ctx.drawImage(img, col * cell, row * cell, cell, cell);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = pokemon.imageUrl;
  }));

  await Promise.all(tasks);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `gooningmon-fresque-${Date.now()}.png`;
  link.click();
}

function explainSetupIfNeeded() {
  if (!IS_GITHUB_PAGES || APP_HOSTNAME === EXPECTED_HOSTNAME) return;
  console.warn(`[Firebase][auth-domain] Domaine courant: ${APP_HOSTNAME}. Domaine recommandé: ${EXPECTED_HOSTNAME}`);
}

function bindEvents() {
  el.googleLoginBtn.addEventListener("click", loginWithGoogle);
  el.logoutBtn.addEventListener("click", logout);

  el.nicknameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await updateNickname(el.nicknameInput.value);
    } catch (err) {
      showToast(err.message || "Impossible de mettre à jour le pseudo.", true);
    }
  });

  el.assignBtn.addEventListener("click", async () => {
    try {
      await assignPokemon();
    } catch (err) {
      showToast(err.message || "Attribution impossible.", true);
    }
  });

  el.rerollBtn.addEventListener("click", async () => {
    try {
      await rerollPokemon();
    } catch (err) {
      showToast(err.message || "Reroll impossible.", true);
    }
  });

  el.restartBtn.addEventListener("click", async () => {
    try {
      await restartAdventure();
    } catch (err) {
      showToast(err.message || "Impossible de recommencer.", true);
    }
  });

  el.uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = el.drawingFile.files?.[0];
    if (!file) return;
    try {
      await uploadDrawing(file);
      el.uploadForm.reset();
    } catch (err) {
      showToast(err.message || "Upload impossible.", true);
    }
  });

  el.fresqueForm.addEventListener("input", renderFresque);
  el.downloadFresqueBtn.addEventListener("click", async () => {
    try {
      await downloadFresqueImage();
      showToast("Fresque téléchargée.");
    } catch (err) {
      showToast(err.message || "Export impossible.", true);
    }
  });
}

async function boot() {
  explainSetupIfNeeded();
  bindRouter();
  bindEvents();
  await ensurePokemonPool();
  bindPokemonFeed();
  bindAdmin();

  try {
    await getRedirectResult(auth);
  } catch (err) {
    logFirebaseError("google-login-redirect", err);
    if (err?.code === "auth/unauthorized-domain") {
      showToast(`Domaine non autorisé. Vérifie que ${EXPECTED_HOSTNAME} est ajouté dans Firebase.`, true);
    } else {
      showToast(err.message || "Retour de connexion Google impossible.", true);
    }
  }

  onAuthStateChanged(auth, async (authUser) => {
    try {
      if (!authUser) {
        currentUser = null;
        currentPokemon = null;
        renderAuthState();
        return;
      }

      await syncCurrentUserFromAuth(authUser);
      renderAuthState();
      await syncCurrentPokemon();
    } catch (err) {
      logFirebaseError("auth-state", err);
      showToast("Impossible de synchroniser le compte connecté.", true);
    }
  });
}

boot().catch((err) => {
  logFirebaseError("boot", err);
  showToast(err.message || "Erreur d'initialisation.", true);
});
