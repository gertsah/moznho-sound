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

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value
        .split("")
        .map((char) => char + char)
        .join("")
    : value;

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
};

const rgba = (rgb, alpha) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;

const shaderCanvas = document.querySelector("[data-shader-canvas]");
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
const reelSection = document.querySelector("[data-reel-section]");
const reelTrack = reelSection?.querySelector(".reel-track");
const reelCards = reelSection ? [...reelSection.querySelectorAll(".reel-card")] : [];

const setupShaderCanvas = () => {
  if (!shaderCanvas) return;

  const context = shaderCanvas.getContext("2d");

  if (!context) return;

  const config = {
    brightness: 1.2,
    color1: "#000000",
    color2: "#ede5f6",
    color3: "#000001",
    frameRate: 10,
    pixelDensity: 3,
    positionX: -1.4,
    reflection: 0.9,
    rotationZ: 50,
    uAmplitude: 4.6,
    uDensity: 0.8,
    uFrequency: 5.5,
    uSpeed: 0.2,
    uStrength: 10
  };

  const dark = hexToRgb(config.color1);
  const accent = hexToRgb(config.color2);
  const deep = hexToRgb(config.color3);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0;
  let height = 0;
  let devicePixelRatio = 1;
  let animationFrameId = 0;
  let lastFrameTime = 0;

  const drawWaterPlane = (time) => {
    const planeWidth = width * 0.86;
    const planeHeight = height * 0.54;

    context.save();
    context.translate(width * (0.5 + config.positionX * 0.022), height * 0.58);
    context.rotate((config.rotationZ * Math.PI) / 180);
    context.scale(1.16, 0.8);
    context.globalCompositeOperation = "screen";

    const glow = context.createRadialGradient(0, -planeHeight * 0.32, 0, 0, 0, planeWidth * 0.54);
    glow.addColorStop(0, rgba(accent, 0.22 * config.brightness));
    glow.addColorStop(0.45, rgba(accent, 0.1 * config.brightness));
    glow.addColorStop(1, rgba(deep, 0));
    context.fillStyle = glow;
    context.beginPath();
    context.ellipse(0, 0, planeWidth * 0.54, planeHeight * 0.48, 0, 0, Math.PI * 2);
    context.fill();

    for (let index = 0; index < 24; index += 1) {
      const progress = index / 23;
      const centered = progress - 0.5;
      const waveA =
        Math.sin(progress * config.uFrequency * 2.4 + time * 4.4 + index * config.uDensity) *
        config.uAmplitude *
        7;
      const waveB =
        Math.cos(progress * config.uFrequency * 1.2 - time * 3.1 + index * 0.24) *
        config.uStrength *
        0.72;
      const ellipseX = Math.sin(time * 1.7 + progress * 5.8) * 44 + waveB;
      const ellipseY = centered * planeHeight + waveA;
      const radiusX = planeWidth * (0.36 + (1 - Math.abs(centered)) * 0.28);
      const radiusY = 10 + (1 - Math.abs(centered)) * 22;
      const alpha = (0.03 + (1 - Math.abs(centered)) * 0.075) * config.brightness;

      const fill = context.createRadialGradient(ellipseX, ellipseY, 0, ellipseX, ellipseY, radiusX);
      fill.addColorStop(0, rgba(accent, alpha));
      fill.addColorStop(0.45, rgba(accent, alpha * 0.48));
      fill.addColorStop(1, rgba(deep, 0));

      context.fillStyle = fill;
      context.beginPath();
      context.ellipse(ellipseX, ellipseY, radiusX, radiusY, 0, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = rgba(accent, 0.025 + progress * 0.026);
      context.lineWidth = 1.1;
      context.beginPath();
      context.moveTo(-planeWidth * 0.42, ellipseY + waveB * 0.04);
      context.quadraticCurveTo(ellipseX * 0.32, ellipseY - waveB * 0.18, planeWidth * 0.42, ellipseY);
      context.stroke();
    }

    for (let index = 0; index < 6; index += 1) {
      const glintX = -planeWidth * 0.12 + index * planeWidth * 0.08;
      const glintY = -planeHeight * 0.18 + Math.sin(time * 2.2 + index) * 12;
      const glint = context.createLinearGradient(
        glintX - planeWidth * 0.05,
        glintY,
        glintX + planeWidth * 0.08,
        glintY
      );
      glint.addColorStop(0, rgba(accent, 0));
      glint.addColorStop(0.5, rgba(accent, 0.16 * config.reflection));
      glint.addColorStop(1, rgba(accent, 0));

      context.strokeStyle = glint;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(glintX - planeWidth * 0.05, glintY);
      context.lineTo(glintX + planeWidth * 0.08, glintY);
      context.stroke();
    }

    context.restore();
  };

  const drawFrame = (timestamp = 0) => {
    const time = timestamp * 0.001 * config.uSpeed * 3.6;

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const ambient = context.createRadialGradient(width * 0.5, height * 0.14, 0, width * 0.5, height * 0.14, height * 0.86);
    ambient.addColorStop(0, rgba(accent, 0.16));
    ambient.addColorStop(0.38, rgba(accent, 0.06));
    ambient.addColorStop(1, rgba(dark, 0));
    context.fillStyle = ambient;
    context.fillRect(0, 0, width, height);

    const sideGlow = context.createRadialGradient(width * 0.72, height * 0.74, 0, width * 0.72, height * 0.74, width * 0.34);
    sideGlow.addColorStop(0, rgba(accent, 0.08));
    sideGlow.addColorStop(1, rgba(deep, 0));
    context.fillStyle = sideGlow;
    context.fillRect(0, 0, width, height);

    drawWaterPlane(time);
  };

  const resizeCanvas = () => {
    width = Math.ceil(window.innerWidth);
    height = Math.ceil(window.innerHeight);
    devicePixelRatio = Math.min(window.devicePixelRatio || 1, Math.min(2, config.pixelDensity));
    shaderCanvas.width = Math.ceil(width * devicePixelRatio);
    shaderCanvas.height = Math.ceil(height * devicePixelRatio);
    shaderCanvas.style.width = `${width}px`;
    shaderCanvas.style.height = `${height}px`;
    drawFrame(performance.now());
  };

  const animate = (timestamp) => {
    if (reduceMotion.matches) {
      drawFrame(timestamp);
      return;
    }

    if (timestamp - lastFrameTime >= 1000 / config.frameRate) {
      lastFrameTime = timestamp;
      drawFrame(timestamp);
    }

    animationFrameId = window.requestAnimationFrame(animate);
  };

  resizeCanvas();

  if (!reduceMotion.matches) {
    animationFrameId = window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrameId);
      return;
    }

    if (!reduceMotion.matches) {
      animationFrameId = window.requestAnimationFrame(animate);
    } else {
      drawFrame(performance.now());
    }
  });
};

setupShaderCanvas();

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
  if (!rosterStage || !artistPanels.length || window.innerWidth <= 1080) return;

  const progress = getStageProgress(rosterStage);

  artistPanels.forEach((panel, index) => {
    const local = clamp(progress * 1.18 - index * 0.16, 0, 1);
    const translateX = index * 18 - local * index * 10;
    const translateY = 42 + index * 14 - local * 72;
    const scale = 0.94 + local * 0.06;
    const rotate = (index % 2 === 0 ? -1 : 1) * (1 - local) * 2.2;

    panel.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    panel.style.opacity = String(0.55 + local * 0.45);
    panel.style.zIndex = String(Math.round(local * 100) + (artistPanels.length - index));
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

updateMotion();
