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
  "/fresque": "view-fresque",
  "/dessins": "view-dessins"
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
const MAX_REROLLS = 3;

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
  uploadFileInfo: document.getElementById("uploadFileInfo"),
  uploadState: document.getElementById("uploadState"),
  galleryProgress: document.getElementById("galleryProgress"),
  galleryAuthorFilter: document.getElementById("galleryAuthorFilter"),
  gallery: document.getElementById("gallery"),
  fresqueGrid: document.getElementById("fresqueGrid"),
  fresqueInfo: document.getElementById("fresqueInfo"),
  fresqueMode: document.getElementById("fresqueMode"),
  fresqueValue: document.getElementById("fresqueValue"),
  fresqueWidth: document.getElementById("fresqueWidth"),
  fresqueHeight: document.getElementById("fresqueHeight"),
  fresqueForm: document.getElementById("fresqueForm"),
  fresqueShowNumber: document.getElementById("fresqueShowNumber"),
  fresqueShowName: document.getElementById("fresqueShowName"),
  fresqueShowPseudo: document.getElementById("fresqueShowPseudo"),
  downloadFresqueBtn: document.getElementById("downloadFresqueBtn"),
  drawingCanvas: document.getElementById("drawingCanvas"),
  drawingColor: document.getElementById("drawingColor"),
  drawingBrushSize: document.getElementById("drawingBrushSize"),
  drawingBrushOpacity: document.getElementById("drawingBrushOpacity"),
  drawingToolBrushBtn: document.getElementById("drawingToolBrushBtn"),
  drawingToolEraserBtn: document.getElementById("drawingToolEraserBtn"),
  drawingToolFillBtn: document.getElementById("drawingToolFillBtn"),
  drawingToolPickerBtn: document.getElementById("drawingToolPickerBtn"),
  drawingUndoBtn: document.getElementById("drawingUndoBtn"),
  drawingRedoBtn: document.getElementById("drawingRedoBtn"),
  drawingClearLayerBtn: document.getElementById("drawingClearLayerBtn"),
  drawingAddPaletteColorBtn: document.getElementById("drawingAddPaletteColorBtn"),
  drawingPaletteSwatches: document.getElementById("drawingPaletteSwatches"),
  drawingAddLayerBtn: document.getElementById("drawingAddLayerBtn"),
  drawingLayerList: document.getElementById("drawingLayerList"),
  drawingLayerOpacity: document.getElementById("drawingLayerOpacity"),
  drawingLayerUpBtn: document.getElementById("drawingLayerUpBtn"),
  drawingLayerDownBtn: document.getElementById("drawingLayerDownBtn"),
  drawingDeleteLayerBtn: document.getElementById("drawingDeleteLayerBtn"),
  drawingDownloadBtn: document.getElementById("drawingDownloadBtn"),
  drawingUploadBtn: document.getElementById("drawingUploadBtn"),
  drawingStatus: document.getElementById("drawingStatus"),
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
let drawingContext = null;
let isDrawingActive = false;
let drawingLastPoint = null;
let drawingActiveTool = "brush";
let drawingLayers = [];
let drawingActiveLayerId = null;
let drawingNextLayerId = 1;
let drawingPalette = [];
let drawingHistory = [];
let drawingHistoryIndex = -1;
const DRAWING_SIZE = 500;
const DRAWING_MAX_PALETTE_COLORS = 10;
const DRAWING_PALETTE_STORAGE_KEY = "gooningmon-drawing-palette-v1";
const GALLERY_FILTER_ALL_VALUE = "__all__";
const GALLERY_UNKNOWN_AUTHOR = "Pseudo inconnu";
const GALLERY_FILTER_STORAGE_PREFIX = "gooningmon-gallery-author-filter:";
const GALLERY_RATING_MIN = 1;
const GALLERY_RATING_MAX = 5;
let selectedGalleryAuthor = GALLERY_FILTER_ALL_VALUE;

function normalizeUserPokemonEntry(entry, fallbackId = null) {
  if (!entry) return null;
  const pokemonId = Number(entry.pokemonId ?? fallbackId);
  if (!Number.isInteger(pokemonId) || pokemonId < 1) return null;
  const status = entry.status === "completed" ? "completed" : "active";
  return {
    pokemonId,
    status,
    image: entry.image || null,
    authorName: sanitizeNickname(entry.authorName) || null,
    assignedAt: entry.assignedAt || null,
    completedAt: entry.completedAt || null,
    updatedAt: entry.updatedAt || null
  };
}

function normalizeUserPokemonMap(value) {
  if (!value || typeof value !== "object") return {};
  const normalized = {};
  Object.entries(value).forEach(([key, entry]) => {
    const parsed = normalizeUserPokemonEntry(entry, key);
    if (parsed) normalized[parsed.pokemonId] = parsed;
  });
  return normalized;
}

function ensureLegacyPokemonMap(existing) {
  const normalized = normalizeUserPokemonMap(existing?.pokemons);
  if (Object.keys(normalized).length) return normalized;

  const legacyPokemonId = Number(existing?.pokemonId);
  if (!Number.isInteger(legacyPokemonId) || legacyPokemonId < 1) return normalized;
  const legacyStatus = existing?.status === "completed" ? "completed" : "active";
  normalized[legacyPokemonId] = {
    pokemonId: legacyPokemonId,
    status: legacyStatus,
    image: null,
    authorName: sanitizeNickname(existing?.displayName) || null,
    assignedAt: null,
    completedAt: null,
    updatedAt: Date.now()
  };
  return normalized;
}

function getActivePokemonEntry(user = currentUser) {
  const pokemons = normalizeUserPokemonMap(user?.pokemons);
  return Object.values(pokemons)
    .filter((entry) => entry.status === "active")
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
}

function normalizeEmail(value) {
  return (value || "").trim().toLowerCase();
}

function sanitizeNickname(value) {
  return (value || "").trim().slice(0, 30);
}

function normalizeNicknameForLookup(value) {
  return sanitizeNickname(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizePokemonName(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

function getDrawingPointerPosition(event) {
  const rect = el.drawingCanvas.getBoundingClientRect();
  const scaleX = DRAWING_SIZE / rect.width;
  const scaleY = DRAWING_SIZE / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function getActiveDrawingLayer() {
  return drawingLayers.find((layer) => layer.id === drawingActiveLayerId) || null;
}

function createDrawingLayer(name = `Calque ${drawingNextLayerId}`) {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = DRAWING_SIZE;
  offscreenCanvas.height = DRAWING_SIZE;
  const context = offscreenCanvas.getContext("2d");
  return {
    id: drawingNextLayerId++,
    name,
    visible: true,
    opacity: 1,
    canvas: offscreenCanvas,
    context
  };
}

function drawLayersToMainCanvas() {
  if (!drawingContext) return;
  drawingContext.clearRect(0, 0, DRAWING_SIZE, DRAWING_SIZE);
  drawingContext.fillStyle = "#ffffff";
  drawingContext.fillRect(0, 0, DRAWING_SIZE, DRAWING_SIZE);
  drawingLayers.forEach((layer) => {
    if (!layer.visible) return;
    drawingContext.save();
    drawingContext.globalAlpha = layer.opacity;
    drawingContext.drawImage(layer.canvas, 0, 0);
    drawingContext.restore();
  });
}

function renderDrawingLayersList() {
  if (!el.drawingLayerList) return;
  const ordered = [...drawingLayers].reverse();
  el.drawingLayerList.innerHTML = ordered.map((layer) => `
    <button type="button" class="layer-item ${layer.id === drawingActiveLayerId ? "active" : ""}" data-layer-id="${layer.id}">
      <span class="layer-eye">${layer.visible ? "👁️" : "🚫"}</span>
      <span class="layer-name">${escapeHtml(layer.name)}</span>
      <span class="layer-opacity">${Math.round(layer.opacity * 100)}%</span>
    </button>
  `).join("");
  const active = getActiveDrawingLayer();
  if (active && el.drawingLayerOpacity) {
    el.drawingLayerOpacity.value = String(Math.round(active.opacity * 100));
  }
}

function setDrawingStatus(message, isError = false) {
  if (!el.drawingStatus) return;
  el.drawingStatus.textContent = message;
  el.drawingStatus.style.color = isError ? "#ff718f" : "";
}

function renderDrawingPalette() {
  if (!el.drawingPaletteSwatches) return;
  el.drawingPaletteSwatches.innerHTML = drawingPalette.map((color) => `
    <button type="button" class="palette-chip ${color === el.drawingColor.value ? "active" : ""}" data-color="${color}" style="background:${color};" aria-label="Couleur ${color}"></button>
  `).join("");
}

function saveDrawingPalette() {
  localStorage.setItem(DRAWING_PALETTE_STORAGE_KEY, JSON.stringify(drawingPalette));
}

function loadDrawingPalette() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAWING_PALETTE_STORAGE_KEY) || "[]");
    if (Array.isArray(saved)) {
      drawingPalette = saved
        .filter((value) => typeof value === "string" && /^#[\da-f]{6}$/i.test(value))
        .slice(0, DRAWING_MAX_PALETTE_COLORS);
    }
  } catch (err) {
    drawingPalette = [];
  }
}

function cloneLayerState(layer) {
  return {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    opacity: layer.opacity,
    imageData: layer.context.getImageData(0, 0, DRAWING_SIZE, DRAWING_SIZE)
  };
}

function pushDrawingHistory() {
  const snapshot = {
    activeLayerId: drawingActiveLayerId,
    layers: drawingLayers.map(cloneLayerState)
  };
  drawingHistory = drawingHistory.slice(0, drawingHistoryIndex + 1);
  drawingHistory.push(snapshot);
  if (drawingHistory.length > 40) drawingHistory.shift();
  drawingHistoryIndex = drawingHistory.length - 1;
}

function restoreDrawingHistory(snapshot) {
  drawingLayers = snapshot.layers.map((layerState) => {
    const layer = createDrawingLayer(layerState.name);
    layer.id = layerState.id;
    layer.visible = layerState.visible;
    layer.opacity = layerState.opacity;
    layer.context.putImageData(layerState.imageData, 0, 0);
    return layer;
  });
  drawingNextLayerId = Math.max(...drawingLayers.map((layer) => layer.id), 0) + 1;
  drawingActiveLayerId = snapshot.activeLayerId || drawingLayers[0]?.id || null;
  renderDrawingLayersList();
  drawLayersToMainCanvas();
}

function setActiveDrawingTool(tool) {
  drawingActiveTool = tool;
  const map = {
    brush: el.drawingToolBrushBtn,
    eraser: el.drawingToolEraserBtn,
    fill: el.drawingToolFillBtn,
    picker: el.drawingToolPickerBtn
  };
  Object.entries(map).forEach(([name, button]) => {
    button?.classList.toggle("active", name === tool);
  });
}

function drawOnLayer(from, to) {
  const layer = getActiveDrawingLayer();
  if (!layer || !from || !to) return;
  const context = layer.context;
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = Number(el.drawingBrushSize.value || 6);
  context.globalAlpha = Number(el.drawingBrushOpacity.value || 100) / 100;
  context.globalCompositeOperation = drawingActiveTool === "eraser" ? "destination-out" : "source-over";
  context.strokeStyle = el.drawingColor.value || "#111111";
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
  context.restore();
}

function pickColorAtPoint(point) {
  const data = drawingContext.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
  const toHex = (v) => v.toString(16).padStart(2, "0");
  const color = `#${toHex(data[0])}${toHex(data[1])}${toHex(data[2])}`;
  el.drawingColor.value = color;
  renderDrawingPalette();
  setDrawingStatus(`Couleur capturée: ${color}`);
}

function fillLayerAtPoint(point) {
  const layer = getActiveDrawingLayer();
  if (!layer) return;
  const x = Math.max(0, Math.min(DRAWING_SIZE - 1, Math.round(point.x)));
  const y = Math.max(0, Math.min(DRAWING_SIZE - 1, Math.round(point.y)));
  const imageData = layer.context.getImageData(0, 0, DRAWING_SIZE, DRAWING_SIZE);
  const { data } = imageData;
  const index = (y * DRAWING_SIZE + x) * 4;
  const target = [data[index], data[index + 1], data[index + 2], data[index + 3]];
  const colorHex = el.drawingColor.value || "#111111";
  const fill = [
    parseInt(colorHex.slice(1, 3), 16),
    parseInt(colorHex.slice(3, 5), 16),
    parseInt(colorHex.slice(5, 7), 16),
    Math.round((Number(el.drawingBrushOpacity.value || 100) / 100) * 255)
  ];
  if (target.every((v, i) => v === fill[i])) return;

  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= DRAWING_SIZE || cy >= DRAWING_SIZE) continue;
    const i = (cy * DRAWING_SIZE + cx) * 4;
    if (data[i] !== target[0] || data[i + 1] !== target[1] || data[i + 2] !== target[2] || data[i + 3] !== target[3]) continue;
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = fill[3];
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  layer.context.putImageData(imageData, 0, 0);
}

function initializeDrawingPad() {
  if (!el.drawingCanvas) return;
  drawingContext = el.drawingCanvas.getContext("2d");
  if (!drawingContext) return;
  drawingLayers = [createDrawingLayer("Lineart"), createDrawingLayer("Couleurs")];
  drawingActiveLayerId = drawingLayers[1].id;
  loadDrawingPalette();
  drawLayersToMainCanvas();
  renderDrawingLayersList();
  renderDrawingPalette();
  setActiveDrawingTool("brush");
  pushDrawingHistory();
}

function exportDrawingBlob() {
  drawLayersToMainCanvas();
  return new Promise((resolve, reject) => {
    el.drawingCanvas.toBlob((generatedBlob) => {
      if (generatedBlob) resolve(generatedBlob);
      else reject(new Error("Blob invalide."));
    }, "image/png");
  });
}

function bindDrawingEvents() {
  if (!el.drawingCanvas || !drawingContext) return;

  const start = (event) => {
    const point = getDrawingPointerPosition(event);
    if (drawingActiveTool === "picker") {
      pickColorAtPoint(point);
      return;
    }
    if (drawingActiveTool === "fill") {
      fillLayerAtPoint(point);
      drawLayersToMainCanvas();
      pushDrawingHistory();
      return;
    }
    isDrawingActive = true;
    drawingLastPoint = point;
    drawOnLayer(drawingLastPoint, drawingLastPoint);
    drawLayersToMainCanvas();
  };
  const move = (event) => {
    if (!isDrawingActive || !drawingLastPoint) return;
    event.preventDefault();
    const nextPoint = getDrawingPointerPosition(event);
    drawOnLayer(drawingLastPoint, nextPoint);
    drawingLastPoint = nextPoint;
    drawLayersToMainCanvas();
  };
  const stop = () => {
    if (isDrawingActive) pushDrawingHistory();
    isDrawingActive = false;
    drawingLastPoint = null;
  };

  el.drawingCanvas.addEventListener("pointerdown", start);
  el.drawingCanvas.addEventListener("pointermove", move);
  el.drawingCanvas.addEventListener("pointerup", stop);
  el.drawingCanvas.addEventListener("pointerleave", stop);

  [el.drawingColor, el.drawingBrushSize, el.drawingBrushOpacity].forEach((input) => {
    input?.addEventListener("input", () => renderDrawingPalette());
  });

  el.drawingToolBrushBtn.addEventListener("click", () => setActiveDrawingTool("brush"));
  el.drawingToolEraserBtn.addEventListener("click", () => setActiveDrawingTool("eraser"));
  el.drawingToolFillBtn.addEventListener("click", () => setActiveDrawingTool("fill"));
  el.drawingToolPickerBtn.addEventListener("click", () => setActiveDrawingTool("picker"));

  el.drawingUndoBtn.addEventListener("click", () => {
    if (drawingHistoryIndex <= 0) return;
    drawingHistoryIndex -= 1;
    restoreDrawingHistory(drawingHistory[drawingHistoryIndex]);
  });
  el.drawingRedoBtn.addEventListener("click", () => {
    if (drawingHistoryIndex >= drawingHistory.length - 1) return;
    drawingHistoryIndex += 1;
    restoreDrawingHistory(drawingHistory[drawingHistoryIndex]);
  });

  el.drawingClearLayerBtn.addEventListener("click", () => {
    const layer = getActiveDrawingLayer();
    if (!layer) return;
    layer.context.clearRect(0, 0, DRAWING_SIZE, DRAWING_SIZE);
    drawLayersToMainCanvas();
    pushDrawingHistory();
    setDrawingStatus(`Calque "${layer.name}" effacé.`);
  });

  el.drawingAddPaletteColorBtn.addEventListener("click", () => {
    const color = el.drawingColor.value;
    if (drawingPalette.includes(color)) {
      setDrawingStatus("Couleur déjà dans la palette.");
      return;
    }
    if (drawingPalette.length >= DRAWING_MAX_PALETTE_COLORS) {
      setDrawingStatus("Palette pleine (10 couleurs max).", true);
      return;
    }
    drawingPalette.push(color);
    saveDrawingPalette();
    renderDrawingPalette();
  });

  el.drawingPaletteSwatches.addEventListener("click", (event) => {
    const button = event.target.closest("[data-color]");
    if (!button) return;
    el.drawingColor.value = button.dataset.color;
    renderDrawingPalette();
  });
  el.drawingPaletteSwatches.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const button = event.target.closest("[data-color]");
    if (!button) return;
    drawingPalette = drawingPalette.filter((color) => color !== button.dataset.color);
    saveDrawingPalette();
    renderDrawingPalette();
  });

  el.drawingAddLayerBtn.addEventListener("click", () => {
    const layer = createDrawingLayer();
    drawingLayers.push(layer);
    drawingActiveLayerId = layer.id;
    renderDrawingLayersList();
    pushDrawingHistory();
  });

  el.drawingLayerList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-layer-id]");
    if (!row) return;
    const id = Number(row.dataset.layerId);
    if (event.target.closest(".layer-eye")) {
      const layer = drawingLayers.find((entry) => entry.id === id);
      if (!layer) return;
      layer.visible = !layer.visible;
      drawLayersToMainCanvas();
      renderDrawingLayersList();
      pushDrawingHistory();
      return;
    }
    drawingActiveLayerId = id;
    renderDrawingLayersList();
  });

  el.drawingLayerOpacity.addEventListener("input", () => {
    const layer = getActiveDrawingLayer();
    if (!layer) return;
    layer.opacity = Number(el.drawingLayerOpacity.value || 100) / 100;
    drawLayersToMainCanvas();
    renderDrawingLayersList();
  });
  el.drawingLayerOpacity.addEventListener("change", () => pushDrawingHistory());

  el.drawingLayerUpBtn.addEventListener("click", () => {
    const idx = drawingLayers.findIndex((layer) => layer.id === drawingActiveLayerId);
    if (idx < 0 || idx === drawingLayers.length - 1) return;
    [drawingLayers[idx], drawingLayers[idx + 1]] = [drawingLayers[idx + 1], drawingLayers[idx]];
    drawLayersToMainCanvas();
    renderDrawingLayersList();
    pushDrawingHistory();
  });

  el.drawingLayerDownBtn.addEventListener("click", () => {
    const idx = drawingLayers.findIndex((layer) => layer.id === drawingActiveLayerId);
    if (idx <= 0) return;
    [drawingLayers[idx], drawingLayers[idx - 1]] = [drawingLayers[idx - 1], drawingLayers[idx]];
    drawLayersToMainCanvas();
    renderDrawingLayersList();
    pushDrawingHistory();
  });

  el.drawingDeleteLayerBtn.addEventListener("click", () => {
    if (drawingLayers.length <= 1) {
      setDrawingStatus("Impossible de supprimer le dernier calque.", true);
      return;
    }
    drawingLayers = drawingLayers.filter((layer) => layer.id !== drawingActiveLayerId);
    drawingActiveLayerId = drawingLayers[drawingLayers.length - 1].id;
    drawLayersToMainCanvas();
    renderDrawingLayersList();
    pushDrawingHistory();
  });

  el.drawingDownloadBtn.addEventListener("click", async () => {
    try {
      const blob = await exportDrawingBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dessin-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setDrawingStatus(err.message || "Export impossible.", true);
    }
  });

  el.drawingUploadBtn.addEventListener("click", async () => {
    try {
      setDrawingStatus("Envoi...");
      const blob = await exportDrawingBlob();
      const file = new File([blob], `drawing-${Date.now()}.png`, { type: "image/png" });
      await uploadDrawing(file);
      setDrawingStatus("Dessin envoyé.");
    } catch (err) {
      setDrawingStatus(err.message || "Envoi impossible.", true);
      showToast(err.message || "Envoi impossible.", true);
    }
  });
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
  const pokemons = ensureLegacyPokemonMap(existing);
  const activeEntry = Object.values(pokemons).find((entry) => entry.status === "active") || null;

  const merged = {
    displayName: sanitizeNickname(existing.displayName),
    email,
    emailNorm: email,
    photoURL: authUser.photoURL || null,
    provider: "google",
    role,
    isAdmin: role === "admin",
    rerollsUsed: existing.rerollsUsed || 0,
    pokemons,
    activePokemonId: activeEntry?.pokemonId || null,
    pokemonId: activeEntry?.pokemonId || null,
    status: activeEntry ? "assigned" : "idle",
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
  const rerollsLeft = Math.max(0, MAX_REROLLS - rerollsUsed);
  el.rerollInfo.textContent = `Reroll: ${rerollsLeft}/${MAX_REROLLS}`;

  if (currentUser && !hasNickname()) {
    el.pokemonCard.className = "pokemon-card muted";
    el.pokemonCard.textContent = "Pseudo requis.";
    el.assignBtn.disabled = true;
    el.rerollBtn.disabled = true;
    el.uploadBtn.disabled = true;
    el.uploadState.textContent = "Pseudo requis.";
    el.restartBtn.classList.add("hidden");
    return;
  }

  if (!currentPokemon) {
    el.pokemonCard.className = "pokemon-card muted";
    el.pokemonCard.textContent = "Aucun Pokémon.";
    el.assignBtn.disabled = false;
    el.rerollBtn.disabled = true;
    el.uploadBtn.disabled = true;
    el.uploadState.textContent = "En attente.";
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
  el.rerollBtn.disabled = !isAssigned || rerollsUsed >= MAX_REROLLS;
  el.uploadBtn.disabled = !isAssigned;
  el.uploadState.textContent = isAssigned ? "Prêt." : "Terminé.";
  el.restartBtn.classList.toggle("hidden", !isCompleted);
}

function getCompletedPokemon(allPokemon) {
  return Object.values(allPokemon || {})
    .filter((pokemon) => {
      const imageUrl = typeof pokemon?.imageUrl === "string" ? pokemon.imageUrl.trim() : "";
      const hasValidImage =
        imageUrl.length > 0
        && /^(data:image\/|https?:\/\/|blob:)/i.test(imageUrl);
      const isCompleted = pokemon?.status === "completed" || Boolean(pokemon?.completedAt);
      return hasValidImage && isCompleted;
    })
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
}

function normalizePokemonFileNamePart(value) {
  return normalizePokemonName(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "pokemon";
}

function getImageExtensionFromUrl(url = "") {
  if (/^data:image\/png/i.test(url)) return "png";
  if (/^data:image\/jpe?g/i.test(url)) return "jpg";
  if (/^data:image\/webp/i.test(url)) return "webp";
  if (/^data:image\/gif/i.test(url)) return "gif";

  const cleanedUrl = url.split("?")[0].split("#")[0];
  const extension = cleanedUrl.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }
  return "png";
}

function buildPokemonDownloadName(pokemon) {
  const number = String(pokemon.id).padStart(3, "0");
  const name = normalizePokemonFileNamePart(pokemon.name);
  const extension = getImageExtensionFromUrl(pokemon.imageUrl);
  return `${number}-${name}.${extension}`;
}

function renderGalleryProgress() {
  const done = completedPokemonList.length;
  const total = POKEMON_151.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  el.galleryProgress.textContent = `${done}/${total} (${percent}%)`;
}

function getGalleryAuthorName(pokemon) {
  return sanitizeNickname(pokemon?.authorName) || GALLERY_UNKNOWN_AUTHOR;
}

function getRatingAverage(pokemon) {
  if (!pokemon || !Number.isFinite(Number(pokemon.ratingAverage))) return 0;
  const value = Number(pokemon.ratingAverage);
  return Math.max(0, Math.min(GALLERY_RATING_MAX, value));
}

function getRatingCount(pokemon) {
  const count = Number(pokemon?.ratingCount);
  return Number.isInteger(count) && count > 0 ? count : 0;
}

function getMyRatingForPokemon(pokemon) {
  if (!currentUser?.uid || !pokemon?.ratings) return 0;
  const score = Number(pokemon.ratings[currentUser.uid]);
  return Number.isInteger(score) && score >= GALLERY_RATING_MIN && score <= GALLERY_RATING_MAX ? score : 0;
}

function renderRatingStars(pokemon) {
  const myRating = getMyRatingForPokemon(pokemon);
  const stars = [];
  for (let score = GALLERY_RATING_MIN; score <= GALLERY_RATING_MAX; score += 1) {
    const isActive = myRating >= score;
    stars.push(`
      <button
        type="button"
        class="star-btn ${isActive ? "active" : ""}"
        data-action="rate"
        data-id="${pokemon.id}"
        data-score="${score}"
        title="Noter ${score}/5"
        aria-label="Noter ${score} étoile${score > 1 ? "s" : ""}">
        <span class="material-symbols-rounded" aria-hidden="true">star</span>
      </button>
    `);
  }
  return stars.join("");
}

function compareNames(a, b) {
  return a.localeCompare(b, "fr", { sensitivity: "base", numeric: true });
}

function getUniqueGalleryAuthors(pokemonList = completedPokemonList) {
  return [...new Set((pokemonList || []).map(getGalleryAuthorName))]
    .sort(compareNames);
}

function getFilteredGalleryPokemon() {
  if (selectedGalleryAuthor === GALLERY_FILTER_ALL_VALUE) return completedPokemonList;
  return completedPokemonList.filter((pokemon) => getGalleryAuthorName(pokemon) === selectedGalleryAuthor);
}

function getGalleryFilterStorageKey() {
  return `${GALLERY_FILTER_STORAGE_PREFIX}${activeGeneration}`;
}

function saveGalleryAuthorFilter() {
  try {
    sessionStorage.setItem(getGalleryFilterStorageKey(), selectedGalleryAuthor);
  } catch (err) {
    console.warn("[Gallery] Impossible de sauvegarder le filtre de pseudo.", err);
  }
}

function loadGalleryAuthorFilter() {
  try {
    const stored = sessionStorage.getItem(getGalleryFilterStorageKey());
    return stored || GALLERY_FILTER_ALL_VALUE;
  } catch (err) {
    return GALLERY_FILTER_ALL_VALUE;
  }
}

function ensureValidGalleryFilter(availableAuthors = []) {
  const available = new Set(availableAuthors);
  if (selectedGalleryAuthor !== GALLERY_FILTER_ALL_VALUE && !available.has(selectedGalleryAuthor)) {
    selectedGalleryAuthor = GALLERY_FILTER_ALL_VALUE;
  }
}

function renderGalleryAuthorFilter() {
  if (!el.galleryAuthorFilter) return;
  const authorOptions = getUniqueGalleryAuthors();
  ensureValidGalleryFilter(authorOptions);
  el.galleryAuthorFilter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = GALLERY_FILTER_ALL_VALUE;
  allOption.textContent = "Tous les pseudos";
  el.galleryAuthorFilter.append(allOption);
  authorOptions.forEach((author) => {
    const option = document.createElement("option");
    option.value = author;
    option.textContent = author;
    el.galleryAuthorFilter.append(option);
  });
  el.galleryAuthorFilter.value = selectedGalleryAuthor;
  el.galleryAuthorFilter.disabled = authorOptions.length === 0;
}

function renderGallery() {
  renderGalleryProgress();
  renderGalleryAuthorFilter();
  const visiblePokemon = getFilteredGalleryPokemon();

  if (!completedPokemonList.length) {
    el.gallery.innerHTML = '<p class="small">Aucun dessin.</p>';
    return;
  }

  if (!visiblePokemon.length) {
    el.gallery.innerHTML = '<p class="small">Aucun dessin pour ce pseudo.</p>';
    return;
  }

  el.gallery.innerHTML = visiblePokemon.map((p) => {
    const authorName = getGalleryAuthorName(p);
    const ratingAverage = getRatingAverage(p);
    const ratingCount = getRatingCount(p);
    const ratingSummary = ratingCount
      ? `${ratingAverage.toFixed(1)}/5 · ${ratingCount} vote${ratingCount > 1 ? "s" : ""}`
      : "Pas encore de note";
    return `
    <article class="gallery-item">
      <img src="${p.imageUrl}" alt="Dessin de ${p.name}" loading="lazy" />
      <div class="gallery-meta">
        <strong class="gallery-title">#${String(p.id).padStart(3, "0")} ${p.name}</strong>
        <div class="small gallery-author" title="Par ${escapeHtml(authorName)}">Par ${escapeHtml(authorName)}</div>
        <div class="gallery-rating">
          <div class="gallery-rating-row">${renderRatingStars(p)}</div>
          <div class="small rating-stats">${ratingSummary}</div>
        </div>
        <button class="btn btn-secondary gallery-download-btn" type="button" data-id="${p.id}">
          Télécharger
        </button>
      </div>
    </article>
  `;
  }).join("");
}

function triggerDownloadFromBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function triggerDirectDownloadFallback(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function downloadPokemonImage(pokemonId) {
  const pokemon = completedPokemonList.find((item) => item.id === pokemonId);
  if (!pokemon?.imageUrl) throw new Error("Image introuvable.");

  const fileName = buildPokemonDownloadName(pokemon);
  try {
    const response = await fetch(pokemon.imageUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Image indisponible.");
    const blob = await response.blob();
    if (!blob || !blob.size) throw new Error("Image vide.");
    triggerDownloadFromBlob(blob, fileName);
  } catch (err) {
    triggerDirectDownloadFallback(pokemon.imageUrl, fileName);
  }
}

function computeRatingAggregate(ratingsMap = {}) {
  const values = Object.values(ratingsMap)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= GALLERY_RATING_MIN && value <= GALLERY_RATING_MAX);
  if (!values.length) return { ratingAverage: 0, ratingCount: 0 };
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    ratingAverage: Number((total / values.length).toFixed(2)),
    ratingCount: values.length
  };
}

async function submitPokemonRating(pokemonId, score) {
  if (!currentUser?.uid) {
    showToast("Connecte-toi pour noter les dessins.", true);
    return;
  }
  if (!Number.isInteger(score) || score < GALLERY_RATING_MIN || score > GALLERY_RATING_MAX) return;
  const pokemonRef = ref(db, `${generationPokemonPath()}/${pokemonId}`);
  await runTransaction(pokemonRef, (pokemon) => {
    if (!pokemon || !pokemon.imageUrl) return pokemon;
    const ratings = { ...(pokemon.ratings || {}) };
    ratings[currentUser.uid] = score;
    const aggregate = computeRatingAggregate(ratings);
    return {
      ...pokemon,
      ratings,
      ratingAverage: aggregate.ratingAverage,
      ratingCount: aggregate.ratingCount,
      ratingUpdatedAt: Date.now()
    };
  });
}

function computeFresqueLayout(total, mode, value, widthPx = 0, heightPx = 0) {
  if (!total) return { cols: 0, rows: 0 };
  if (mode === "columns") {
    const cols = Math.max(1, value);
    return { cols, rows: Math.ceil(total / cols) };
  }
  if (mode === "rows") {
    const rows = Math.max(1, value);
    return { rows, cols: Math.ceil(total / rows) };
  }
  if (mode === "dimensions") {
    const safeWidth = Math.max(100, widthPx || 100);
    const safeHeight = Math.max(100, heightPx || 100);
    const ratio = safeWidth / safeHeight;
    const cols = Math.max(1, Math.ceil(Math.sqrt(total * ratio)));
    return { cols, rows: Math.ceil(total / cols) };
  }

  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  return { cols, rows: Math.ceil(total / cols) };
}

function getCurrentFresqueDisplayOptions() {
  return {
    number: el.fresqueShowNumber.checked,
    name: el.fresqueShowName.checked,
    pseudo: el.fresqueShowPseudo.checked
  };
}

function getFresqueMetaPartsWithOptions(pokemon, displayOptions) {
  const parts = [];
  if (displayOptions.number) {
    parts.push({ type: "number", value: `#${String(pokemon.id).padStart(3, "0")}` });
  }
  if (displayOptions.name) {
    parts.push({ type: "name", value: pokemon.name });
  }
  if (displayOptions.pseudo && pokemon.authorName) {
    parts.push({ type: "pseudo", value: pokemon.authorName });
  }
  return parts;
}

function getFresqueMetaSingleLineWithOptions(pokemon, displayOptions) {
  return getFresqueMetaPartsWithOptions(pokemon, displayOptions)
    .map((part) => part.value)
    .filter(Boolean)
    .join(" · ");
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
  const widthPx = Number(el.fresqueWidth.value || 1920);
  const heightPx = Number(el.fresqueHeight.value || 1080);
  const fresquePokemonList = [...completedPokemonList].sort((a, b) => a.id - b.id);
  const displayOptions = getCurrentFresqueDisplayOptions();
  const isAutoMode = mode === "auto";
  const isDimensionsMode = mode === "dimensions";
  el.fresqueValue.disabled = isAutoMode || isDimensionsMode;
  el.fresqueWidth.disabled = !isDimensionsMode;
  el.fresqueHeight.disabled = !isDimensionsMode;

  const { cols, rows } = computeFresqueLayout(fresquePokemonList.length, mode, value, widthPx, heightPx);
  const safeWidth = Math.max(100, widthPx);
  const safeHeight = Math.max(100, heightPx);
  const estimatedCellWidth = isDimensionsMode ? Math.max(1, safeWidth / Math.max(1, cols)) : 220;
  const estimatedCellHeight = isDimensionsMode ? Math.max(1, safeHeight / Math.max(1, rows)) : estimatedCellWidth;
  const baseFontPx = Math.max(9, Math.min(14, Math.round(Math.min(estimatedCellWidth, estimatedCellHeight) * 0.07)));
  const metaLineHeight = Math.max(1.05, Math.min(1.25, Number((baseFontPx / 12).toFixed(2))));
  el.fresqueGrid.style.setProperty("--fresque-meta-font-size", `${baseFontPx}px`);
  el.fresqueGrid.style.setProperty("--fresque-meta-line-height", String(metaLineHeight));
  if (isDimensionsMode) {
    el.fresqueInfo.textContent = `${fresquePokemonList.length} dessins · ${cols} colonnes × ${rows} lignes · ${safeWidth} × ${safeHeight} px`;
    el.fresqueGrid.style.width = `${safeWidth}px`;
    el.fresqueGrid.style.maxWidth = "100%";
  } else {
    el.fresqueInfo.textContent = `${fresquePokemonList.length} dessins · ${cols} colonnes × ${rows} lignes`;
    el.fresqueGrid.style.width = "";
    el.fresqueGrid.style.maxWidth = "";
  }
  el.fresqueGrid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  el.fresqueGrid.innerHTML = fresquePokemonList.map((p) => `
    <article class="fresque-cell">
      <img src="${p.imageUrl}" alt="${p.name}" loading="lazy" />
      <div class="fresque-meta">
        <span class="fresque-meta-line">${escapeHtml(getFresqueMetaSingleLineWithOptions(p, displayOptions))}</span>
      </div>
    </article>
  `).join("");
  el.downloadFresqueBtn.disabled = false;
}

async function syncCurrentPokemon() {
  const activeEntry = getActivePokemonEntry(currentUser);
  if (!activeEntry?.pokemonId) {
    currentPokemon = null;
    renderMyPokemon();
    return;
  }

  const snap = await get(ref(db, `${generationPokemonPath()}/${activeEntry.pokemonId}`));
  currentPokemon = snap.exists() ? snap.val() : null;
  if (currentPokemon && activeEntry.authorName) currentPokemon.authorName = activeEntry.authorName;
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
  const userPokemonMap = {
    ...normalizeUserPokemonMap(user?.pokemons)
  };

  userPokemonMap[selected.id] = {
    pokemonId: selected.id,
    status: "active",
    image: null,
    authorName: finalAuthorName || null,
    assignedAt: Date.now(),
    completedAt: null,
    updatedAt: Date.now()
  };

  const updates = {
    [`${generationPokemonPath()}/${selected.id}/status`]: "assigned",
    [`${generationPokemonPath()}/${selected.id}/userId`]: user.id,
    [`${generationPokemonPath()}/${selected.id}/assignedAt`]: Date.now(),
    [`${generationPokemonPath()}/${selected.id}/completedAt`]: null,
    [`${generationPokemonPath()}/${selected.id}/imageUrl`]: null,
    [`${generationPokemonPath()}/${selected.id}/artistName`]: null,
    [`${generationPokemonPath()}/${selected.id}/authorName`]: finalAuthorName || null,
    [`${generationUsersPath()}/${user.id}/pokemons`]: userPokemonMap,
    [`${generationUsersPath()}/${user.id}/activePokemonId`]: selected.id,
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
    if (userPokemonMap[oldPokemonId]?.status === "active") {
      delete userPokemonMap[oldPokemonId];
      updates[`${generationUsersPath()}/${user.id}/pokemons`] = userPokemonMap;
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

async function findUserByPublicPseudo(pseudo) {
  const normalizedPseudo = normalizeNicknameForLookup(pseudo);
  if (!normalizedPseudo) throw new Error("Pseudo requis.");

  const usersSnap = await get(ref(db, generationUsersPath()));
  const users = usersSnap.val() || {};
  const matches = Object.entries(users)
    .filter(([, userData]) => normalizeNicknameForLookup(userData?.displayName) === normalizedPseudo)
    .map(([id, userData]) => ({ id, ...userData }));

  if (!matches.length) throw new Error("Pseudo introuvable.");
  if (matches.length > 1) throw new Error("Pseudo ambigu.");

  const target = matches[0];
  return {
    ...target,
    pokemons: ensureLegacyPokemonMap(target),
    activePokemonId: getActivePokemonEntry(target)?.pokemonId || null
  };
}

async function assignPokemon() {
  if (!hasNickname()) throw new Error("Pseudo requis.");
  const activeEntry = getActivePokemonEntry(currentUser);
  if (activeEntry) {
    showToast("Déjà un Pokémon en cours.", true);
    return;
  }

  const selected = await assignPokemonToUser({ user: currentUser });
  currentUser.pokemons = {
    ...normalizeUserPokemonMap(currentUser?.pokemons),
    [selected.id]: {
      pokemonId: selected.id,
      status: "active",
      image: null,
      authorName: sanitizeNickname(selected.authorName) || null,
      assignedAt: Date.now(),
      completedAt: null,
      updatedAt: Date.now()
    }
  };
  currentUser.activePokemonId = selected.id;
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
  if (rerollsUsed >= MAX_REROLLS) throw new Error("Limite de reroll atteinte.");

  const selected = await assignPokemonToUser({ user: currentUser, oldPokemonId: currentPokemon.id });
  const newCount = rerollsUsed + 1;
  await update(ref(db), {
    [`${generationUsersPath()}/${currentUser.id}/rerollsUsed`]: newCount,
    [`${generationUsersPath()}/${currentUser.id}/pokemonId`]: selected.id,
    [`${generationUsersPath()}/${currentUser.id}/status`]: "assigned"
  });

  currentUser.rerollsUsed = newCount;
  const updatedMap = { ...normalizeUserPokemonMap(currentUser?.pokemons) };
  if (currentPokemon?.id && updatedMap[currentPokemon.id]?.status === "active") {
    delete updatedMap[currentPokemon.id];
  }
  updatedMap[selected.id] = {
    pokemonId: selected.id,
    status: "active",
    image: null,
    authorName: sanitizeNickname(selected.authorName) || null,
    assignedAt: Date.now(),
    completedAt: null,
    updatedAt: Date.now()
  };
  currentUser.pokemons = updatedMap;
  currentUser.activePokemonId = selected.id;
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
  const targetUser = customPseudo ? await findUserByPublicPseudo(customPseudo) : currentUser;

  if (selectedPokemon.userId && selectedPokemon.userId !== targetUser.id) {
    const otherUserSnap = await get(ref(db, `${generationUsersPath()}/${selectedPokemon.userId}`));
    const otherUserData = otherUserSnap.exists() ? otherUserSnap.val() : {};
    const otherMap = normalizeUserPokemonMap(otherUserData?.pokemons);
    if (otherMap[selectedPokemon.id]?.status === "active") {
      delete otherMap[selectedPokemon.id];
    }
    await update(ref(db), {
      [`${generationUsersPath()}/${selectedPokemon.userId}/pokemons`]: otherMap,
      [`${generationUsersPath()}/${selectedPokemon.userId}/activePokemonId`]: null,
      [`${generationUsersPath()}/${selectedPokemon.userId}/pokemonId`]: null,
      [`${generationUsersPath()}/${selectedPokemon.userId}/status`]: "idle"
    });
  }

  const activeEntry = getActivePokemonEntry(targetUser);
  const selected = await assignPokemonToUser({
    user: targetUser,
    oldPokemonId: activeEntry?.pokemonId || null,
    selectedPokemon,
    authorName: sanitizeNickname(targetUser.displayName) || customPseudo || currentUser.displayName
  });

  if (targetUser.id === currentUser.id) {
    const updatedMap = { ...normalizeUserPokemonMap(currentUser?.pokemons) };
    if (activeEntry?.pokemonId && activeEntry.pokemonId !== selected.id && updatedMap[activeEntry.pokemonId]?.status === "active") {
      delete updatedMap[activeEntry.pokemonId];
    }
    updatedMap[selected.id] = {
      pokemonId: selected.id,
      status: "active",
      image: null,
      authorName: sanitizeNickname(selected.authorName) || null,
      assignedAt: Date.now(),
      completedAt: null,
      updatedAt: Date.now()
    };
    currentUser.pokemons = updatedMap;
    currentUser.activePokemonId = selected.id;
    currentUser.pokemonId = selected.id;
    currentUser.status = "assigned";
    currentPokemon = selected;
  } else {
    await syncCurrentUser();
    await syncCurrentPokemon();
  }
  el.adminAssignForm.reset();
  renderMyPokemon();
  showToast(`Attribué: ${selected.name}`);
}

async function uploadDrawing(file) {
  if (!hasNickname()) throw new Error("Pseudo requis.");
  if (!currentPokemon || currentPokemon.status !== "assigned") throw new Error("Aucun Pokémon en cours.");
  const imageData = await fileToDataUrl(file);
  const targetUserId = currentPokemon.userId || currentUser.id;
  if (!targetUserId) throw new Error("Joueur introuvable.");
  const now = Date.now();
  const completionTx = await runTransaction(ref(db, `${generationPokemonPath()}/${currentPokemon.id}`), (pokemon) => {
    if (!pokemon) return;
    if (pokemon.status === "completed") return;
    if (pokemon.status !== "assigned") return;
    if (pokemon.userId && pokemon.userId !== targetUserId) return;
    return {
      ...pokemon,
      status: "completed",
      imageUrl: imageData,
      completedAt: now
    };
  });
  if (!completionTx.committed) {
    throw new Error("Ce Pokémon est déjà terminé ou indisponible.");
  }

  const targetUserSnap = await get(ref(db, `${generationUsersPath()}/${targetUserId}`));
  const targetUserData = targetUserSnap.exists() ? targetUserSnap.val() : {};
  const targetPokemonMap = normalizeUserPokemonMap(targetUserData?.pokemons);
  const authorName = sanitizeNickname(currentPokemon.authorName)
    || sanitizeNickname(targetUserData?.displayName)
    || sanitizeNickname(currentUser.displayName);

  await update(ref(db), {
    [`${generationPokemonPath()}/${currentPokemon.id}/authorName`]: authorName,
    [`${generationPokemonPath()}/${currentPokemon.id}/artistName`]: null,
    [`${generationPokemonPath()}/${currentPokemon.id}/completedAt`]: now,
    [`${generationUsersPath()}/${targetUserId}/pokemons/${currentPokemon.id}`]: {
      pokemonId: currentPokemon.id,
      status: "completed",
      image: imageData,
      authorName,
      assignedAt: targetPokemonMap[currentPokemon.id]?.assignedAt || currentPokemon.assignedAt || null,
      completedAt: now,
      updatedAt: now
    },
    [`${generationUsersPath()}/${targetUserId}/activePokemonId`]: null,
    [`${generationUsersPath()}/${targetUserId}/pokemonId`]: null,
    [`${generationUsersPath()}/${targetUserId}/status`]: "idle",
    [`${generationUsersPath()}/${targetUserId}/rerollsUsed`]: 0,
    [`${generationUsersPath()}/${targetUserId}/updatedAt`]: now
  });

  if (targetUserId === currentUser.id) {
    currentUser.pokemons = {
      ...normalizeUserPokemonMap(currentUser?.pokemons),
      [currentPokemon.id]: {
        pokemonId: currentPokemon.id,
        status: "completed",
        image: imageData,
        authorName,
        assignedAt: currentPokemon.assignedAt || null,
        completedAt: now,
        updatedAt: now
      }
    };
    currentUser.activePokemonId = null;
    currentUser.pokemonId = null;
    currentUser.status = "idle";
    currentUser.rerollsUsed = 0;
  } else {
    await syncCurrentUser();
  }
  currentPokemon = null;
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
  selectedGalleryAuthor = loadGalleryAuthorFilter();
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
    const userSnap = await get(ref(db, `${generationUsersPath()}/${pokemon.userId}`));
    const userData = userSnap.exists() ? userSnap.val() : {};
    const userPokemonMap = normalizeUserPokemonMap(userData?.pokemons);
    if (userPokemonMap[pokemon.id]?.status === "active") {
      delete userPokemonMap[pokemon.id];
    }
    updates[`${generationUsersPath()}/${pokemon.userId}/pokemons`] = userPokemonMap;
    updates[`${generationUsersPath()}/${pokemon.userId}/activePokemonId`] = null;
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
  if (!snap.exists()) {
    currentUser = null;
    renderAuthState();
    return;
  }
  const data = snap.val();
  const pokemons = ensureLegacyPokemonMap(data);
  const activeEntry = Object.values(pokemons).find((entry) => entry.status === "active") || null;
  currentUser = {
    id: currentUser.id,
    ...data,
    pokemons,
    activePokemonId: activeEntry?.pokemonId || null,
    pokemonId: activeEntry?.pokemonId || null,
    status: activeEntry ? "assigned" : "idle"
  };
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
  const widthPx = Math.max(100, Number(el.fresqueWidth.value || 1920));
  const heightPx = Math.max(100, Number(el.fresqueHeight.value || 1080));
  const displayOptions = getCurrentFresqueDisplayOptions();
  const fresquePokemonList = [...completedPokemonList].sort((a, b) => a.id - b.id);
  const { cols } = computeFresqueLayout(fresquePokemonList.length, mode, value, widthPx, heightPx);

  const exportWidth = mode === "dimensions" ? widthPx : cols * 220;
  const rows = Math.ceil(fresquePokemonList.length / cols);
  const imageSize = Math.max(10, Math.floor(exportWidth / cols));
  const exportHeightByGrid = imageSize * rows;
  const exportHeight = mode === "dimensions" ? heightPx : exportHeightByGrid;
  const cellHeight = Math.max(1, exportHeight / rows);
  const baseFontPx = Math.max(8, Math.min(14, Math.round(Math.min(imageSize, cellHeight) * 0.065)));
  const showMeta = displayOptions.number || displayOptions.name || displayOptions.pseudo;
  const canvas = document.createElement("canvas");
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const truncateCanvasText = (text, maxWidth) => {
    if (!text || ctx.measureText(text).width <= maxWidth) return text;
    let trimmed = text;
    while (trimmed.length > 0 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
      trimmed = trimmed.slice(0, -1);
    }
    return trimmed ? `${trimmed}…` : "";
  };

  const tasks = fresquePokemonList.map((pokemon, index) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * imageSize;
      const y = row * cellHeight;
      const drawWidth = Math.min(imageSize, canvas.width - x);
      const drawHeight = Math.min(cellHeight, canvas.height - y);
      if (drawWidth <= 0 || drawHeight <= 0) {
        resolve();
        return;
      }

      let imageAreaHeight = drawHeight;
      let metaText = "";
      const lineHeightPx = Math.round(baseFontPx * 1.12);
      const textPaddingBottom = Math.max(3, Math.round(baseFontPx * 0.35));
      const textPaddingTop = Math.max(2, Math.round(baseFontPx * 0.25));
      const textPaddingX = 8;
      if (showMeta) {
        const maxTextWidth = Math.max(8, drawWidth - (textPaddingX * 2));
        metaText = truncateCanvasText(
          getFresqueMetaSingleLineWithOptions(pokemon, displayOptions),
          maxTextWidth
        );
        if (metaText) {
          const textBlockHeight = lineHeightPx + textPaddingTop + textPaddingBottom;
          const maxReserved = drawHeight * 0.2;
          imageAreaHeight = Math.max(10, drawHeight - Math.min(textBlockHeight, maxReserved));
        }
      }

      ctx.drawImage(img, x, y, drawWidth, imageAreaHeight);

      if (metaText) {
        ctx.fillStyle = "#000000";
        ctx.font = `800 ${baseFontPx}px "Nunito", "Trebuchet MS", "Inter", Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        const textY = y + imageAreaHeight + textPaddingTop + lineHeightPx;
        ctx.fillText(metaText, x + (drawWidth / 2), textY);
      }
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

  el.drawingFile.addEventListener("change", () => {
    const file = el.drawingFile.files?.[0];
    el.uploadFileInfo.textContent = file ? `Fichier: ${file.name}` : "Aucun fichier.";
  });

  el.uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = el.drawingFile.files?.[0];
    if (!file) return;
    try {
      el.uploadState.textContent = "Upload...";
      await uploadDrawing(file);
      el.uploadForm.reset();
      el.uploadFileInfo.textContent = "Aucun fichier.";
      el.uploadState.textContent = "Terminé.";
    } catch (err) {
      el.uploadState.textContent = "Erreur upload.";
      showToast(err.message || "Upload impossible.", true);
    }
  });
  el.gallery.addEventListener("click", async (e) => {
    const starButton = e.target.closest('[data-action="rate"]');
    if (starButton) {
      const pokemonId = Number(starButton.dataset.id);
      const score = Number(starButton.dataset.score);
      try {
        await submitPokemonRating(pokemonId, score);
      } catch (err) {
        logFirebaseError("ratePokemon", err);
        showToast("Impossible d'enregistrer la note.", true);
      }
      return;
    }

    const button = e.target.closest(".gallery-download-btn");
    if (!button) return;
    const pokemonId = Number(button.dataset.id);
    if (!Number.isInteger(pokemonId)) return;
    button.disabled = true;
    try {
      await downloadPokemonImage(pokemonId);
      showToast("Téléchargement lancé.");
    } catch (err) {
      showToast(err.message || "Téléchargement impossible.", true);
    } finally {
      button.disabled = false;
    }
  });
  el.galleryAuthorFilter?.addEventListener("change", (e) => {
    selectedGalleryAuthor = e.target.value || GALLERY_FILTER_ALL_VALUE;
    saveGalleryAuthorFilter();
    renderGallery();
  });

  el.fresqueForm.addEventListener("input", renderFresque);
  el.fresqueShowNumber.addEventListener("change", () => {
    renderFresque();
  });
  el.fresqueShowName.addEventListener("change", () => {
    renderFresque();
  });
  el.fresqueShowPseudo.addEventListener("change", () => {
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
  initializeDrawingPad();
  bindEvents();
  bindDrawingEvents();
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
