const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const revealElements = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const heroTitle = document.querySelector("[data-hero-title]");
const heroLines = heroTitle ? [...heroTitle.querySelectorAll("span")] : [];

const stackSection = document.querySelector("[data-stack-section]");
const artistCards = stackSection
  ? [...stackSection.querySelectorAll("[data-card]")]
  : [];

const reelSection = document.querySelector("[data-reel-section]");
const reelTrack = reelSection?.querySelector(".reel-track");
const reelPanels = reelSection ? [...reelSection.querySelectorAll(".reel-panel")] : [];
const reelProgress = reelSection?.querySelector(".reel-progress span");

let ticking = false;
let heroPointer = { x: 0, y: 0 };

const updateHeroTilt = () => {
  if (!heroLines.length) return;

  heroLines.forEach((line, index) => {
    const factor = index === 0 ? 1 : -1;
    const x = heroPointer.x * 10 * factor;
    const y = heroPointer.y * 8 * (index + 1);
    line.style.setProperty("--title-shift-x", `${x}px`);
    line.style.setProperty("--title-shift-y", `${y}px`);
  });
};

const updateStackSection = () => {
  if (!stackSection || !artistCards.length || window.innerWidth <= 1080) return;

  const rect = stackSection.getBoundingClientRect();
  const viewport = window.innerHeight;
  const progress = clamp((viewport - rect.top) / (rect.height - viewport), 0, 1);

  artistCards.forEach((card, index) => {
    const local = clamp(progress * 1.38 - index * 0.24, 0, 1);
    const translateY = 120 - local * 160 + index * 14;
    const scale = 0.88 + local * 0.12;
    const rotate = (index % 2 === 0 ? -1 : 1) * (1 - local) * 4;
    const opacity = 0.3 + local * 0.7;

    card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    card.style.opacity = opacity.toFixed(3);
    card.style.zIndex = String(Math.round(local * 100) + (artistCards.length - index));
  });
};

const updateReelSection = () => {
  if (!reelSection || !reelTrack || !reelPanels.length || window.innerWidth <= 1080) return;

  const rect = reelSection.getBoundingClientRect();
  const viewport = window.innerHeight;
  const progress = clamp((viewport - rect.top) / (rect.height - viewport), 0, 1);

  reelTrack.style.transform = `translate3d(${-progress * 54}%, 0, 0)`;

  if (reelProgress) {
    reelProgress.style.transform = `scaleX(${0.14 + progress * 0.86})`;
  }

  reelPanels.forEach((panel, index) => {
    const focus = clamp(1 - Math.abs(progress * (reelPanels.length - 1) - index) * 0.38, 0.78, 1);
    const lift = (focus - 0.78) * 110;
    panel.style.transform = `translate3d(0, ${-lift}px, 0) scale(${focus})`;
    panel.style.opacity = String(clamp(0.42 + (focus - 0.78) * 3.1, 0.42, 1));
  });
};

const updateMotion = () => {
  updateHeroTilt();
  updateStackSection();
  updateReelSection();
  ticking = false;
};

const requestMotionUpdate = () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateMotion);
};

window.addEventListener("scroll", requestMotionUpdate, { passive: true });
window.addEventListener("resize", requestMotionUpdate);

window.addEventListener("pointermove", (event) => {
  heroPointer = {
    x: (event.clientX / window.innerWidth - 0.5) * 2,
    y: (event.clientY / window.innerHeight - 0.5) * 2,
  };
  requestMotionUpdate();
});

updateMotion();
