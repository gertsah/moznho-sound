const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const snap = (value) => Math.round(value);

const getStageProgress = (element) => {
  const rect = element.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;

  if (distance <= 0) {
    return rect.top <= 0 ? 1 : 0;
  }

  return clamp(-rect.top / distance, 0, 1);
};

const revealElements = document.querySelectorAll("[data-reveal]");
const heroStage = document.querySelector("[data-hero-stage]");
const logoTop = document.querySelector("[data-logo-top]");
const logoBottom = document.querySelector("[data-logo-bottom]");
const logoNames = document.querySelector("[data-logo-names]");
const heroTags = [...document.querySelectorAll("[data-hero-tag]")];
const nameItems = logoNames ? [...logoNames.querySelectorAll("span")] : [];
const rosterStage = document.querySelector("[data-roster-stage]");
const rosterStack = rosterStage?.querySelector(".roster-stage__stack");
const artistPanels = rosterStage
  ? [...rosterStage.querySelectorAll("[data-artist-panel]")]
  : [];
const artistPanelParts = artistPanels.map((panel) => ({
  panel,
  indexLabel: panel.querySelector(".artist-panel__index"),
  cover: panel.querySelector(".artist-panel__cover"),
  body: panel.querySelector(".artist-panel__body")
}));
const reelSection = document.querySelector("[data-reel-section]");
const reelTrack = reelSection?.querySelector(".reel-track");
const reelCards = reelSection ? [...reelSection.querySelectorAll(".reel-card")] : [];
const backgroundCanvas = document.querySelector("[data-bg-canvas]");
const cursorOrb = document.querySelector("[data-cursor-orb]");
const detailCards = [...document.querySelectorAll("[data-detail-id]")];
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const spotifySearch = (query) => `https://open.spotify.com/search/${encodeURIComponent(query)}`;
const youtubeMusicSearch = (query) => `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
const appleSearch = (query) => `https://music.apple.com/us/search?term=${encodeURIComponent(query)}`;
const releaseLinks = {
  gyb: "https://band.link/gybmozhnosound",
  notForUs: "https://band.link/notforuzzz",
  wowWow: "https://band.link/wowwow193",
  vibekilla: "https://band.link/vibekilla",
  wonme: "https://band.link/vvonme",
  lady: "https://union.promo/Lady"
};
const detailCatalog = {
  "artist-double-g": {
    kind: "artist",
    title: "DOUBLE G",
    eyebrow: "mozhno sound",
    small: "GYB / WOW WOW",
    description: "Центральное имя текущего среза. Через Double G собираются GYB, not for us и WOW WOW.",
    meta: ["artist", "MOZHNO Sound", "Новороссийск"],
    coverClass: "cover-art--double-g",
    links: [
      { label: "Apple Music", href: "https://music.apple.com/gb/artist/double-g/1604653397" },
      { label: "Spotify", href: spotifySearch("Double G GYB WOW WOW") },
      { label: "YouTube Music", href: youtubeMusicSearch("Double G GYB WOW WOW") }
    ]
  },
  "artist-yarou": {
    kind: "artist",
    title: "YAROU",
    eyebrow: "artist",
    small: "WONME / GYB",
    description: "Отдельный артист в WONME и часть общей связки в GYB. Карточка собирает его сольный и совместный контекст.",
    meta: ["artist", "single focus", "Новороссийск"],
    coverClass: "cover-art--yarou",
    links: [
      { label: "Apple Music", href: "https://music.apple.com/tr/artist/yarou/1858598824?l=tr" },
      { label: "Spotify", href: spotifySearch("YAROU WONME") },
      { label: "YouTube Music", href: youtubeMusicSearch("YAROU WONME") }
    ]
  },
  "artist-uh-body": {
    kind: "artist",
    title: "UH! BODY",
    eyebrow: "roster",
    small: "GYB / NOT FOR US",
    description: "Повторяющееся имя рядом с Double G: сначала GYB, потом not for us. Здесь собрана точка входа в связанные релизы.",
    meta: ["artist", "roster", "Новороссийск"],
    coverClass: "cover-art--uh-body",
    links: [
      { label: "Apple Music", href: appleSearch("UH! BODY") },
      { label: "Spotify", href: spotifySearch("UH! BODY GYB not for us") },
      { label: "YouTube Music", href: youtubeMusicSearch("UH! BODY GYB not for us") }
    ]
  },
  "release-gyb": {
    kind: "release",
    title: "GYB",
    eyebrow: "26 nov 2025",
    small: "Double G / YAROU / UH! BODY",
    description: "Совместный релиз, который собирает Double G, YAROU и UH! BODY в одном плотном треке.",
    meta: ["release", "single", "2025"],
    coverClass: "cover-art--gyb",
    links: [
      { label: "Apple Music", href: appleSearch("GYB Double G YAROU UH! BODY") },
      { label: "Spotify", href: spotifySearch("GYB Double G YAROU UH! BODY") },
      { label: "YouTube Music", href: youtubeMusicSearch("GYB Double G YAROU UH! BODY") }
    ]
  },
  "release-wonme": {
    kind: "release",
    title: "WONME",
    eyebrow: "28 nov 2025",
    small: "YAROU",
    description: "Сольный релиз YAROU. Отдельная точка входа в артиста и в связку с GYB.",
    meta: ["release", "single", "2025"],
    coverClass: "cover-art--wonme",
    links: [
      { label: "Apple Music", href: "https://music.apple.com/tr/song/1859245879?l=tr" },
      { label: "Spotify", href: spotifySearch("WONME YAROU") },
      { label: "YouTube Music", href: youtubeMusicSearch("WONME YAROU") }
    ]
  },
  "release-not-for-us": {
    kind: "release",
    title: "NOT FOR US",
    eyebrow: "26 dec 2025",
    small: "Double G / UH! BODY",
    description: "Связка Double G и UH! BODY после GYB. Темный, более плотный трек внутри той же линии релизов.",
    meta: ["release", "single", "2025"],
    coverClass: "cover-art--not-for-us",
    links: [
      { label: "Apple Music", href: "https://music.apple.com/ru/album/not-for-us-single/1864128486" },
      { label: "Spotify", href: spotifySearch("not for us Double G UH! BODY") },
      { label: "YouTube Music", href: youtubeMusicSearch("not for us Double G UH! BODY") }
    ]
  },
  "release-wow-wow": {
    kind: "release",
    title: "WOW WOW",
    eyebrow: "16 jan 2026",
    small: "Double G",
    description: "Сольный релиз Double G, который продолжает линию после not for us и закрывает этот текущий блок.",
    meta: ["release", "single", "2026"],
    coverClass: "cover-art--wow-wow",
    links: [
      { label: "Apple Music", href: appleSearch("WOW WOW Double G") },
      { label: "Spotify", href: spotifySearch("WOW WOW Double G") },
      { label: "YouTube Music", href: youtubeMusicSearch("WOW WOW Double G") }
    ]
  }
};

detailCatalog["artist-double-g"] = {
  ...detailCatalog["artist-double-g"],
  description: "Центральное имя в текущем срезе релизов. Через Double G собираются GYB, not for us и WOW WOW.",
  preview: ["artist", "3 releases"],
  meta: ["artist", "MOZHNO Sound", "Новороссийск"],
  links: [
    { label: "GYB", href: releaseLinks.gyb },
    { label: "NOT FOR US", href: releaseLinks.notForUs },
    { label: "WOW WOW", href: releaseLinks.wowWow }
  ]
};

detailCatalog["artist-yarou"] = {
  ...detailCatalog["artist-yarou"],
  description: "Отдельный артист в WONME и часть общей связки в GYB. Карточка собирает его сольный и совместный контекст.",
  preview: ["artist", "2 releases"],
  meta: ["artist", "single focus", "Новороссийск"],
  links: [
    { label: "WONME", href: releaseLinks.wonme },
    { label: "GYB", href: releaseLinks.gyb }
  ]
};

detailCatalog["artist-uh-body"] = {
  ...detailCatalog["artist-uh-body"],
  description: "Повторяющееся имя рядом с Double G: сначала GYB, потом not for us. Здесь собрана точка входа в связанные релизы.",
  preview: ["artist", "2 releases"],
  meta: ["artist", "roster", "Новороссийск"],
  links: [
    { label: "GYB", href: releaseLinks.gyb },
    { label: "NOT FOR US", href: releaseLinks.notForUs }
  ]
};

detailCatalog["release-gyb"] = {
  ...detailCatalog["release-gyb"],
  description: "Совместный релиз, который собирает Double G, YAROU и UH! BODY в одном плотном треке.",
  preview: ["release", "band.link"],
  links: [{ label: "listen", href: releaseLinks.gyb }]
};

detailCatalog["release-wonme"] = {
  ...detailCatalog["release-wonme"],
  description: "Сольный релиз YAROU. Отдельная точка входа в артиста и в связку с GYB.",
  preview: ["release", "band.link"],
  links: [{ label: "listen", href: releaseLinks.wonme }]
};

detailCatalog["release-not-for-us"] = {
  ...detailCatalog["release-not-for-us"],
  description: "Связка Double G и UH! BODY после GYB. Темный, более плотный трек внутри той же линии релизов.",
  preview: ["release", "band.link"],
  links: [{ label: "listen", href: releaseLinks.notForUs }]
};

detailCatalog["release-wow-wow"] = {
  ...detailCatalog["release-wow-wow"],
  description: "Сольный релиз Double G, который продолжает линию после not for us и закрывает текущий блок.",
  preview: ["release", "band.link"],
  links: [{ label: "listen", href: releaseLinks.wowWow }]
};

detailCatalog["release-vibekilla"] = {
  kind: "release",
  title: "VIBEKILLA",
  eyebrow: "new release",
  small: "MOZHNO Sound",
  description: "Новый релиз в потоке MOZHNO Sound. Карточка раскрывается прямо в ленте и показывает ссылку на прослушивание.",
  preview: ["release", "band.link"],
  meta: ["release", "single", "new"],
  coverClass: "cover-art--vibekilla",
  links: [{ label: "listen", href: releaseLinks.vibekilla }]
};

detailCatalog["release-lady"] = {
  kind: "release",
  title: "LADY",
  eyebrow: "new release",
  small: "MOZHNO Sound",
  description: "Релиз Lady добавлен в общий поток. В раскрытой карточке есть прямая плашка на страницу прослушивания.",
  preview: ["release", "union"],
  meta: ["release", "single", "new"],
  coverClass: "cover-art--lady",
  links: [{ label: "listen", href: releaseLinks.lady }]
};
const rosterPanelStates = artistPanelParts.map((parts, index) => ({
  ...parts,
  index,
  dragPointerId: null,
  dragging: false,
  suppressClick: false,
  dragStartX: 0,
  dragStartY: 0,
  dragTargetX: 0,
  dragTargetY: 0,
  dragTargetRotate: 0,
  dragX: 0,
  dragY: 0,
  dragRotate: 0,
  layoutX: 0,
  layoutY: 0,
  layoutScale: 1,
  layoutRotate: 0,
  layoutWidth: 0,
  layoutMinHeight: 0,
  layoutOpacity: 1
}));
const reelCardStates = reelCards.map((card) => ({
  card,
  pushX: 0,
  lift: 0,
  scale: 1,
  rotate: 0,
  opacity: 1
}));

const setupAntigravityBackground = () => {
  if (!(backgroundCanvas instanceof HTMLCanvasElement)) return () => {};

  const context = backgroundCanvas.getContext("2d");
  if (!context) return () => {};

  const config = {
    spacing: 58,
    flow: 5.5,
    cursorRadius: 126,
    cursorForce: 22,
    cursorSwirl: 9
  };
  const gridPoints = [];
  const pointerTarget = { x: 0.56, y: 0.46 };
  const pointer = { x: 0.56, y: 0.46 };
  const cursorTarget = { x: 0.56, y: 0.46 };
  const cursorField = { x: 0.56, y: 0.46, radius: config.cursorRadius };
  let width = 0;
  let height = 0;
  let minSide = 0;
  let dpr = 1;
  let frameId = 0;
  let pointerActive = false;

  const setCanvasSize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    minSide = Math.min(width, height);
    config.spacing = clamp(Math.round(minSide * 0.053), 46, 66);
    config.cursorRadius = clamp(minSide * 0.14, 96, 158);
    config.cursorForce = clamp(minSide * 0.022, 14, 30);
    config.cursorSwirl = clamp(minSide * 0.008, 5, 11);
    backgroundCanvas.width = Math.round(width * dpr);
    backgroundCanvas.height = Math.round(height * dpr);
    backgroundCanvas.style.width = `${width}px`;
    backgroundCanvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    cursorField.radius = config.cursorRadius;
  };

  const rebuildGrid = () => {
    gridPoints.length = 0;
    const spacingY = config.spacing * 0.88;
    const cols = Math.ceil(width / config.spacing) + 4;
    const rows = Math.ceil(height / spacingY) + 4;

    for (let row = -2; row < rows; row += 1) {
      const offsetX = row % 2 === 0 ? 0 : config.spacing * 0.5;

      for (let col = -2; col < cols; col += 1) {
        gridPoints.push({
          baseX: col * config.spacing + offsetX,
          baseY: row * spacingY,
          phase: Math.random() * Math.PI * 2,
          wobble: 0.7 + Math.random() * 0.6
        });
      }
    }
  };

  const drawDot = (x, y, size, alpha) => {
    context.globalAlpha = alpha;
    context.fillStyle = "#111115";
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  };

  const updateCursorOrb = () => {
    if (!cursorOrb) return;

    if (!finePointerQuery.matches) {
      cursorOrb.style.opacity = "0";
      document.body.classList.remove("has-custom-cursor");
      return;
    }

    document.body.classList.add("has-custom-cursor");
    cursorOrb.style.opacity = pointerActive ? "1" : "0.72";
    cursorOrb.style.transform = `translate3d(${snap(pointer.x * width)}px, ${snap(pointer.y * height)}px, 0) translate3d(-50%, -50%, 0) scale(${pointerActive ? 1 : 0.88})`;
    cursorOrb.style.width = `${snap(config.cursorRadius * 0.26)}px`;
    cursorOrb.style.height = `${snap(config.cursorRadius * 0.26)}px`;
  };

  const render = (time = 0) => {
    const t = time * 0.0008;
    const idleTargetX = 0.54 + Math.sin(t * 0.55) * 0.045 + Math.cos(t * 0.18) * 0.022;
    const idleTargetY = 0.48 + Math.cos(t * 0.44) * 0.038 + Math.sin(t * 0.24) * 0.02;
    const targetX = pointerActive ? pointerTarget.x : idleTargetX;
    const targetY = pointerActive ? pointerTarget.y : idleTargetY;

    pointer.x += (targetX - pointer.x) * (pointerActive ? 0.14 : 0.05);
    pointer.y += (targetY - pointer.y) * (pointerActive ? 0.14 : 0.05);
    cursorTarget.x = pointer.x;
    cursorTarget.y = pointer.y;
    cursorField.x += (cursorTarget.x - cursorField.x) * (pointerActive ? 0.11 : 0.045);
    cursorField.y += (cursorTarget.y - cursorField.y) * (pointerActive ? 0.11 : 0.045);

    context.clearRect(0, 0, width, height);
    const cursorCenterX = cursorField.x * width;
    const cursorCenterY = cursorField.y * height;
    const cursorRadius = config.cursorRadius * (1 + Math.sin(t * 1.8) * 0.05);

    gridPoints.forEach((point) => {
      const flowX =
        Math.sin(point.baseY * 0.008 + t * 0.92 + point.phase) * config.flow * point.wobble +
        Math.cos(point.baseX * 0.0046 + t * 0.33 + point.phase) * 2.4;
      const flowY =
        Math.cos(point.baseX * 0.0074 + t * 0.85 + point.phase) * config.flow * 0.72 * point.wobble +
        Math.sin(point.baseY * 0.0042 + t * 0.28 + point.phase) * 1.9;
      const baseX = point.baseX + flowX;
      const baseY = point.baseY + flowY;
      const dx = baseX - cursorCenterX;
      const dy = baseY - cursorCenterY;
      const dist = Math.hypot(dx, dy) || 1;
      const dirX = dx / dist;
      const dirY = dy / dist;
      const field = Math.exp(-(dist * dist) / (2 * cursorRadius * cursorRadius));
      const band = Math.exp(-((dist - cursorRadius * 0.58) ** 2) / (2 * (cursorRadius * 0.24) ** 2));
      const displacement = field * config.cursorForce + band * config.cursorForce * 0.6;
      const swirl = band * config.cursorSwirl * (pointerActive ? 1.2 : 0.8);
      const x = baseX + dirX * displacement - dirY * swirl;
      const y = baseY + dirY * displacement + dirX * swirl;
      const size = 1.05 + point.wobble * 0.28 + field * 1.15 + band * 0.35;
      const alpha = 0.2 + point.wobble * 0.08 + field * 0.34 + band * 0.08;

      drawDot(x, y, size, alpha);
    });

    context.globalAlpha = 1;
    context.strokeStyle = "rgba(17, 17, 21, 0.32)";
    context.lineWidth = 1.2;
    context.beginPath();
    context.arc(cursorCenterX, cursorCenterY, cursorRadius * 0.2, 0, Math.PI * 2);
    context.stroke();
    updateCursorOrb();
  };

  const animate = (time) => {
    render(time);
    if (!reducedMotionQuery.matches) {
      frameId = window.requestAnimationFrame(animate);
    }
  };

  const restart = () => {
    window.cancelAnimationFrame(frameId);
    setCanvasSize();
    rebuildGrid();
    render(0);
    if (!reducedMotionQuery.matches) {
      frameId = window.requestAnimationFrame(animate);
    }
  };

  const handlePointerMove = (event) => {
    const rect = backgroundCanvas.getBoundingClientRect();
    pointerActive = true;
    pointerTarget.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    pointerTarget.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
  };

  const handlePointerLeave = () => {
    pointerActive = false;
  };

  const handleMotionChange = () => {
    restart();
  };

  const handlePointerQueryChange = () => {
    updateCursorOrb();
  };

  restart();
  window.addEventListener("resize", restart);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerleave", handlePointerLeave);
  reducedMotionQuery.addEventListener("change", handleMotionChange);
  finePointerQuery.addEventListener("change", handlePointerQueryChange);

  return () => {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("resize", restart);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerleave", handlePointerLeave);
    reducedMotionQuery.removeEventListener("change", handleMotionChange);
    finePointerQuery.removeEventListener("change", handlePointerQueryChange);
  };
};

const cleanupBackground = setupAntigravityBackground();

const setupRosterInteractions = () => {
  if (!rosterPanelStates.length) return () => {};

  const canInteract = () => window.innerWidth > 1080 && finePointerQuery.matches;
  let activeState = null;

  const releaseState = (state) => {
    state.dragging = false;
    state.dragPointerId = null;
    state.dragTargetX = 0;
    state.dragTargetY = 0;
    state.dragTargetRotate = 0;
    state.panel.classList.remove("is-dragging");
    requestFrame();
  };

  const cleanupFns = rosterPanelStates.map((state) => {
    const handlePointerDown = (event) => {
      if (!canInteract()) return;
      if (event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("a, button")) return;

      event.preventDefault();
      activeState = state;
      state.dragging = true;
      state.dragPointerId = event.pointerId;
      state.suppressClick = false;
      state.dragStartX = event.clientX - state.dragTargetX;
      state.dragStartY = event.clientY - state.dragTargetY;
      state.panel.classList.add("is-dragging");
      requestFrame();
    };

    const handleClickCapture = (event) => {
      if (!state.suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      state.suppressClick = false;
    };

    state.panel.classList.add("is-draggable");
    state.panel.addEventListener("pointerdown", handlePointerDown);
    state.panel.addEventListener("click", handleClickCapture, true);

    return () => {
      state.panel.classList.remove("is-draggable", "is-dragging");
      state.panel.removeEventListener("pointerdown", handlePointerDown);
      state.panel.removeEventListener("click", handleClickCapture, true);
    };
  });

  const handlePointerMove = (event) => {
    if (!activeState || !activeState.dragging) return;

    const nextX = clamp(event.clientX - activeState.dragStartX, -260, 260);
    const nextY = clamp(event.clientY - activeState.dragStartY, -220, 220);

    if (Math.abs(nextX) > 6 || Math.abs(nextY) > 6) {
      activeState.suppressClick = true;
    }

    activeState.dragTargetX = nextX;
    activeState.dragTargetY = nextY;
    activeState.dragTargetRotate = clamp(nextX * 0.08, -14, 14);
    requestFrame();
  };

  const handlePointerUp = (event) => {
    if (!activeState || activeState.dragPointerId !== event.pointerId) return;
    const state = activeState;
    activeState = null;
    releaseState(state);
  };

  const handlePointerCancel = (event) => {
    if (!activeState || activeState.dragPointerId !== event.pointerId) return;
    const state = activeState;
    activeState = null;
    releaseState(state);
  };

  const handleResizeLike = () => {
    if (canInteract() && !activeState) return;
    activeState = null;
    rosterPanelStates.forEach((state) => releaseState(state));
  };

  window.addEventListener("blur", handleResizeLike);
  window.addEventListener("resize", handleResizeLike);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("pointercancel", handlePointerCancel);
  finePointerQuery.addEventListener("change", handleResizeLike);

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
    window.removeEventListener("blur", handleResizeLike);
    window.removeEventListener("resize", handleResizeLike);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
    finePointerQuery.removeEventListener("change", handleResizeLike);
  };
};

const cleanupRosterInteractions = setupRosterInteractions();

const setupDetailCards = () => {
  if (!detailCards.length) return () => {};

  const expandedCards = {
    artist: null,
    release: null
  };

  const renderPreviewPills = (container, item) => {
    if (!container) return;

    const previewItems = item.preview?.length ? item.preview : (item.meta?.slice(0, 2) ?? []);

    container.replaceChildren(
      ...previewItems.map((preview) => {
        const tag = document.createElement("span");
        tag.className = "listen-pill listen-pill--meta";
        tag.textContent = preview;
        return tag;
      })
    );
  };

  const buildDetailContent = (item) => {
    const detail = document.createElement("div");
    detail.className = "card-detail";

    const copy = document.createElement("div");
    copy.className = "card-detail__copy";

    const lead = document.createElement("p");
    lead.className = "card-detail__lead";
    lead.textContent = item.description;

    const meta = document.createElement("div");
    meta.className = "card-detail__meta";
    (item.meta ?? []).forEach((metaItem) => {
      const tag = document.createElement("span");
      tag.className = "listen-pill listen-pill--meta";
      tag.textContent = metaItem;
      meta.append(tag);
    });

    const links = document.createElement("div");
    links.className = "card-detail__links";
    (item.links ?? []).forEach((link) => {
      const anchor = document.createElement("a");
      anchor.className = "listen-pill listen-pill--plaque";
      anchor.href = link.href;
      anchor.textContent = link.label;
      links.append(anchor);
    });

    copy.append(lead, meta, links);
    detail.append(copy);

    return detail;
  };

  const syncExpandedFlags = () => {
    reelTrack?.classList.toggle("has-expanded", Boolean(expandedCards.release));
    rosterStack?.classList.toggle("has-expanded", Boolean(expandedCards.artist));
  };

  const collapseCard = (card) => {
    if (!card) return;
    card.classList.remove("is-expanded");
    card.setAttribute("aria-expanded", "false");
  };

  const setExpandedCard = (group, nextCard) => {
    if (expandedCards[group] && expandedCards[group] !== nextCard) {
      collapseCard(expandedCards[group]);
    }

    if (expandedCards[group] === nextCard) {
      collapseCard(nextCard);
      expandedCards[group] = null;
    } else {
      nextCard.classList.add("is-expanded");
      nextCard.setAttribute("aria-expanded", "true");
      expandedCards[group] = nextCard;
    }

    syncExpandedFlags();
    requestFrame();
  };

  const cleanupFns = detailCards.map((card) => {
    const detailId = card.dataset.detailId;
    const item = detailId ? detailCatalog[detailId] : null;
    const pillsContainer = card.querySelector("[data-listen-pills]");
    const host = card.classList.contains("artist-panel")
      ? card.querySelector(".artist-panel__body")
      : card;

    if (item && pillsContainer) {
      renderPreviewPills(pillsContainer, item);
    }

    if (item && host) {
      host.append(buildDetailContent(item));
    }

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");

    const group = card.classList.contains("artist-panel") ? "artist" : "release";

    const handleClick = (event) => {
      if (!item) return;
      if (event.target instanceof Element && event.target.closest("a")) return;
      setExpandedCard(group, card);
    };

    const handleKeyDown = (event) => {
      if (!item) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setExpandedCard(group, card);
    };

    card.addEventListener("click", handleClick);
    card.addEventListener("keydown", handleKeyDown);

    return () => {
      card.removeEventListener("click", handleClick);
      card.removeEventListener("keydown", handleKeyDown);
    };
  });

  const handleEscape = (event) => {
    if (event.key !== "Escape") return;

    collapseCard(expandedCards.artist);
    collapseCard(expandedCards.release);
    expandedCards.artist = null;
    expandedCards.release = null;
    syncExpandedFlags();
    requestFrame();
  };

  document.addEventListener("keydown", handleEscape);

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
    document.removeEventListener("keydown", handleEscape);
  };
};

const cleanupDetailCards = setupDetailCards();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const updateHeroStage = () => {
  if (!heroStage || !logoTop || !logoBottom) return;

  const progress = getStageProgress(heroStage);
  const split = clamp((progress - 0.16) / 0.32, 0, 1);
  const namesProgress = clamp((progress - 0.38) / 0.18, 0, 1);

  logoTop.style.transform = `translate3d(0, ${snap(-split * 164)}px, 0)`;
  logoBottom.style.transform = `translate3d(0, ${snap(split * 164)}px, 0)`;
  logoTop.style.letterSpacing = "0.02em";
  logoBottom.style.letterSpacing = "0.02em";

  nameItems.forEach((item, index) => {
    const local = clamp((namesProgress - index * 0.18) / 0.46, 0, 1);
    item.style.opacity = String(local);
    item.style.transform = `translate3d(0, ${snap((1 - local) * 26)}px, 0) scale(${0.96 + local * 0.04})`;
    item.style.letterSpacing = "0.08em";
  });

  heroTags.forEach((tag) => {
    const local = clamp((progress - 0.24) / 0.36, 0, 1);
    const isBottom = tag.classList.contains("hero-stage__tag--bottom");
    const y = snap(isBottom ? local * 20 : -local * 14);

    tag.style.transform = isBottom
      ? `translate3d(-50%, ${y}px, 0)`
      : `translate3d(0, ${y}px, 0)`;
    tag.style.opacity = String(0.45 + local * 0.55);
  });
};

const updateRosterStage = () => {
  if (!rosterStage || !rosterStack || !rosterPanelStates.length) return false;

  if (window.innerWidth <= 1080) {
    rosterPanelStates.forEach((state) => {
      const { panel, indexLabel, cover, body } = state;
      panel.style.transform = "";
      panel.style.opacity = "";
      panel.style.zIndex = "";
      panel.style.width = "";
      panel.style.minHeight = "";
      panel.classList.remove("is-ready");

      if (indexLabel) indexLabel.style.opacity = "";
      if (cover) {
        cover.style.opacity = "";
        cover.style.transform = "";
      }
      if (body) {
        body.style.opacity = "";
        body.style.transform = "";
      }

      state.layoutX = 0;
      state.layoutY = 0;
      state.layoutScale = 1;
      state.layoutRotate = 0;
      state.layoutWidth = 0;
      state.layoutMinHeight = 0;
      state.layoutOpacity = 1;
    });
    return false;
  }

  const progress = getStageProgress(rosterStage);
  const time = performance.now() * 0.001;
  let needsAnotherFrame = false;
  const stackWidth = rosterStack.clientWidth;
  const basePanelWidth = Math.min(stackWidth * 0.315, 360);
  const remaining = Math.max(stackWidth - basePanelWidth * 3, 48);
  const gap = remaining / 2;
  const expandedIndex = rosterPanelStates.findIndex(({ panel }) => panel.classList.contains("is-expanded"));
  let layouts = [
    { x: 0, y: 84, rotate: -7, scale: 0.94, prominence: 0.88, phase: 0.2, z: 2, width: basePanelWidth },
    { x: basePanelWidth + gap, y: 0, rotate: -1, scale: 1, prominence: 1, phase: 1.6, z: 4, width: basePanelWidth },
    { x: basePanelWidth * 2 + gap * 2, y: 98, rotate: 7, scale: 0.92, prominence: 0.9, phase: 2.9, z: 3, width: basePanelWidth }
  ];

  if (expandedIndex !== -1) {
    const expandedWidth = clamp(stackWidth * 0.44, 420, 560);
    const sideWidth = clamp((stackWidth - expandedWidth - 88) / 2, 220, 300);

    if (expandedIndex === 0) {
      layouts = [
        { x: 0, y: 18, rotate: -3, scale: 1.02, prominence: 1.08, phase: 0.2, z: 5, width: expandedWidth },
        { x: expandedWidth + 28, y: 102, rotate: -2, scale: 0.88, prominence: 0.78, phase: 1.6, z: 3, width: sideWidth },
        { x: stackWidth - sideWidth, y: 128, rotate: 8, scale: 0.86, prominence: 0.74, phase: 2.9, z: 2, width: sideWidth }
      ];
    } else if (expandedIndex === 1) {
      layouts = [
        { x: 0, y: 118, rotate: -9, scale: 0.84, prominence: 0.72, phase: 0.2, z: 2, width: sideWidth },
        { x: (stackWidth - expandedWidth) / 2, y: 0, rotate: -1, scale: 1.02, prominence: 1.08, phase: 1.6, z: 5, width: expandedWidth },
        { x: stackWidth - sideWidth, y: 126, rotate: 9, scale: 0.84, prominence: 0.72, phase: 2.9, z: 2, width: sideWidth }
      ];
    } else if (expandedIndex === 2) {
      layouts = [
        { x: 0, y: 126, rotate: -8, scale: 0.86, prominence: 0.74, phase: 0.2, z: 2, width: sideWidth },
        { x: sideWidth + 28, y: 100, rotate: 2, scale: 0.88, prominence: 0.78, phase: 1.6, z: 3, width: sideWidth },
        { x: stackWidth - expandedWidth, y: 18, rotate: 3, scale: 1.02, prominence: 1.08, phase: 2.9, z: 5, width: expandedWidth }
      ];
    }
  }

  rosterPanelStates.forEach((state, index) => {
    const { panel, indexLabel, cover, body } = state;
    const layout = layouts[index] ?? layouts[layouts.length - 1];
    const isExpanded = panel.classList.contains("is-expanded");
    const introStart = 0.04 + index * 0.1;
    const introEnd = introStart + 0.32;
    const intro = reducedMotionQuery.matches
      ? 1
      : easeOutCubic(clamp((progress - introStart) / (introEnd - introStart), 0, 1));
    const floatX = Math.cos(time * 1.22 + layout.phase) * 11;
    const floatY = Math.sin(time * 1.35 + layout.phase) * 15;
    const floatRotate = Math.sin(time * 0.96 + layout.phase) * 1.8;
    const finalX = layout.x + floatX;
    const finalY = layout.y + floatY;
    const finalScale = layout.scale + Math.sin(time * 0.84 + layout.phase) * 0.012;
    const finalRotate = layout.rotate + floatRotate;
    const startX = finalX + (index === 1 ? 0 : index === 0 ? -260 : 260);
    const startY = finalY + 240 + index * 24;
    const startScale = 0.62;
    const startRotate = finalRotate + (index === 1 ? -14 : index === 0 ? -24 : 24);
    const targetX = startX + (finalX - startX) * intro;
    const targetY = startY + (finalY - startY) * intro;
    const targetScale = startScale + (finalScale - startScale) * intro;
    const targetRotate = startRotate + (finalRotate - startRotate) * intro;
    const prominence = layout.prominence;
    const lift = state.dragging ? 34 : Math.abs(state.dragY) * 0.06 + Math.abs(state.dragX) * 0.025;
    const targetMinHeight = isExpanded ? Math.min(window.innerHeight * 0.78, 720) : Math.min(window.innerHeight * 0.62, 540);
    const targetOpacity = 0.2 + intro * 0.8;

    state.dragX += (state.dragTargetX - state.dragX) * (state.dragging ? 0.28 : 0.12);
    state.dragY += (state.dragTargetY - state.dragY) * (state.dragging ? 0.28 : 0.12);
    state.dragRotate += (state.dragTargetRotate - state.dragRotate) * (state.dragging ? 0.24 : 0.1);
    state.layoutX += (targetX - state.layoutX) * 0.14;
    state.layoutY += (targetY - state.layoutY) * 0.14;
    state.layoutScale += (targetScale - state.layoutScale) * 0.14;
    state.layoutRotate += (targetRotate - state.layoutRotate) * 0.14;
    state.layoutWidth += (layout.width - state.layoutWidth) * 0.16;
    state.layoutMinHeight += (targetMinHeight - state.layoutMinHeight) * 0.16;
    state.layoutOpacity += (targetOpacity - state.layoutOpacity) * 0.16;

    if (
      progress > 0.01 && progress < 0.94 ||
      intro < 0.999 ||
      state.dragging ||
      Math.abs(state.dragX - state.dragTargetX) > 0.2 ||
      Math.abs(state.dragY - state.dragTargetY) > 0.2 ||
      Math.abs(state.dragRotate - state.dragTargetRotate) > 0.08 ||
      Math.abs(state.layoutX - targetX) > 0.35 ||
      Math.abs(state.layoutY - targetY) > 0.35 ||
      Math.abs(state.layoutScale - targetScale) > 0.003 ||
      Math.abs(state.layoutRotate - targetRotate) > 0.05 ||
      Math.abs(state.layoutWidth - layout.width) > 0.5 ||
      Math.abs(state.layoutMinHeight - targetMinHeight) > 0.6 ||
      Math.abs(state.layoutOpacity - targetOpacity) > 0.01
    ) {
      needsAnotherFrame = true;
    }

    panel.style.width = `${snap(state.layoutWidth)}px`;
    panel.style.minHeight = `${snap(state.layoutMinHeight)}px`;
    panel.style.transform = `translate3d(${snap(state.layoutX + state.dragX)}px, ${snap(state.layoutY + state.dragY - lift)}px, ${state.dragging ? 84 : 0}px) scale(${state.layoutScale + (state.dragging ? 0.03 : 0)}) rotate(${state.layoutRotate + state.dragRotate}deg)`;
    panel.style.opacity = String(state.layoutOpacity);
    panel.style.zIndex = String(layout.z + (state.dragging ? 10 : 0));
    panel.classList.toggle("is-ready", intro > 0.98);

    if (indexLabel) {
      indexLabel.style.opacity = String((0.1 + prominence * 0.62) * intro);
    }

    if (cover) {
      const coverLift = (1 - intro) * 44 + Math.sin(time * 1.3 + layout.phase) * 6;
      cover.style.opacity = String((0.2 + prominence * 0.8 + (isExpanded ? 0.08 : 0)) * intro);
      cover.style.transform = `translate3d(0, ${snap(coverLift)}px, 0) scale(${0.88 + prominence * 0.12 * intro + (isExpanded ? 0.02 : 0)})`;
    }

    if (body) {
      const bodyLift = (1 - intro) * 54 + Math.cos(time * 1.08 + layout.phase) * 8;
      body.style.opacity = String((0.16 + prominence * 0.84 + (isExpanded ? 0.08 : 0)) * intro);
      body.style.transform = `translate3d(0, ${snap(bodyLift)}px, 0)`;
    }
  });

  return needsAnotherFrame;
};

const updateReel = () => {
  if (!reelSection || !reelTrack || !reelCards.length || window.innerWidth <= 1080) return false;

  const progress = getStageProgress(reelSection);
  const focusIndex = progress * (reelCards.length - 1);
  const expandedIndex = reelCards.findIndex((card) => card.classList.contains("is-expanded"));
  const travel = Math.max(34, (reelCards.length - 2) * 10);
  let needsAnotherFrame = false;

  reelTrack.style.transform = `translate3d(${-progress * travel}%, 0, 0)`;

  reelCards.forEach((card, index) => {
    const state = reelCardStates[index];
    const isExpanded = card.classList.contains("is-expanded");
    const distance = Math.abs(focusIndex - index);
    let focus = clamp(1 - distance * 0.26, 0.9, 1);
    let lift = (focus - 0.9) * 140;
    let tilt = (index - focusIndex) * 2.2;
    let pushX = 0;

    if (expandedIndex !== -1) {
      const offsetFromExpanded = index - expandedIndex;
      const distanceFromExpanded = Math.abs(offsetFromExpanded);

      if (isExpanded) {
        focus = 1.03;
        lift += 28;
        tilt *= 0.2;
      } else {
        focus = Math.max(0.89, focus - 0.045);
        lift = Math.max(-12, lift - 6);
        tilt += offsetFromExpanded * 0.8;
        pushX = (offsetFromExpanded < 0 ? -1 : 1) * (72 + Math.max(0, 2 - distanceFromExpanded) * 22);
      }
    }

    state.pushX += (pushX - state.pushX) * 0.14;
    state.lift += (lift - state.lift) * 0.14;
    state.scale += (focus - state.scale) * 0.14;
    state.rotate += (tilt - state.rotate) * 0.14;
    state.opacity += (clamp(0.56 + (focus - 0.88) * 2.8, 0.52, 1) - state.opacity) * 0.16;

    if (
      Math.abs(state.pushX - pushX) > 0.4 ||
      Math.abs(state.lift - lift) > 0.5 ||
      Math.abs(state.scale - focus) > 0.004 ||
      Math.abs(state.rotate - tilt) > 0.05 ||
      Math.abs(state.opacity - clamp(0.56 + (focus - 0.88) * 2.8, 0.52, 1)) > 0.01
    ) {
      needsAnotherFrame = true;
    }

    card.style.transform = `translate3d(${snap(state.pushX)}px, ${snap(-state.lift)}px, 0) scale(${state.scale}) rotate(${state.rotate}deg)`;
    card.style.opacity = String(state.opacity);
    card.style.zIndex = String(isExpanded ? 180 : Math.round(focus * 100));
  });

  return needsAnotherFrame;
};

let ticking = false;

const updateMotion = () => {
  updateHeroStage();
  const rosterNeedsFrame = updateRosterStage();
  const reelNeedsFrame = updateReel();
  ticking = false;

  if (rosterNeedsFrame || reelNeedsFrame) {
    requestFrame();
  }
};

const requestFrame = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateMotion);
};

window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame);
window.addEventListener("pageshow", () => {
  if (!location.hash || location.hash === "#top") {
    window.scrollTo(0, 0);
    requestFrame();
  }
});

window.addEventListener("beforeunload", () => {
  cleanupBackground();
  cleanupRosterInteractions();
  cleanupDetailCards();
});

updateMotion();
