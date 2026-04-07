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
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const setupAntigravityBackground = () => {
  if (!(backgroundCanvas instanceof HTMLCanvasElement)) return () => {};

  const context = backgroundCanvas.getContext("2d");
  if (!context) return () => {};

  const TAU = Math.PI * 2;
  const config = {
    density: 200,
    particlesScale: 0.75,
    ringWidth: 0.15,
    ringWidth2: 0.05,
    ringDisplacement: 0.15
  };
  const palette = ["#ffcf03", "#ff9d1f", "#f84242", "#8a56d8", "#2c64ed"];
  const emitters = [
    { x: 0.56, y: 0.42, radiusStart: 0.025, radiusStep: 0.037, rings: 12, countStart: 8, countStep: 6, driftX: 0.012, driftY: 0.01, spin: 0.085, pointerX: 0.018, pointerY: 0.018, phase: 0.2, intensity: 1 },
    { x: 0.79, y: 0.26, radiusStart: 0.022, radiusStep: 0.035, rings: 10, countStart: 8, countStep: 5, driftX: 0.009, driftY: 0.008, spin: -0.078, pointerX: 0.014, pointerY: 0.015, phase: 1.2, intensity: 0.88 },
    { x: 0.35, y: 0.78, radiusStart: 0.024, radiusStep: 0.038, rings: 11, countStart: 8, countStep: 6, driftX: 0.011, driftY: 0.009, spin: 0.072, pointerX: 0.015, pointerY: 0.016, phase: 2.1, intensity: 0.94 },
    { x: 0.84, y: 0.82, radiusStart: 0.02, radiusStep: 0.036, rings: 9, countStart: 7, countStep: 5, driftX: 0.008, driftY: 0.008, spin: -0.068, pointerX: 0.012, pointerY: 0.014, phase: 3.1, intensity: 0.8 }
  ];
  const particles = emitters.flatMap((emitter, emitterIndex) =>
    Array.from({ length: emitter.rings }, (_, ringIndex) => {
      const ringRatio = ringIndex / Math.max(emitter.rings - 1, 1);
      const radius = emitter.radiusStart + ringIndex * emitter.radiusStep;
      const count = emitter.countStart + ringIndex * emitter.countStep;

      return Array.from({ length: count }, (_, particleIndex) => ({
        emitter,
        emitterIndex,
        ringRatio,
        radius,
        baseAngle: (particleIndex / count) * TAU + ringIndex * 0.045 + emitterIndex * 0.32,
        colorOffset: ((particleIndex / count) + ringIndex * 0.065 + emitterIndex * 0.18) % 1,
        length: (2.8 + ringRatio * 6.5 + (particleIndex % 4) * 0.35) * config.particlesScale,
        thickness: 0.9 + ringRatio * 1.55,
        alpha: (0.16 + ringRatio * 0.54) * emitter.intensity,
        phase: emitter.phase + particleIndex * 0.11 + ringIndex * 0.28
      }));
    }).flat()
  );
  const specks = Array.from({ length: 240 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: 0.45 + Math.random() * 0.85,
    alpha: 0.035 + Math.random() * 0.09
  }));
  const pointerTarget = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  let width = 0;
  let height = 0;
  let minSide = 0;
  let dpr = 1;
  let frameId = 0;

  const mixColor = (a, b, ratio) => {
    const from = Number.parseInt(a.slice(1), 16);
    const to = Number.parseInt(b.slice(1), 16);
    const red = Math.round(((from >> 16) & 255) + (((to >> 16) & 255) - ((from >> 16) & 255)) * ratio);
    const green = Math.round(((from >> 8) & 255) + (((to >> 8) & 255) - ((from >> 8) & 255)) * ratio);
    const blue = Math.round((from & 255) + ((to & 255) - (from & 255)) * ratio);
    return `rgb(${red} ${green} ${blue})`;
  };

  const samplePalette = (value) => {
    const wrapped = ((value % 1) + 1) % 1;
    const scaled = wrapped * palette.length;
    const index = Math.floor(scaled) % palette.length;
    const nextIndex = (index + 1) % palette.length;
    return mixColor(palette[index], palette[nextIndex], scaled - index);
  };

  const setCanvasSize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    minSide = Math.min(width, height);
    backgroundCanvas.width = Math.round(width * dpr);
    backgroundCanvas.height = Math.round(height * dpr);
    backgroundCanvas.style.width = `${width}px`;
    backgroundCanvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawDash = (x, y, length, thickness, angle, color, alpha) => {
    const radius = thickness / 2;
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(-length / 2, -thickness / 2, length, thickness, radius);
    context.fill();
    context.restore();
  };

  const drawSpecks = () => {
    specks.forEach((speck) => {
      context.globalAlpha = speck.alpha;
      context.fillStyle = "#111115";
      context.fillRect(speck.x * width, speck.y * height, speck.size, speck.size);
    });
  };

  const render = (time = 0) => {
    const t = time * 0.00024;
    pointer.x += (pointerTarget.x - pointer.x) * 0.05;
    pointer.y += (pointerTarget.y - pointer.y) * 0.05;

    context.clearRect(0, 0, width, height);
    drawSpecks();

    particles.forEach((particle) => {
      const { emitter } = particle;
      const driftX =
        Math.sin(t * 0.55 + particle.phase) * emitter.driftX +
        Math.cos(t * 0.23 + particle.phase * 0.6) * config.ringDisplacement * 0.012 +
        pointer.x * emitter.pointerX;
      const driftY =
        Math.cos(t * 0.48 + particle.phase * 0.9) * emitter.driftY +
        Math.sin(t * 0.2 + particle.phase * 0.7) * config.ringDisplacement * 0.009 +
        pointer.y * emitter.pointerY;
      const centerX = (emitter.x + driftX) * width;
      const centerY = (emitter.y + driftY) * height;
      const angle = particle.baseAngle + t * emitter.spin;
      const radius =
        minSide *
        particle.radius *
        (1 + Math.sin(t * 1.2 + particle.phase) * config.ringWidth2 * 0.8);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const tangentAngle = angle + Math.PI / 2;
      const length = particle.length + Math.sin(t * 1.15 + particle.phase) * config.ringWidth * 2.8;
      const thickness = particle.thickness + Math.cos(t * 1.1 + particle.phase) * config.ringWidth2 * 0.8;
      const alpha = particle.alpha * (0.9 + Math.sin(t * 0.95 + particle.phase) * 0.1);
      const color = samplePalette(particle.colorOffset + t * 0.015);

      drawDash(x, y, length, thickness, tangentAngle, color, alpha);
    });

    context.globalAlpha = 1;
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
    render(0);
    if (!reducedMotionQuery.matches) {
      frameId = window.requestAnimationFrame(animate);
    }
  };

  const handlePointerMove = (event) => {
    pointerTarget.x = event.clientX / window.innerWidth - 0.5;
    pointerTarget.y = event.clientY / window.innerHeight - 0.5;
  };

  const handlePointerLeave = () => {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
  };

  const handleMotionChange = () => {
    restart();
  };

  restart();
  window.addEventListener("resize", restart);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerleave", handlePointerLeave);
  reducedMotionQuery.addEventListener("change", handleMotionChange);

  return () => {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("resize", restart);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerleave", handlePointerLeave);
    reducedMotionQuery.removeEventListener("change", handleMotionChange);
  };
};

const cleanupBackground = setupAntigravityBackground();

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
  if (!rosterStage || !rosterStack || !artistPanelParts.length) return;

  if (window.innerWidth <= 1080) {
    artistPanelParts.forEach(({ panel, indexLabel, cover, body }) => {
      panel.style.transform = "";
      panel.style.opacity = "";
      panel.style.zIndex = "";

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
    return;
  }

  const progress = getStageProgress(rosterStage);
  const wave = progress * Math.PI * 2.6;
  const stackWidth = rosterStack.clientWidth;
  const panelWidth = Math.min(stackWidth * 0.315, 360);
  const remaining = Math.max(stackWidth - panelWidth * 3, 48);
  const gap = remaining / 2;
  const layouts = [
    { x: 0, y: 84, rotate: -7, scale: 0.94, prominence: 0.88, phase: 0.2, z: 2 },
    { x: panelWidth + gap, y: 0, rotate: -1, scale: 1, prominence: 1, phase: 1.6, z: 4 },
    { x: panelWidth * 2 + gap * 2, y: 98, rotate: 7, scale: 0.92, prominence: 0.9, phase: 2.9, z: 3 }
  ];

  artistPanelParts.forEach(({ panel, indexLabel, cover, body }, index) => {
    const layout = layouts[index] ?? layouts[layouts.length - 1];
    const driftX = Math.cos(wave + layout.phase) * 12;
    const driftY = Math.sin(wave * 1.12 + layout.phase) * 18;
    const scale = layout.scale + Math.sin(wave * 0.82 + layout.phase) * 0.02;
    const rotate = layout.rotate + Math.sin(wave + layout.phase) * 1.6;
    const coverLift = Math.sin(wave * 1.3 + layout.phase) * 6;
    const bodyLift = Math.cos(wave * 1.1 + layout.phase) * 8;
    const prominence = layout.prominence;

    panel.style.width = `${panelWidth}px`;
    panel.style.transform = `translate3d(${snap(layout.x + driftX)}px, ${snap(layout.y + driftY)}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    panel.style.opacity = "1";
    panel.style.zIndex = String(layout.z);

    if (indexLabel) {
      indexLabel.style.opacity = String(0.34 + prominence * 0.66);
    }

    if (cover) {
      cover.style.opacity = String(0.64 + prominence * 0.36);
      cover.style.transform = `translate3d(0, ${snap(coverLift)}px, 0) scale(${0.92 + prominence * 0.08})`;
    }

    if (body) {
      body.style.opacity = String(0.42 + prominence * 0.58);
      body.style.transform = `translate3d(0, ${snap(bodyLift)}px, 0)`;
    }
  });
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
  updateRosterStage();
  updateReel();
  ticking = false;
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
  cleanupLavaLamp();
});

updateMotion();
