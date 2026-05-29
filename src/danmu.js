const TYPES = {
  normal: {
    colors: ["#fff", "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff922b", "#20c997", "#cc5de8"],
    badge: "",
    prefix: "",
    fontSize: "30px",
    textShadow: "1px 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.7)",
  },
  vip: {
    colors: ["#ffd700", "#ffec8b", "#ffb90f", "#ffc125", "#ffd39b"],
    badge: "👑 ",
    prefix: "",
    fontSize: "34px",
    textShadow: "1px 1px 2px rgba(0,0,0,0.95), 0 0 12px rgba(255,215,0,0.9), 0 0 24px rgba(255,215,0,0.4)",
  },
  announce: {
    colors: ["#fff"],
    badge: "📢 ",
    prefix: "",
    fontSize: "36px",
    textShadow: "1px 1px 2px rgba(0,0,0,0.95), 0 0 16px rgba(255,255,255,0.6)",
  },
};

const TRACK_COUNT = 14;
const TRACK_HEIGHT = 44;
const MAX_VISIBLE = 80;

let visibleCount = 0;
const activeDanmus = [];

const container = document.getElementById("danmu-container");

function pickTrack() {
  const occupied = new Set(activeDanmus.map((d) => d.track));
  for (let i = 0; i < TRACK_COUNT; i++) {
    if (!occupied.has(i)) return i;
  }
  return Math.floor(Math.random() * TRACK_COUNT);
}

function buildContent(text, nickname, type) {
  const nickSpan = `<span class="danmu-nick">${escapeHtml(nickname)}：</span>`;
  const textSpan = `<span class="danmu-text">${escapeHtml(text)}</span>`;
  return type.badge + type.prefix + nickSpan + textSpan;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function createDanmu(text, options = {}) {
  if (!container) return;

  const type = TYPES[options.type] || TYPES.normal;
  const color = type.colors[Math.floor(Math.random() * type.colors.length)];
  const nickname = options.nickname || "观众";

  if (visibleCount >= MAX_VISIBLE) {
    const oldest = activeDanmus.shift();
    if (oldest) { oldest.el.remove(); visibleCount--; }
  }

  if (options.type === "announce") {
    const el = document.createElement("div");
    el.className = "danmu danmu-announce";
    el.innerHTML = buildContent(text, nickname, type);
    el.style.color = color;
    el.style.fontSize = type.fontSize;
    el.style.textShadow = type.textShadow;
    el.style.top = "40%";
    el.style.left = "50%";
    el.style.transform = "translate(-50%, -50%)";
    el.style.animation = "none";
    el.style.background = "rgba(0,0,0,0.65)";
    el.style.padding = "12px 32px";
    el.style.borderRadius = "8px";

    container.appendChild(el);
    visibleCount++;

    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.5s";
      setTimeout(() => { el.remove(); visibleCount--; }, 500);
    }, 4000);
    return;
  }

  const track = pickTrack();
  const el = document.createElement("div");
  el.className = "danmu";
  if (options.type === "vip") el.classList.add("danmu-vip");

  el.innerHTML = buildContent(text, nickname, type);
  el.style.top = track * TRACK_HEIGHT + "px";
  el.style.color = color;
  el.style.fontSize = type.fontSize;
  el.style.textShadow = type.textShadow;

  const duration = Math.max(6000, 8000 + text.length * 150);
  el.style.animationDuration = duration + "ms";

  container.appendChild(el);
  visibleCount++;

  const record = { el, track };
  activeDanmus.push(record);

  el.addEventListener("animationend", () => {
    el.remove();
    visibleCount--;
    const idx = activeDanmus.indexOf(record);
    if (idx !== -1) activeDanmus.splice(idx, 1);
  });
}
