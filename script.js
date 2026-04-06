const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

  const rect = heroStage.getBoundingClientRect();
  const viewport = window.innerHeight;
  const progress = clamp((viewport - rect.top) / (rect.height - viewport), 0, 1);
  const split = clamp((progress - 0.08) / 0.42, 0, 1);
  const widen = clamp((progress - 0.16) / 0.5, 0, 1);

  logoTop.style.transform = `translate3d(calc(-50% - ${split * 120}px), ${-split * 180}px, 0)`;
  logoBottom.style.transform = `translate3d(calc(-50% + ${split * 120}px), ${split * 180}px, 0)`;
  logoTop.style.letterSpacing = `${0.02 + widen * 0.08}em`;
  logoBottom.style.letterSpacing = `${0.02 + widen * 0.08}em`;

  nameItems.forEach((item, index) => {
    const local = clamp((progress - 0.2 - index * 0.07) / 0.22, 0, 1);
    item.style.opacity = String(local);
    item.style.transform = `translate3d(0, ${(1 - local) * 34}px, 0) scale(${0.94 + local * 0.06})`;
    item.style.letterSpacing = `${0.08 + local * 0.08}em`;
  });

  heroTags.forEach((tag, index) => {
    const direction = index === 0 ? -1 : index === 1 ? 1 : 0;
    const local = clamp((progress - 0.1) / 0.45, 0, 1);
    const x = direction * local * 90;
    const y = index === 2 ? local * 24 : -local * 18;
    tag.style.transform =
      index === 2
        ? `translate3d(calc(-50% + ${x}px), ${y}px, 0)`
        : `translate3d(${x}px, ${y}px, 0)`;
    tag.style.opacity = String(0.45 + local * 0.55);
  });
};

const updateRosterStage = () => {
  if (!rosterStage || !artistPanels.length || window.innerWidth <= 1080) return;

  const rect = rosterStage.getBoundingClientRect();
  const viewport = window.innerHeight;
  const progress = clamp((viewport - rect.top) / (rect.height - viewport), 0, 1);

  artistPanels.forEach((panel, index) => {
    const local = clamp(progress * 1.36 - index * 0.24, 0, 1);
    const translateY = 120 - local * 180 + index * 16;
    const scale = 0.88 + local * 0.12;
    const rotate = (index % 2 === 0 ? -1 : 1) * (1 - local) * 3.8;
    panel.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    panel.style.opacity = String(0.28 + local * 0.72);
    panel.style.zIndex = String(Math.round(local * 100) + (artistPanels.length - index));
  });
};

const updateReel = () => {
  if (!reelSection || !reelTrack || !reelCards.length || window.innerWidth <= 1080) return;

  const rect = reelSection.getBoundingClientRect();
  const viewport = window.innerHeight;
  const progress = clamp((viewport - rect.top) / (rect.height - viewport), 0, 1);

  reelTrack.style.transform = `translate3d(${-progress * 56}%, 0, 0)`;

  reelCards.forEach((card, index) => {
    const focus = clamp(1 - Math.abs(progress * (reelCards.length - 1) - index) * 0.34, 0.82, 1);
    const lift = (focus - 0.82) * 170;
    card.style.transform = `translate3d(0, ${-lift}px, 0) scale(${focus})`;
    card.style.opacity = String(clamp(0.42 + (focus - 0.82) * 3.4, 0.42, 1));
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

updateMotion();
