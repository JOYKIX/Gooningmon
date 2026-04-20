import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  child,
  runTransaction,
  query,
  orderByChild,
  equalTo,
  onValue
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmC1_Hklc1SgvVQXyNT07TYDfVn2euRO8",
  authDomain: "stream-overlay-creator.firebaseapp.com",
  databaseURL: "https://stream-overlay-creator-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stream-overlay-creator",
  storageBucket: "stream-overlay-creator.firebasestorage.app",
  messagingSenderId: "79079678682",
  appId: "1:79079678682:web:98dd5a684859ee98273be3"
};

const POKEMON_151 = [
  "Bulbizarre","Herbizarre","Florizarre","Salamèche","Reptincel","Dracaufeu","Carapuce","Carabaffe","Tortank","Chenipan","Chrysacier","Papilusion","Aspicot","Coconfort","Dardargnan","Roucool","Roucoups","Roucarnage","Rattata","Rattatac","Piafabec","Rapasdepic","Abo","Arbok","Pikachu","Raichu","Sabelette","Sablaireau","Nidoran♀","Nidorina","Nidoqueen","Nidoran♂","Nidorino","Nidoking","Mélofée","Mélodelfe","Goupix","Feunard","Rondoudou","Grodoudou","Nosferapti","Nosferalto","Mystherbe","Ortide","Rafflesia","Paras","Parasect","Mimitoss","Aéromite","Taupiqueur","Triopikeur","Miaouss","Persian","Psykokwak","Akwakwak","Férosinge","Colossinge","Caninos","Arcanin","Ptitard","Têtarte","Tartard","Abra","Kadabra","Alakazam","Machoc","Machopeur","Mackogneur","Chétiflor","Boustiflor","Empiflor","Tentacool","Tentacruel","Racaillou","Gravalanch","Grolem","Ponyta","Galopa","Ramoloss","Flagadoss","Magnéti","Magnéton","Canarticho","Doduo","Dodrio","Otaria","Lamantine","Tadmorv","Grotadmorv","Kokiyas","Crustabri","Fantominus","Spectrum","Ectoplasma","Onix","Soporifik","Hypnomade","Krabby","Krabboss","Voltorbe","Électrode","Noeunoeuf","Noadkoko","Osselait","Ossatueur","Kicklee","Tygnon","Excelangue","Smogo","Smogogo","Rhinocorne","Rhinoféros","Leveinard","Saquedeneu","Kangourex","Hypotrempe","Hypocéan","Poissirène","Poissoroy","Stari","Staross","M. Mime","Insécateur","Lippoutou","Élektek","Magmar","Scarabrute","Tauros","Magicarpe","Léviator","Lokhlass","Métamorph","Évoli","Aquali","Voltali","Pyroli","Porygon","Amonita","Amonistar","Kabuto","Kabutops","Ptéra","Ronflex","Artikodin","Électhor","Sulfura","Minidraco","Draco","Dracolosse","Mewtwo","Mew"
];

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

const el = {
  authSection: document.getElementById("authSection"),
  appSection: document.getElementById("appSection"),
  registerForm: document.getElementById("registerForm"),
  loginForm: document.getElementById("loginForm"),
  registerUsername: document.getElementById("registerUsername"),
  registerPassword: document.getElementById("registerPassword"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  welcomeText: document.getElementById("welcomeText"),
  statusText: document.getElementById("statusText"),
  pokemonCard: document.getElementById("pokemonCard"),
  assignBtn: document.getElementById("assignBtn"),
  rerollBtn: document.getElementById("rerollBtn"),
  rerollInfo: document.getElementById("rerollInfo"),
  uploadForm: document.getElementById("uploadForm"),
  drawingFile: document.getElementById("drawingFile"),
  logoutBtn: document.getElementById("logoutBtn"),
  gallery: document.getElementById("gallery"),
  adminSection: document.getElementById("adminSection"),
  adminList: document.getElementById("adminList"),
  toast: document.getElementById("toast")
};

let currentUser = null;
let currentPokemon = null;
let isLoginPending = false;
let isRegisterPending = false;

function normalizeUsername(value) {
  return value.trim().toLowerCase();
}

function setFormBusy(form, busy) {
  const submitBtn = form?.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = busy;
}

function logFirebaseError(context, err) {
  console.error(`[Firebase][${context}]`, {
    code: err?.code || "unknown",
    message: err?.message || "Unknown Firebase error",
    raw: err
  });
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function showToast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.style.borderLeftColor = isError ? "#ff4d6d" : "#3ddc97";
  el.toast.classList.remove("hidden");
  setTimeout(() => el.toast.classList.add("hidden"), 3000);
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

function setSession(userId) {
  localStorage.setItem("pk_session", userId);
}
function clearSession() {
  localStorage.removeItem("pk_session");
}

async function fetchUserById(userId) {
  const snap = await get(ref(db, `users/${userId}`));
  return snap.exists() ? { id: userId, ...snap.val() } : null;
}

async function fetchUserByUsername(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) throw new Error("Pseudo requis.");

  const q = query(ref(db, "users"), orderByChild("usernameNorm"), equalTo(normalized));
  const snap = await get(q);
  if (!snap.exists()) return null;
  const [id, data] = Object.entries(snap.val())[0];
  return { id, ...data };
}

async function registerUser(username, password) {
  const trimmed = username.trim();
  if (trimmed.length < 3) throw new Error("Pseudo trop court.");

  const id = uid();
  const usernameNorm = normalizeUsername(trimmed);
  const indexRef = ref(db, `usernameIndex/${usernameNorm}`);

  const tx = await runTransaction(indexRef, (current) => {
    if (current) return;
    return id;
  });
  if (!tx.committed) throw new Error("Ce pseudo est déjà utilisé.");

  const passwordHash = await sha256(password);
  const isAdmin = trimmed === "JOYKIX";
  const role = isAdmin ? "admin" : "user";
  await set(ref(db, `users/${id}`), {
    username: trimmed,
    usernameNorm,
    passwordHash,
    role,
    isAdmin,
    rerollsUsed: 0,
    pokemonId: null,
    status: "idle",
    createdAt: Date.now()
  });
  return fetchUserById(id);
}

async function loginUser(username, password) {
  const usernameNorm = normalizeUsername(username || "");
  if (!usernameNorm) throw new Error("Le pseudo ne peut pas être vide.");

  const user = await fetchUserByUsername(usernameNorm);
  if (!user) throw new Error("Utilisateur introuvable.");
  const hash = await sha256(password);
  if (hash !== user.passwordHash) throw new Error("Mot de passe incorrect.");

  const role = user.role || (user.isAdmin ? "admin" : "user");
  return { ...user, role, isAdmin: role === "admin" };
}

function renderAuthState() {
  const logged = Boolean(currentUser);
  el.authSection.classList.toggle("hidden", logged);
  el.appSection.classList.toggle("hidden", !logged);
  if (!logged) return;

  el.welcomeText.textContent = `Bienvenue, ${currentUser.username}`;
  const roleLabel = currentUser.role === "admin" ? "Admin" : "Utilisateur";
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
  for (let i = 0; i < 20 && !selected; i++) {
    const candidate = available[Math.floor(Math.random() * available.length)];
    const tx = await runTransaction(ref(db, `pokemon/${candidate.id}`), (p) => {
      if (!p || p.status !== "available") return;
      return { ...p, status: "assigned", userId: user.id, assignedAt: Date.now(), completedAt: null, imageUrl: null };
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
      imageUrl: null
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
  const safeType = file.type?.startsWith("image/") ? file.type.split("/")[1] : "png";
  const fileRef = storageRef(storage, `drawings/${currentPokemon.id}_${currentUser.id}_${Date.now()}.${safeType}`);
  await uploadBytes(fileRef, file);
  const imageUrl = await getDownloadURL(fileRef);

  await update(ref(db), {
    [`pokemon/${currentPokemon.id}/status`]: "completed",
    [`pokemon/${currentPokemon.id}/imageUrl`]: imageUrl,
    [`pokemon/${currentPokemon.id}/completedAt`]: Date.now(),
    [`users/${currentUser.id}/status`]: "completed"
  });

  currentPokemon.status = "completed";
  currentPokemon.imageUrl = imageUrl;
  currentUser.status = "completed";
  renderMyPokemon();
  showToast("Dessin uploadé avec succès !");
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
        </div>
      </article>
    `).join("");
  });
}

function storageRefFromUrl(url) {
  const marker = "/o/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const encoded = url.slice(i + marker.length).split("?")[0];
  return decodeURIComponent(encoded);
}

async function adminSetAvailable(pokemon, withDelete = false) {
  if (withDelete && pokemon.imageUrl) {
    try {
      const path = storageRefFromUrl(pokemon.imageUrl);
      if (path) await deleteObject(storageRef(storage, path));
    } catch (_) {
      // ignore storage cleanup errors
    }
  }

  const updates = {
    [`pokemon/${pokemon.id}/status`]: "available",
    [`pokemon/${pokemon.id}/imageUrl`]: null,
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
          <div class="small">Statut: ${p.status} ${p.userId ? `· User: ${p.userId}` : ""}</div>
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
      if (action === "force-available") await adminSetAvailable(pokemon, action === "delete-drawing");
      await syncCurrentUser();
      await syncCurrentPokemon();
    } catch (err) {
      showToast(err.message || "Action admin impossible.", true);
    }
  });
}

async function syncCurrentUser() {
  if (!currentUser?.id) return;
  const fresh = await fetchUserById(currentUser.id);
  if (!fresh) {
    clearSession();
    currentUser = null;
  } else {
    const role = fresh.role || (fresh.isAdmin ? "admin" : "user");
    currentUser = { ...fresh, role, isAdmin: role === "admin" };
  }
  renderAuthState();
}

el.registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isRegisterPending) return;
  isRegisterPending = true;
  setFormBusy(el.registerForm, true);
  try {
    const user = await registerUser(el.registerUsername.value, el.registerPassword.value);
    currentUser = user;
    setSession(user.id);
    renderAuthState();
    await syncCurrentPokemon();
    showToast("Compte créé et connecté.");
    el.registerForm.reset();
  } catch (err) {
    logFirebaseError("register", err);
    showToast(err.message || "Erreur à l'inscription.", true);
  } finally {
    isRegisterPending = false;
    setFormBusy(el.registerForm, false);
  }
});

el.loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isLoginPending) return;
  isLoginPending = true;
  setFormBusy(el.loginForm, true);
  try {
    const user = await loginUser(el.loginUsername.value, el.loginPassword.value);
    currentUser = user;
    setSession(user.id);
    renderAuthState();
    await syncCurrentPokemon();
    showToast("Connexion réussie.");
    el.loginForm.reset();
  } catch (err) {
    logFirebaseError("login", err);
    showToast(err.message || "Erreur de connexion.", true);
  } finally {
    isLoginPending = false;
    setFormBusy(el.loginForm, false);
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

el.logoutBtn.addEventListener("click", () => {
  clearSession();
  currentUser = null;
  currentPokemon = null;
  renderAuthState();
  showToast("Déconnecté.");
});

async function boot() {
  await ensurePokemonPool();
  bindGallery();
  bindAdmin();

  const sessionUserId = localStorage.getItem("pk_session");
  if (sessionUserId) {
    currentUser = await fetchUserById(sessionUserId);
    if (!currentUser) {
      clearSession();
    } else {
      currentUser.role = currentUser.role || (currentUser.isAdmin ? "admin" : "user");
      currentUser.isAdmin = currentUser.role === "admin";
    }
  }
  renderAuthState();
  await syncCurrentPokemon();
}

boot().catch((err) => {
  logFirebaseError("boot", err);
  showToast(err.message || "Erreur d'initialisation.", true);
});
