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

  const configs = [
    { anchorX: 0.04, anchorY: 0.22, size: 0.22, rangeX: 0.05, rangeY: 0.13, phase: 0.2, speedX: 0.32, speedY: 0.24, scaleRange: 0.12 },
    { anchorX: 0.16, anchorY: 0.3, size: 0.18, rangeX: 0.07, rangeY: 0.16, phase: 1.1, speedX: 0.4, speedY: 0.28, scaleRange: 0.14 },
    { anchorX: 0.31, anchorY: 0.14, size: 0.14, rangeX: 0.05, rangeY: 0.1, phase: 2.3, speedX: 0.34, speedY: 0.22, scaleRange: 0.1 },
    { anchorX: 0.52, anchorY: 0.18, size: 0.11, rangeX: 0.08, rangeY: 0.14, phase: 3.2, speedX: 0.48, speedY: 0.36, scaleRange: 0.16 },
    { anchorX: 0.72, anchorY: 0.24, size: 0.2, rangeX: 0.06, rangeY: 0.12, phase: 4.1, speedX: 0.3, speedY: 0.21, scaleRange: 0.12 },
    { anchorX: 0.9, anchorY: 0.34, size: 0.19, rangeX: 0.05, rangeY: 0.18, phase: 5.4, speedX: 0.36, speedY: 0.29, scaleRange: 0.15 },
    { anchorX: 0.12, anchorY: 0.62, size: 0.12, rangeX: 0.06, rangeY: 0.14, phase: 0.8, speedX: 0.52, speedY: 0.34, scaleRange: 0.18 },
    { anchorX: 0.34, anchorY: 0.72, size: 0.1, rangeX: 0.04, rangeY: 0.12, phase: 1.9, speedX: 0.46, speedY: 0.32, scaleRange: 0.16 },
    { anchorX: 0.56, anchorY: 0.82, size: 0.1, rangeX: 0.05, rangeY: 0.1, phase: 2.8, speedX: 0.5, speedY: 0.38, scaleRange: 0.16 },
    { anchorX: 0.74, anchorY: 0.68, size: 0.12, rangeX: 0.06, rangeY: 0.12, phase: 3.9, speedX: 0.42, speedY: 0.27, scaleRange: 0.14 },
    { anchorX: 0.88, anchorY: 0.86, size: 0.14, rangeX: 0.05, rangeY: 0.16, phase: 4.8, speedX: 0.38, speedY: 0.31, scaleRange: 0.16 },
    { anchorX: 0.48, anchorY: 0.46, size: 0.12, rangeX: 0.08, rangeY: 0.12, phase: 5.7, speedX: 0.58, speedY: 0.42, scaleRange: 0.18 }
  ];

  lavaLayer.replaceChildren();

  const blobs = configs.map((config) => {
    const node = document.createElement("span");
    node.className = "bg-shader__blob";
    lavaLayer.append(node);
    return { ...config, node };
  });

  let frameId = 0;

  const renderLava = (time = 0) => {
    const t = time * 0.0019;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const minSide = Math.min(width, height);

    blobs.forEach((blob) => {
      const size = minSide * blob.size;
      const driftX =
        Math.sin(t * blob.speedX + blob.phase) * width * blob.rangeX * 1.25 +
        Math.cos(t * blob.speedY * 0.8 + blob.phase * 1.7) * width * blob.rangeX * 0.58;
      const driftY =
        Math.cos(t * blob.speedY + blob.phase) * height * blob.rangeY * 1.25 +
        Math.sin(t * blob.speedX * 0.7 + blob.phase * 1.2) * height * blob.rangeY * 0.52;
      const scale = 0.92 + Math.sin(t * (blob.speedX + blob.speedY) + blob.phase) * blob.scaleRange;
      const x = width * blob.anchorX + driftX;
      const y = height * blob.anchorY + driftY;

      blob.node.style.width = `${size}px`;
      blob.node.style.height = `${size}px`;
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
  if (!rosterStage || !artistPanelParts.length) return;

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
  const layouts = [
    { x: 0, y: 112, rotate: -8, scale: 0.88, prominence: 0.72, phase: 0.2, z: 2 },
    { x: 126, y: 4, rotate: -2, scale: 1, prominence: 1, phase: 1.6, z: 4 },
    { x: 256, y: 122, rotate: 7, scale: 0.86, prominence: 0.78, phase: 2.9, z: 3 }
  ];

  artistPanelParts.forEach(({ panel, indexLabel, cover, body }, index) => {
    const layout = layouts[index] ?? layouts[layouts.length - 1];
    const driftX = Math.cos(wave + layout.phase) * 18;
    const driftY = Math.sin(wave * 1.12 + layout.phase) * 26;
    const scale = layout.scale + Math.sin(wave * 0.82 + layout.phase) * 0.03;
    const rotate = layout.rotate + Math.sin(wave + layout.phase) * 2.2;
    const coverLift = Math.sin(wave * 1.3 + layout.phase) * 8;
    const bodyLift = Math.cos(wave * 1.1 + layout.phase) * 10;
    const prominence = layout.prominence;

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
