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
  remove,
  runTransaction,
  onValue
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
import JSZip from "https://esm.sh/jszip@3.10.1";

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

function generationRootPath(generation = activeGeneration) {
  return `generations/${generation}`;
}

function generationPokemonPath(generation = activeGeneration) {
  return `${generationRootPath(generation)}/pokemon`;
}

function generationUsersPath(generation = activeGeneration) {
  return `${generationRootPath(generation)}/users`;
}

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
  fresqueShowNumber: document.getElementById("fresqueShowNumber"),
  fresqueShowName: document.getElementById("fresqueShowName"),
  fresqueShowPseudo: document.getElementById("fresqueShowPseudo"),
  downloadFresqueBtn: document.getElementById("downloadFresqueBtn"),
  adminSection: document.getElementById("adminSection"),
  adminAssignForm: document.getElementById("adminAssignForm"),
  adminAssignNumber: document.getElementById("adminAssignNumber"),
  adminAssignName: document.getElementById("adminAssignName"),
  adminAssignPseudo: document.getElementById("adminAssignPseudo"),
  adminAssignBtn: document.getElementById("adminAssignBtn"),
  downloadGenerationZipBtn: document.getElementById("downloadGenerationZipBtn"),
  importGenerationZipBtn: document.getElementById("importGenerationZipBtn"),
  importGenerationZipInput: document.getElementById("importGenerationZipInput"),
  generationSelect: document.getElementById("generationSelect"),
  changeGenerationBtn: document.getElementById("changeGenerationBtn"),
  adminList: document.getElementById("adminList"),
  toast: document.getElementById("toast")
};

let currentUser = null;
let currentPokemon = null;
let isAuthActionPending = false;
let completedPokemonList = [];
let activeGeneration = "gen1";
let unbindPokemonFeed = null;
let unbindAdminFeed = null;
let isAdminListClickBound = false;
const fresqueDisplayOptions = { number: true, name: true, pseudo: true };

function normalizeEmail(value) {
  return (value || "").trim().toLowerCase();
}

function sanitizeNickname(value) {
  return (value || "").trim().slice(0, 30);
}

function normalizePokemonName(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function hasNickname(user = currentUser) {
  return Boolean(sanitizeNickname(user?.displayName));
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
  const snap = await get(ref(db, generationPokemonPath()));
  if (snap.exists()) return;

  const payload = {};
  POKEMON_151.forEach((name, i) => {
    const id = i + 1;
    payload[id] = { id, name, status: "available", userId: null, imageUrl: null, assignedAt: null, completedAt: null, authorName: null };
  });
  await set(ref(db, generationPokemonPath()), payload);
}

async function syncCurrentUserFromAuth(authUser) {
  const userRef = ref(db, `${generationUsersPath()}/${authUser.uid}`);
  const snap = await get(userRef);
  const existing = snap.exists() ? snap.val() : {};

  const email = normalizeEmail(authUser.email);
  const adminByWhitelist = isWhitelistedAdmin(authUser);
  const role = adminByWhitelist || existing.role === "admin" ? "admin" : "user";

  const merged = {
    displayName: sanitizeNickname(existing.displayName),
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
    el.authUserName.textContent = "Compte";
    el.authUserEmail.textContent = "";
    el.welcomeText.textContent = "Compte";
    el.statusText.textContent = "";
    el.adminSection.classList.add("hidden");
    el.rerollInfo.textContent = "";
    return;
  }

  el.authUserName.textContent = currentUser.displayName || "Pseudo requis";
  el.nicknameInput.value = currentUser.displayName || "";
  el.authUserEmail.textContent = currentUser.email || "";

  if (currentUser.photoURL) {
    el.authUserPhoto.src = currentUser.photoURL;
    el.authUserPhoto.classList.remove("hidden");
  } else {
    el.authUserPhoto.classList.add("hidden");
  }

  const roleLabel = currentUser.role === "admin" ? "Administrateur" : "Utilisateur";
  if (!hasNickname()) {
    el.authStatus.textContent = "Ajoute un pseudo.";
    el.welcomeText.textContent = "Pseudo requis";
    el.statusText.textContent = "Entre un pseudo pour continuer.";
  } else {
    el.authStatus.textContent = `Connecté (${roleLabel}).`;
    el.welcomeText.textContent = currentUser.displayName;
    el.statusText.textContent = roleLabel;
  }
  el.adminSection.classList.toggle("hidden", !currentUser.isAdmin);
  el.downloadGenerationZipBtn.disabled = !currentUser.isAdmin;
  el.importGenerationZipBtn.disabled = !currentUser.isAdmin;
  el.importGenerationZipInput.disabled = !currentUser.isAdmin;
  el.changeGenerationBtn.disabled = !currentUser.isAdmin;
  renderMyPokemon();
}

function renderMyPokemon() {
  const rerollsUsed = currentUser?.rerollsUsed || 0;
  const rerollsLeft = Math.max(0, 3 - rerollsUsed);
  el.rerollInfo.textContent = `Reroll: ${rerollsLeft}/3`;

  if (currentUser && !hasNickname()) {
    el.pokemonCard.className = "pokemon-card muted";
    el.pokemonCard.textContent = "Pseudo requis.";
    el.assignBtn.disabled = true;
    el.rerollBtn.disabled = true;
    el.uploadBtn.disabled = true;
    el.restartBtn.classList.add("hidden");
    return;
  }

  if (!currentPokemon) {
    el.pokemonCard.className = "pokemon-card muted";
    el.pokemonCard.textContent = "Aucun Pokémon.";
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
    el.gallery.innerHTML = '<p class="small">Aucun dessin.</p>';
    return;
  }

  el.gallery.innerHTML = completedPokemonList.map((p) => `
    <article class="gallery-item">
      <img src="${p.imageUrl}" alt="Dessin de ${p.name}" loading="lazy" />
      <div class="gallery-meta">
        <strong>#${String(p.id).padStart(3, "0")} ${p.name}</strong>
        ${p.authorName ? `<div class="small">Par ${p.authorName}</div>` : ""}
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

function getFresqueMetaText(pokemon) {
  const number = `#${String(pokemon.id).padStart(3, "0")}`;
  const parts = [];
  if (fresqueDisplayOptions.number) parts.push(number);
  if (fresqueDisplayOptions.name) parts.push(pokemon.name);
  const left = parts.join(" ");
  if (fresqueDisplayOptions.pseudo && pokemon.authorName) {
    return left ? `${left} — ${pokemon.authorName}` : pokemon.authorName;
  }
  return left;
}

function renderFresque() {
  if (!completedPokemonList.length) {
    el.fresqueInfo.textContent = "Aucun dessin.";
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
      <div class="fresque-meta">${getFresqueMetaText(p)}</div>
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

  const snap = await get(ref(db, `${generationPokemonPath()}/${currentUser.pokemonId}`));
  currentPokemon = snap.exists() ? snap.val() : null;
  renderMyPokemon();
}

async function selectRandomPokemon(user) {
  const allSnap = await get(ref(db, generationPokemonPath()));
  const all = allSnap.val() || {};
  const available = Object.values(all).filter((p) => p.status === "available");

  if (!available.length) throw new Error("Plus aucun Pokémon disponible.");

  let selected = null;
  for (let i = 0; i < 20 && !selected; i += 1) {
    const candidate = available[Math.floor(Math.random() * available.length)];
    const tx = await runTransaction(ref(db, `${generationPokemonPath()}/${candidate.id}`), (p) => {
      if (!p || p.status !== "available") return;
      return {
        ...p,
        status: "assigned",
        userId: user.id,
        assignedAt: Date.now(),
        completedAt: null,
        imageUrl: null,
        artistName: null,
        authorName: null
      };
    });
    if (tx.committed) selected = tx.snapshot.val();
  }

  if (!selected) throw new Error("Conflit. Réessaie.");
  return { selected, allPokemon: all };
}

async function assignPokemonToUser({ user, oldPokemonId = null, selectedPokemon = null, authorName = null }) {
  const randomPick = selectedPokemon ? null : await selectRandomPokemon(user);
  const selected = selectedPokemon || randomPick.selected;
  const allPokemon = randomPick?.allPokemon || null;
  const finalAuthorName = sanitizeNickname(authorName) || sanitizeNickname(user?.displayName);

  const updates = {
    [`${generationPokemonPath()}/${selected.id}/status`]: "assigned",
    [`${generationPokemonPath()}/${selected.id}/userId`]: user.id,
    [`${generationPokemonPath()}/${selected.id}/assignedAt`]: Date.now(),
    [`${generationPokemonPath()}/${selected.id}/completedAt`]: null,
    [`${generationPokemonPath()}/${selected.id}/imageUrl`]: null,
    [`${generationPokemonPath()}/${selected.id}/artistName`]: null,
    [`${generationPokemonPath()}/${selected.id}/authorName`]: finalAuthorName || null,
    [`${generationUsersPath()}/${user.id}/pokemonId`]: selected.id,
    [`${generationUsersPath()}/${user.id}/status`]: "assigned"
  };

  if (oldPokemonId && oldPokemonId !== selected.id) {
    const oldPokemon = allPokemon?.[oldPokemonId] || (await get(ref(db, `${generationPokemonPath()}/${oldPokemonId}`))).val();
    if (oldPokemon) {
    updates[`${generationPokemonPath()}/${oldPokemonId}`] = {
      ...oldPokemon,
      status: "available",
      userId: null,
      assignedAt: null,
      completedAt: null,
      imageUrl: null,
      artistName: null,
      authorName: null
    };
    }
  }

  await update(ref(db), updates);
  return {
    ...selected,
    status: "assigned",
    userId: user.id,
    authorName: finalAuthorName || null
  };
}

async function getPokemonByManualInput(numberValue, nameValue) {
  const id = Number.parseInt((numberValue || "").trim(), 10);
  const normalizedName = normalizePokemonName(nameValue);
  const snap = await get(ref(db, generationPokemonPath()));
  const all = snap.val() || {};

  if (Number.isInteger(id) && id > 0) {
    const foundById = all[id];
    if (!foundById) throw new Error("Pokémon introuvable.");
    return foundById;
  }

  if (normalizedName) {
    const foundByName = Object.values(all).find((pokemon) => normalizePokemonName(pokemon.name) === normalizedName);
    if (!foundByName) throw new Error("Pokémon introuvable.");
    return foundByName;
  }

  throw new Error("Pokémon introuvable.");
}

async function assignPokemon() {
  if (!hasNickname()) throw new Error("Pseudo requis.");
  if (currentUser?.pokemonId && currentPokemon) {
    showToast("Déjà un Pokémon en cours.", true);
    return;
  }

  const selected = await assignPokemonToUser({ user: currentUser });
  currentUser.pokemonId = selected.id;
  currentUser.status = "assigned";
  currentPokemon = selected;
  renderMyPokemon();
  showToast(`Pokémon: ${selected.name}`);
}

async function rerollPokemon() {
  if (!hasNickname()) throw new Error("Pseudo requis.");
  if (!currentPokemon || currentPokemon.status !== "assigned") throw new Error("Aucun Pokémon en cours.");
  const rerollsUsed = currentUser.rerollsUsed || 0;
  if (rerollsUsed >= 3) throw new Error("Limite de reroll atteinte.");

  const selected = await assignPokemonToUser({ user: currentUser, oldPokemonId: currentPokemon.id });
  const newCount = rerollsUsed + 1;
  await update(ref(db), {
    [`${generationUsersPath()}/${currentUser.id}/rerollsUsed`]: newCount,
    [`${generationUsersPath()}/${currentUser.id}/pokemonId`]: selected.id,
    [`${generationUsersPath()}/${currentUser.id}/status`]: "assigned"
  });

  currentUser.rerollsUsed = newCount;
  currentUser.pokemonId = selected.id;
  currentUser.status = "assigned";
  currentPokemon = selected;
  renderMyPokemon();
  showToast(`Reroll: ${selected.name}`);
}

async function adminAssignManualPokemon() {
  if (!currentUser?.isAdmin) throw new Error("Admin.");
  if (!hasNickname()) throw new Error("Pseudo requis.");
  const selectedPokemon = await getPokemonByManualInput(el.adminAssignNumber.value, el.adminAssignName.value);
  const customPseudo = sanitizeNickname(el.adminAssignPseudo.value);

  if (selectedPokemon.userId && selectedPokemon.userId !== currentUser.id) {
    await update(ref(db), {
      [`${generationUsersPath()}/${selectedPokemon.userId}/pokemonId`]: null,
      [`${generationUsersPath()}/${selectedPokemon.userId}/status`]: "idle"
    });
  }

  const selected = await assignPokemonToUser({
    user: currentUser,
    oldPokemonId: currentUser.pokemonId || null,
    selectedPokemon,
    authorName: customPseudo || currentUser.displayName
  });

  currentUser.pokemonId = selected.id;
  currentUser.status = "assigned";
  currentPokemon = selected;
  el.adminAssignForm.reset();
  renderMyPokemon();
  showToast(`Attribué: ${selected.name}`);
}

async function uploadDrawing(file) {
  if (!hasNickname()) throw new Error("Pseudo requis.");
  if (!currentPokemon || currentPokemon.status !== "assigned") throw new Error("Aucun Pokémon en cours.");
  const imageData = await fileToDataUrl(file);
  const authorName = sanitizeNickname(currentPokemon.authorName) || sanitizeNickname(currentUser.displayName);

  await update(ref(db), {
    [`${generationPokemonPath()}/${currentPokemon.id}/status`]: "completed",
    [`${generationPokemonPath()}/${currentPokemon.id}/imageUrl`]: imageData,
    [`${generationPokemonPath()}/${currentPokemon.id}/authorName`]: authorName,
    [`${generationPokemonPath()}/${currentPokemon.id}/artistName`]: null,
    [`${generationPokemonPath()}/${currentPokemon.id}/completedAt`]: Date.now(),
    [`${generationUsersPath()}/${currentUser.id}/status`]: "completed"
  });

  currentPokemon.status = "completed";
  currentPokemon.imageUrl = imageData;
  currentPokemon.authorName = authorName;
  currentUser.status = "completed";
  renderMyPokemon();
  showToast("Dessin envoyé.");
}

async function restartAdventure() {
  if (!currentUser?.id || !currentPokemon || currentPokemon.status !== "completed") {
    throw new Error("Aucun Pokémon terminé à réinitialiser.");
  }

  await update(ref(db), {
    [`${generationUsersPath()}/${currentUser.id}/pokemonId`]: null,
    [`${generationUsersPath()}/${currentUser.id}/status`]: "idle",
    [`${generationUsersPath()}/${currentUser.id}/rerollsUsed`]: 0,
    [`${generationUsersPath()}/${currentUser.id}/updatedAt`]: Date.now()
  });

  currentUser.pokemonId = null;
  currentUser.status = "idle";
  currentUser.rerollsUsed = 0;
  currentPokemon = null;
  renderMyPokemon();
  showToast("Recommencé.");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Fichier illisible."));
    reader.readAsDataURL(file);
  });
}

function bindPokemonFeed() {
  if (unbindPokemonFeed) unbindPokemonFeed();
  unbindPokemonFeed = onValue(ref(db, generationPokemonPath()), (snap) => {
    const allPokemon = snap.val() || {};
    Object.values(allPokemon).forEach((pokemon) => {
      if (pokemon && !pokemon.authorName && pokemon.artistName) {
        pokemon.authorName = pokemon.artistName;
      }
    });
    completedPokemonList = getCompletedPokemon(allPokemon);
    renderGallery();
    renderFresque();
  });
}

async function adminSetAvailable(pokemon) {
  const updates = {
    [`${generationPokemonPath()}/${pokemon.id}/status`]: "available",
    [`${generationPokemonPath()}/${pokemon.id}/imageUrl`]: null,
    [`${generationPokemonPath()}/${pokemon.id}/artistName`]: null,
    [`${generationPokemonPath()}/${pokemon.id}/authorName`]: null,
    [`${generationPokemonPath()}/${pokemon.id}/userId`]: null,
    [`${generationPokemonPath()}/${pokemon.id}/assignedAt`]: null,
    [`${generationPokemonPath()}/${pokemon.id}/completedAt`]: null
  };

  if (pokemon.userId) {
    updates[`${generationUsersPath()}/${pokemon.userId}/pokemonId`] = null;
    updates[`${generationUsersPath()}/${pokemon.userId}/status`] = "idle";
  }

  await update(ref(db), updates);
  showToast(`Pokémon #${pokemon.id} remis disponible.`);
}

function bindAdmin() {
  if (unbindAdminFeed) unbindAdminFeed();
  unbindAdminFeed = onValue(ref(db, generationPokemonPath()), (snap) => {
    if (!currentUser?.isAdmin) return;
    const items = Object.values(snap.val() || {})
      .filter((p) => p.status !== "available")
      .sort((a, b) => a.id - b.id);

    if (!items.length) {
      el.adminList.innerHTML = '<p class="small">Rien.</p>';
      return;
    }

    el.adminList.innerHTML = items.map((p) => `
      <div class="admin-row">
        <div>
          <strong>#${String(p.id).padStart(3, "0")} ${p.name}</strong>
          <div class="small">Statut: ${p.status} ${p.userId ? `· UID: ${p.userId}` : ""}</div>
        </div>
        <div class="admin-actions">
          ${p.status === "completed" ? `<button data-action="delete-drawing" data-id="${p.id}">Supprimer</button>` : ""}
          ${p.status === "assigned" ? `<button data-action="reset-inprogress" data-id="${p.id}">Reset</button>` : ""}
          <button data-action="force-available" data-id="${p.id}" class="ghost">Disponible</button>
        </div>
      </div>
    `).join("");
  });

  if (isAdminListClickBound) return;
  isAdminListClickBound = true;
  el.adminList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn || !currentUser?.isAdmin) return;

    try {
      const snap = await get(ref(db, `${generationPokemonPath()}/${btn.dataset.id}`));
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
  const snap = await get(ref(db, `${generationUsersPath()}/${currentUser.id}`));
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
      showToast("Popup bloquée. Redirection...");
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    if (err?.code === "auth/unauthorized-domain") {
      showToast(`Domaine non autorisé. Ajoute ${EXPECTED_HOSTNAME} dans Firebase Authentication > Authorized domains.`, true);
      return;
    }

    showToast(err.message || "Connexion impossible.", true);
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
  if (!currentUser?.id) throw new Error("Connecte-toi.");
  const nickname = sanitizeNickname(newNickname);
  if (!nickname) throw new Error("Pseudo requis.");

  await update(ref(db, `${generationUsersPath()}/${currentUser.id}`), {
    displayName: nickname,
    updatedAt: Date.now()
  });

  currentUser.displayName = nickname;
  renderAuthState();
  showToast("Pseudo enregistré.");
}

async function downloadFresqueImage() {
  if (!completedPokemonList.length) throw new Error("Aucune image.");

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

function getFileExtensionFromImageUrl(imageUrl) {
  if (!imageUrl) return "png";
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
    const ext = match?.[1]?.toLowerCase() || "png";
    return ext === "jpeg" ? "jpg" : ext;
  }
  const clean = imageUrl.split("?")[0];
  const found = clean.match(/\.([a-zA-Z0-9]+)$/);
  return found?.[1]?.toLowerCase() || "png";
}

function getMimeTypeFromExtension(ext) {
  const value = (ext || "").toLowerCase();
  if (value === "jpg" || value === "jpeg") return "image/jpeg";
  if (value === "gif") return "image/gif";
  if (value === "webp") return "image/webp";
  if (value === "bmp") return "image/bmp";
  if (value === "svg") return "image/svg+xml";
  return "image/png";
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image ZIP illisible."));
    reader.readAsDataURL(blob);
  });
}

async function imageUrlToBytes(imageUrl) {
  if (imageUrl.startsWith("data:")) {
    const base64 = imageUrl.split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function downloadGenerationZip(generation = activeGeneration) {
  if (!currentUser?.isAdmin) throw new Error("Admin.");
  const snap = await get(ref(db, generationPokemonPath(generation)));
  const completed = getCompletedPokemon(snap.val() || {}).sort((a, b) => a.id - b.id);
  if (!completed.length) throw new Error("Aucune image.");

  const zip = new JSZip();
  const imagesFolder = zip.folder("images");
  const metadata = {
    generation: generationToMetadataValue(generation),
    createdAt: new Date().toISOString(),
    data: []
  };
  const usedNames = new Set();
  await Promise.all(completed.map(async (pokemon) => {
    const base = `#${String(pokemon.id).padStart(3, "0")} ${pokemon.name}`;
    const ext = getFileExtensionFromImageUrl(pokemon.imageUrl);
    let filename = `${base}.${ext}`;
    let i = 1;
    while (usedNames.has(filename)) {
      i += 1;
      filename = `${base} (${i}).${ext}`;
    }
    usedNames.add(filename);
    imagesFolder.file(filename, await imageUrlToBytes(pokemon.imageUrl));
    metadata.data.push({
      file: `images/${filename}`,
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      authorName: sanitizeNickname(pokemon.authorName) || ""
    });
  }));
  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gooningmon-${generation}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeZipPath(path) {
  return (path || "").replace(/^\/+/, "").replace(/\\/g, "/");
}

function generationToMetadataValue(generation) {
  const match = String(generation || "").match(/^gen(\d+)$/i);
  return match ? Number(match[1]) : generation;
}

function metadataValueToGeneration(value) {
  if (Number.isInteger(value) && value > 0) return `gen${value}`;
  const text = String(value || "").trim();
  if (/^\d+$/.test(text)) return `gen${text}`;
  return text;
}

async function importGenerationZip(file) {
  if (!currentUser?.isAdmin) throw new Error("Admin.");
  if (!file) return;

  const confirmImport = window.confirm("Importer ZIP ?");
  if (!confirmImport) return;

  const zip = await JSZip.loadAsync(file);
  const metadataEntry = zip.file("metadata.json");
  if (!metadataEntry) throw new Error("metadata.json manquant.");

  let metadata = null;
  try {
    metadata = JSON.parse(await metadataEntry.async("string"));
  } catch (err) {
    throw new Error("metadata.json invalide.");
  }

  const metadataGeneration = metadataValueToGeneration(metadata?.generation);
  if (!metadataGeneration) throw new Error("Génération invalide.");
  const metadataList = Array.isArray(metadata?.data) ? metadata.data : [];
  if (!metadataList.length) throw new Error("Aucune donnée.");

  const confirmOverwrite = window.confirm("Écraser les données existantes ?");
  if (!confirmOverwrite) return;

  const importedPokemon = {};
  let importedCount = 0;
  let missingCount = 0;

  for (const item of metadataList) {
    const pokemonId = Number(item?.pokemonId);
    const pokemonName = String(item?.pokemonName || "").trim();
    const filePath = normalizeZipPath(item?.file);

    if (!Number.isInteger(pokemonId) || pokemonId < 1 || !pokemonName || !filePath) {
      missingCount += 1;
      continue;
    }

    const imageEntry = zip.file(filePath);
    if (!imageEntry) {
      missingCount += 1;
      continue;
    }

    try {
      const imageBlob = await imageEntry.async("blob");
      const fallbackExt = filePath.split(".").pop() || "png";
      const typedBlob = imageBlob.type
        ? imageBlob
        : imageBlob.slice(0, imageBlob.size, getMimeTypeFromExtension(fallbackExt));
      importedPokemon[pokemonId] = {
        id: pokemonId,
        name: pokemonName,
        status: "completed",
        userId: null,
        assignedAt: null,
        completedAt: Date.now(),
        imageUrl: await blobToDataUrl(typedBlob),
        authorName: sanitizeNickname(item?.authorName) || "",
        artistName: null
      };
      importedCount += 1;
    } catch (err) {
      missingCount += 1;
    }
  }

  const pool = {};
  POKEMON_151.forEach((name, i) => {
    const id = i + 1;
    pool[id] = importedPokemon[id] || {
      id,
      name,
      status: "available",
      userId: null,
      imageUrl: null,
      assignedAt: null,
      completedAt: null,
      authorName: null,
      artistName: null
    };
  });

  await remove(ref(db, generationUsersPath(metadataGeneration)));
  await set(ref(db, generationPokemonPath(metadataGeneration)), pool);

  if (metadataGeneration !== activeGeneration) {
    await set(ref(db, "meta/activeGeneration"), metadataGeneration);
    activeGeneration = metadataGeneration;
    el.generationSelect.value = activeGeneration;
  }

  bindPokemonFeed();
  bindAdmin();
  await syncCurrentUserFromAuth(auth.currentUser);
  await syncCurrentPokemon();

  if (missingCount > 0) {
    showToast(`Importé: ${importedCount} · Ignoré: ${missingCount}`);
    return;
  }
  showToast(`Importé: ${importedCount}`);
}

async function loadActiveGeneration() {
  const snap = await get(ref(db, "meta/activeGeneration"));
  activeGeneration = snap.exists() ? snap.val() : "gen1";
  if (!snap.exists()) {
    await set(ref(db, "meta/activeGeneration"), activeGeneration);
  }
  el.generationSelect.value = activeGeneration;
}

async function changeGeneration(nextGeneration) {
  if (!currentUser?.isAdmin) throw new Error("Admin.");
  if (!nextGeneration || nextGeneration === activeGeneration) return;

  const confirmChange = window.confirm("Changer génération ?");
  if (!confirmChange) return;

  const wantsZip = window.confirm("Télécharger ZIP avant suppression ?");
  if (wantsZip) {
    try {
      await downloadGenerationZip(activeGeneration);
    } catch (err) {
      showToast(err.message || "ZIP impossible.", true);
    }
  }

  const confirmDelete = window.confirm(`Supprimer ${activeGeneration} ?`);
  if (!confirmDelete) return;

  await remove(ref(db, generationRootPath(activeGeneration)));
  await set(ref(db, "meta/activeGeneration"), nextGeneration);
  activeGeneration = nextGeneration;
  await ensurePokemonPool();
  bindPokemonFeed();
  bindAdmin();
  await syncCurrentUserFromAuth(auth.currentUser);
  await syncCurrentPokemon();
  el.generationSelect.value = activeGeneration;
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
      showToast(err.message || "Pseudo non enregistré.", true);
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
  el.fresqueShowNumber.addEventListener("change", () => {
    fresqueDisplayOptions.number = el.fresqueShowNumber.checked;
    renderFresque();
  });
  el.fresqueShowName.addEventListener("change", () => {
    fresqueDisplayOptions.name = el.fresqueShowName.checked;
    renderFresque();
  });
  el.fresqueShowPseudo.addEventListener("change", () => {
    fresqueDisplayOptions.pseudo = el.fresqueShowPseudo.checked;
    renderFresque();
  });
  el.downloadFresqueBtn.addEventListener("click", async () => {
    try {
      await downloadFresqueImage();
      showToast("Fresque téléchargée.");
    } catch (err) {
      showToast(err.message || "Export impossible.", true);
    }
  });
  el.downloadGenerationZipBtn.addEventListener("click", async () => {
    if (!currentUser?.isAdmin) return;
    try {
      await downloadGenerationZip();
      showToast("ZIP téléchargé.");
    } catch (err) {
      showToast(err.message || "ZIP impossible.", true);
    }
  });
  el.importGenerationZipBtn.addEventListener("click", () => {
    if (!currentUser?.isAdmin) return;
    el.importGenerationZipInput.click();
  });
  el.importGenerationZipInput.addEventListener("change", async (e) => {
    if (!currentUser?.isAdmin) return;
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await importGenerationZip(file);
    } catch (err) {
      showToast(err.message || "Import impossible.", true);
    }
  });
  el.changeGenerationBtn.addEventListener("click", async () => {
    if (!currentUser?.isAdmin) return;
    try {
      await changeGeneration(el.generationSelect.value);
      showToast(`Génération: ${activeGeneration}`);
    } catch (err) {
      showToast(err.message || "Changement impossible.", true);
    }
  });
  el.adminAssignForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser?.isAdmin) return;
    try {
      await adminAssignManualPokemon();
    } catch (err) {
      showToast(err.message || "Attribution impossible.", true);
    }
  });
}

async function boot() {
  explainSetupIfNeeded();
  bindRouter();
  bindEvents();
  await loadActiveGeneration();
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
      showToast("Sync compte impossible.", true);
    }
  });
}

boot().catch((err) => {
  logFirebaseError("boot", err);
  showToast(err.message || "Erreur démarrage.", true);
});
