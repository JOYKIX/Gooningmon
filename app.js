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
const ADMIN_EMAILS = [];

const APP_HOSTNAME = window.location.hostname;
const EXPECTED_HOSTNAME = "joykix.github.io";
const IS_GITHUB_PAGES = APP_HOSTNAME.endsWith(".github.io");

const POKEMON_151 = [
  "Bulbizarre","Herbizarre","Florizarre","Salamèche","Reptincel","Dracaufeu","Carapuce","Carabaffe","Tortank","Chenipan","Chrysacier","Papilusion","Aspicot","Coconfort","Dardargnan","Roucool","Roucoups","Roucarnage","Rattata","Rattatac","Piafabec","Rapasdepic","Abo","Arbok","Pikachu","Raichu","Sabelette","Sablaireau","Nidoran♀","Nidorina","Nidoqueen","Nidoran♂","Nidorino","Nidoking","Mélofée","Mélodelfe","Goupix","Feunard","Rondoudou","Grodoudou","Nosferapti","Nosferalto","Mystherbe","Ortide","Rafflesia","Paras","Parasect","Mimitoss","Aéromite","Taupiqueur","Triopikeur","Miaouss","Persian","Psykokwak","Akwakwak","Férosinge","Colossinge","Caninos","Arcanin","Ptitard","Têtarte","Tartard","Abra","Kadabra","Alakazam","Machoc","Machopeur","Mackogneur","Chétiflor","Boustiflor","Empiflor","Tentacool","Tentacruel","Racaillou","Gravalanch","Grolem","Ponyta","Galopa","Ramoloss","Flagadoss","Magnéti","Magnéton","Canarticho","Doduo","Dodrio","Otaria","Lamantine","Tadmorv","Grotadmorv","Kokiyas","Crustabri","Fantominus","Spectrum","Ectoplasma","Onix","Soporifik","Hypnomade","Krabby","Krabboss","Voltorbe","Électrode","Noeunoeuf","Noadkoko","Osselait","Ossatueur","Kicklee","Tygnon","Excelangue","Smogo","Smogogo","Rhinocorne","Rhinoféros","Leveinard","Saquedeneu","Kangourex","Hypotrempe","Hypocéan","Poissirène","Poissoroy","Stari","Staross","M. Mime","Insécateur","Lippoutou","Élektek","Magmar","Scarabrute","Tauros","Magicarpe","Léviator","Lokhlass","Métamorph","Évoli","Aquali","Voltali","Pyroli","Porygon","Amonita","Amonistar","Kabuto","Kabutops","Ptéra","Ronflex","Artikodin","Électhor","Sulfura","Minidraco","Draco","Dracolosse","Mewtwo","Mew"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const el = {
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
  rerollInfo: document.getElementById("rerollInfo"),
  uploadForm: document.getElementById("uploadForm"),
  drawingFile: document.getElementById("drawingFile"),
  gallery: document.getElementById("gallery"),
  adminSection: document.getElementById("adminSection"),
  adminList: document.getElementById("adminList"),
  toast: document.getElementById("toast")
};

let currentUser = null;
let currentPokemon = null;
let isAuthActionPending = false;

function normalizeEmail(value) {
  return (value || "").trim().toLowerCase();
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
  el.toast.style.borderLeftColor = isError ? "#ff4d6d" : "#3ddc97";
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

function sanitizeNickname(value) {
  return (value || "").trim().slice(0, 30);
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
  const rLeft = Math.max(0, 3 - (currentUser?.rerollsUsed || 0));
  el.rerollInfo.textContent = `Rerolls restants: ${rLeft}/3`;

  if (!currentPokemon) {
    el.pokemonCard.className = "pokemon-card muted";
    el.pokemonCard.textContent = "Aucun Pokémon attribué.";
    el.assignBtn.disabled = false;
    el.rerollBtn.disabled = true;
    return;
  }

  const statusClass = currentPokemon.status === "completed" ? "completed" : "assigned";
  el.pokemonCard.className = "pokemon-card";
  el.pokemonCard.innerHTML = `
    <div class="pokemon-id">#${String(currentPokemon.id).padStart(3, "0")}</div>
    <div class="pokemon-name">${currentPokemon.name}</div>
    <span class="badge ${statusClass}">${currentPokemon.status === "completed" ? "Terminé" : "En cours"}</span>
  `;

  el.assignBtn.disabled = currentPokemon.status !== "available";
  el.rerollBtn.disabled = currentPokemon.status !== "assigned" || (currentUser.rerollsUsed || 0) >= 3;
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
  if (currentUser.pokemonId && currentPokemon?.status === "assigned") {
    showToast("Tu as déjà un Pokémon en cours.", true);
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
  showToast("Dessin uploadé avec succès !");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Impossible de lire le fichier image."));
    reader.readAsDataURL(file);
  });
}

function bindGallery() {
  onValue(ref(db, "pokemon"), (snap) => {
    const values = Object.values(snap.val() || {});
    const completed = values.filter((p) => p.status === "completed" && p.imageUrl).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    if (!completed.length) {
      el.gallery.innerHTML = '<p class="small">Aucun dessin terminé pour le moment.</p>';
      return;
    }
    el.gallery.innerHTML = completed.map((p) => `
      <article class="gallery-item">
        <img src="${p.imageUrl}" alt="Dessin de ${p.name}" loading="lazy" />
        <div class="gallery-meta">
          <strong>#${String(p.id).padStart(3, "0")} ${p.name}</strong>
          ${p.artistName ? `<div class="small">Par ${p.artistName}</div>` : ""}
        </div>
      </article>
    `).join("");
  });
}

async function adminSetAvailable(pokemon, withDelete = false) {
  void withDelete;

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
    const items = Object.values(snap.val() || {}).filter((p) => p.status !== "available").sort((a, b) => a.id - b.id);
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
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    try {
      const snap = await get(ref(db, `pokemon/${id}`));
      if (!snap.exists()) return;
      const pokemon = snap.val();
      if (action === "delete-drawing") await adminSetAvailable(pokemon, true);
      if (action === "reset-inprogress") await adminSetAvailable(pokemon, false);
      if (action === "force-available") await adminSetAvailable(pokemon, false);
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
  if (!snap.exists()) {
    currentUser = null;
  } else {
    currentUser = { id: currentUser.id, ...snap.val() };
  }
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

function explainSetupIfNeeded() {
  if (!IS_GITHUB_PAGES) return;
  if (APP_HOSTNAME === EXPECTED_HOSTNAME) return;

  console.warn(`[Firebase][auth-domain] Domaine courant: ${APP_HOSTNAME}. Domaine recommandé: ${EXPECTED_HOSTNAME}`);
}

async function boot() {
  explainSetupIfNeeded();
  await ensurePokemonPool();
  bindGallery();
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
