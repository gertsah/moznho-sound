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
