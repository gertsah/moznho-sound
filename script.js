const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const revealElements = document.querySelectorAll("[data-reveal]");
const heroStage = document.querySelector("[data-hero-stage]");
const logoTop = document.querySelector("[data-logo-top]");
const logoBottom = document.querySelector("[data-logo-bottom]");
const logoNames = document.querySelector("[data-logo-names]");
const nameItems = logoNames ? [...logoNames.querySelectorAll("span")] : [];
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
  const open = clamp((progress - 0.12) / 0.5, 0, 1);
  const fade = clamp((progress - 0.08) / 0.35, 0, 1);

  logoTop.style.transform = `translate3d(-50%, ${-open * 170}px, 0)`;
  logoBottom.style.transform = `translate3d(-50%, ${open * 170}px, 0)`;
  logoTop.style.opacity = String(1 - fade * 0.14);
  logoBottom.style.opacity = String(1 - fade * 0.14);

  nameItems.forEach((item, index) => {
    const local = clamp((progress - 0.22 - index * 0.08) / 0.2, 0, 1);
    item.style.opacity = String(local);
    item.style.transform = `translate3d(0, ${(1 - local) * 26}px, 0) scale(${0.96 + local * 0.04})`;
  });
};

const updateReel = () => {
  if (!reelSection || !reelTrack || !reelCards.length || window.innerWidth <= 1080) return;

  const rect = reelSection.getBoundingClientRect();
  const viewport = window.innerHeight;
  const progress = clamp((viewport - rect.top) / (rect.height - viewport), 0, 1);

  reelTrack.style.transform = `translate3d(${-progress * 50}%, 0, 0)`;

  reelCards.forEach((card, index) => {
    const focus = clamp(1 - Math.abs(progress * (reelCards.length - 1) - index) * 0.32, 0.84, 1);
    const lift = (focus - 0.84) * 150;
    card.style.transform = `translate3d(0, ${-lift}px, 0) scale(${focus})`;
    card.style.opacity = String(clamp(0.46 + (focus - 0.84) * 3.8, 0.46, 1));
  });
};

let ticking = false;

const updateMotion = () => {
  updateHeroStage();
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
