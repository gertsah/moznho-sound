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
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
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
  dragRotate: 0
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

      state.dragging = true;
      state.dragPointerId = event.pointerId;
      state.suppressClick = false;
      state.dragStartX = event.clientX - state.dragTargetX;
      state.dragStartY = event.clientY - state.dragTargetY;
      state.panel.classList.add("is-dragging");
      state.panel.setPointerCapture(event.pointerId);
      requestFrame();
    };

    const handlePointerMove = (event) => {
      if (!state.dragging || state.dragPointerId !== event.pointerId) return;

      const nextX = clamp(event.clientX - state.dragStartX, -220, 220);
      const nextY = clamp(event.clientY - state.dragStartY, -180, 180);

      if (Math.abs(nextX) > 6 || Math.abs(nextY) > 6) {
        state.suppressClick = true;
      }

      state.dragTargetX = nextX;
      state.dragTargetY = nextY;
      state.dragTargetRotate = clamp(nextX * 0.06, -10, 10);
      requestFrame();
    };

    const handlePointerUp = (event) => {
      if (state.dragPointerId !== event.pointerId) return;
      releaseState(state);
    };

    const handlePointerCancel = (event) => {
      if (state.dragPointerId !== event.pointerId) return;
      releaseState(state);
    };

    const handleClickCapture = (event) => {
      if (!state.suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      state.suppressClick = false;
    };

    state.panel.classList.add("is-draggable");
    state.panel.addEventListener("pointerdown", handlePointerDown);
    state.panel.addEventListener("pointermove", handlePointerMove);
    state.panel.addEventListener("pointerup", handlePointerUp);
    state.panel.addEventListener("pointercancel", handlePointerCancel);
    state.panel.addEventListener("lostpointercapture", handlePointerCancel);
    state.panel.addEventListener("click", handleClickCapture, true);

    return () => {
      state.panel.classList.remove("is-draggable", "is-dragging");
      state.panel.removeEventListener("pointerdown", handlePointerDown);
      state.panel.removeEventListener("pointermove", handlePointerMove);
      state.panel.removeEventListener("pointerup", handlePointerUp);
      state.panel.removeEventListener("pointercancel", handlePointerCancel);
      state.panel.removeEventListener("lostpointercapture", handlePointerCancel);
      state.panel.removeEventListener("click", handleClickCapture, true);
    };
  });

  const handleResizeLike = () => {
    if (canInteract()) return;
    rosterPanelStates.forEach((state) => releaseState(state));
  };

  window.addEventListener("blur", handleResizeLike);
  window.addEventListener("resize", handleResizeLike);
  finePointerQuery.addEventListener("change", handleResizeLike);

  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
    window.removeEventListener("blur", handleResizeLike);
    window.removeEventListener("resize", handleResizeLike);
    finePointerQuery.removeEventListener("change", handleResizeLike);
  };
};

const cleanupRosterInteractions = setupRosterInteractions();

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
    });
    return false;
  }

  const progress = getStageProgress(rosterStage);
  const time = performance.now() * 0.001;
  let needsAnotherFrame = false;
  const stackWidth = rosterStack.clientWidth;
  const panelWidth = Math.min(stackWidth * 0.315, 360);
  const remaining = Math.max(stackWidth - panelWidth * 3, 48);
  const gap = remaining / 2;
  const layouts = [
    { x: 0, y: 84, rotate: -7, scale: 0.94, prominence: 0.88, phase: 0.2, z: 2 },
    { x: panelWidth + gap, y: 0, rotate: -1, scale: 1, prominence: 1, phase: 1.6, z: 4 },
    { x: panelWidth * 2 + gap * 2, y: 98, rotate: 7, scale: 0.92, prominence: 0.9, phase: 2.9, z: 3 }
  ];

  rosterPanelStates.forEach((state, index) => {
    const { panel, indexLabel, cover, body } = state;
    const layout = layouts[index] ?? layouts[layouts.length - 1];
    const introStart = 0.08 + index * 0.08;
    const introEnd = introStart + 0.26;
    const intro = reducedMotionQuery.matches
      ? 1
      : easeOutCubic(clamp((progress - introStart) / (introEnd - introStart), 0, 1));
    const floatX = Math.cos(time * 1.1 + layout.phase) * 8;
    const floatY = Math.sin(time * 1.24 + layout.phase) * 12;
    const floatRotate = Math.sin(time * 0.9 + layout.phase) * 1.4;
    const finalX = layout.x + floatX;
    const finalY = layout.y + floatY;
    const finalScale = layout.scale + Math.sin(time * 0.84 + layout.phase) * 0.012;
    const finalRotate = layout.rotate + floatRotate;
    const startX = finalX + (index === 1 ? 0 : index === 0 ? -180 : 180);
    const startY = finalY + 180 + index * 16;
    const startScale = 0.78;
    const startRotate = finalRotate + (index === 1 ? -8 : index === 0 ? -16 : 16);
    const x = startX + (finalX - startX) * intro;
    const y = startY + (finalY - startY) * intro;
    const scale = startScale + (finalScale - startScale) * intro;
    const rotate = startRotate + (finalRotate - startRotate) * intro;
    const prominence = layout.prominence;
    const lift = state.dragging ? 34 : Math.abs(state.dragY) * 0.06 + Math.abs(state.dragX) * 0.025;

    state.dragX += (state.dragTargetX - state.dragX) * (state.dragging ? 0.28 : 0.12);
    state.dragY += (state.dragTargetY - state.dragY) * (state.dragging ? 0.28 : 0.12);
    state.dragRotate += (state.dragTargetRotate - state.dragRotate) * (state.dragging ? 0.24 : 0.1);

    if (
      state.dragging ||
      Math.abs(state.dragX - state.dragTargetX) > 0.2 ||
      Math.abs(state.dragY - state.dragTargetY) > 0.2 ||
      Math.abs(state.dragRotate - state.dragTargetRotate) > 0.08
    ) {
      needsAnotherFrame = true;
    }

    panel.style.width = `${panelWidth}px`;
    panel.style.transform = `translate3d(${snap(x + state.dragX)}px, ${snap(y + state.dragY - lift)}px, ${state.dragging ? 84 : 0}px) scale(${scale + (state.dragging ? 0.03 : 0)}) rotate(${rotate + state.dragRotate}deg)`;
    panel.style.opacity = String(0.2 + intro * 0.8);
    panel.style.zIndex = String(layout.z + (state.dragging ? 10 : 0));
    panel.classList.toggle("is-ready", intro > 0.98);

    if (indexLabel) {
      indexLabel.style.opacity = String((0.1 + prominence * 0.62) * intro);
    }

    if (cover) {
      const coverLift = (1 - intro) * 44 + Math.sin(time * 1.3 + layout.phase) * 6;
      cover.style.opacity = String((0.2 + prominence * 0.8) * intro);
      cover.style.transform = `translate3d(0, ${snap(coverLift)}px, 0) scale(${0.88 + prominence * 0.12 * intro})`;
    }

    if (body) {
      const bodyLift = (1 - intro) * 54 + Math.cos(time * 1.08 + layout.phase) * 8;
      body.style.opacity = String((0.16 + prominence * 0.84) * intro);
      body.style.transform = `translate3d(0, ${snap(bodyLift)}px, 0)`;
    }
  });

  return needsAnotherFrame;
};

const updateReel = () => {
  if (!reelSection || !reelTrack || !reelCards.length || window.innerWidth <= 1080) return;

  const progress = getStageProgress(reelSection);

  reelTrack.style.transform = `translate3d(${-progress * 34}%, 0, 0)`;

  reelCards.forEach((card, index) => {
    const focus = clamp(1 - Math.abs(progress * (reelCards.length - 1) - index) * 0.26, 0.9, 1);
    const lift = (focus - 0.9) * 140;
    const tilt = (index - progress * (reelCards.length - 1)) * 2.2;

    card.style.transform = `translate3d(0, ${-lift}px, 0) scale(${focus}) rotate(${tilt}deg)`;
    card.style.opacity = String(clamp(0.56 + (focus - 0.9) * 4.2, 0.56, 1));
    card.style.zIndex = String(Math.round(focus * 100));
  });
};

let ticking = false;

const updateMotion = () => {
  updateHeroStage();
  const rosterNeedsFrame = updateRosterStage();
  updateReel();
  ticking = false;

  if (rosterNeedsFrame) {
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
});

updateMotion();
