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
const lavaLayer = document.querySelector("[data-lava-layer]");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const setupLavaLamp = () => {
  if (!lavaLayer) return () => {};

  const TAU = Math.PI * 2;
  const emitters = [
    { centerX: 0.54, centerY: 0.3, rings: 6, radiusStart: 0.08, radiusStep: 0.06, dotsStart: 8, dotsStep: 4, driftX: 0.018, driftY: 0.014, spin: 0.075, phase: 0.2 },
    { centerX: 0.3, centerY: 0.78, rings: 6, radiusStart: 0.08, radiusStep: 0.065, dotsStart: 8, dotsStep: 4, driftX: 0.02, driftY: 0.016, spin: -0.07, phase: 1.1 },
    { centerX: 0.78, centerY: 0.74, rings: 6, radiusStart: 0.08, radiusStep: 0.065, dotsStart: 8, dotsStep: 4, driftX: 0.018, driftY: 0.015, spin: 0.08, phase: 2.4 },
    { centerX: 0.82, centerY: 0.22, rings: 5, radiusStart: 0.08, radiusStep: 0.06, dotsStart: 7, dotsStep: 4, driftX: 0.014, driftY: 0.012, spin: -0.06, phase: 3.3 }
  ];

  const configs = emitters.flatMap((emitter, emitterIndex) =>
    Array.from({ length: emitter.rings }, (_, ringIndex) => {
      const radius = emitter.radiusStart + ringIndex * emitter.radiusStep;
      const count = emitter.dotsStart + ringIndex * emitter.dotsStep;

      return Array.from({ length: count }, (_, dotIndex) => {
        const ringRatio = ringIndex / Math.max(emitter.rings - 1, 1);
        const offset = (dotIndex / count) * TAU;

        return {
          centerX: emitter.centerX,
          centerY: emitter.centerY,
          radius,
          baseAngle: offset + emitterIndex * 0.22 + ringIndex * 0.08,
          size: 0.0034 + ringRatio * 0.0034 + (dotIndex % 3) * 0.00025,
          opacity: 0.34 + ringRatio * 0.28,
          driftX: emitter.driftX,
          driftY: emitter.driftY,
          spin: emitter.spin * (0.55 + ringRatio * 0.45),
          pulse: 0.015 + ringRatio * 0.012,
          phase: emitter.phase + dotIndex * 0.18 + ringIndex * 0.32
        };
      });
    }).flat()
  );

  lavaLayer.replaceChildren();

  const blobs = configs.map((config) => {
    const node = document.createElement("span");
    node.className = "bg-shader__blob";
    lavaLayer.append(node);
    return { ...config, node };
  });

  let frameId = 0;

  const renderLava = (time = 0) => {
    const t = time * 0.00022;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const minSide = Math.min(width, height);

    blobs.forEach((blob) => {
      const size = minSide * blob.size;
      const centerX = width * blob.centerX + Math.sin(t * 1.7 + blob.phase) * width * blob.driftX;
      const centerY = height * blob.centerY + Math.cos(t * 1.4 + blob.phase * 0.9) * height * blob.driftY;
      const angle = blob.baseAngle + t * blob.spin;
      const radius = minSide * blob.radius * (1 + Math.sin(t * 2.1 + blob.phase) * blob.pulse);
      const scale = 0.92 + Math.cos(t * 2.4 + blob.phase) * 0.08;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      blob.node.style.width = `${size}px`;
      blob.node.style.height = `${size}px`;
      blob.node.style.opacity = String(blob.opacity);
      blob.node.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) scale(${scale})`;
    });
  };

  const animateLava = (time) => {
    renderLava(time);
    if (!reducedMotionQuery.matches) {
      frameId = window.requestAnimationFrame(animateLava);
    }
  };

  const restartLava = () => {
    window.cancelAnimationFrame(frameId);
    renderLava(0);
    if (!reducedMotionQuery.matches) {
      frameId = window.requestAnimationFrame(animateLava);
    }
  };

  const handleMotionChange = () => {
    restartLava();
  };

  restartLava();
  window.addEventListener("resize", restartLava);
  reducedMotionQuery.addEventListener("change", handleMotionChange);

  return () => {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener("resize", restartLava);
    reducedMotionQuery.removeEventListener("change", handleMotionChange);
  };
};

const cleanupLavaLamp = setupLavaLamp();

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
