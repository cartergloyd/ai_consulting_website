/* ── Menu toggle ─────────────────────────────────────────────────── */
const menuButton = document.querySelector(".menu-button");
const siteMenu = document.querySelector("#site-menu");

menuButton.addEventListener("click", () => {
  const isOpen = siteMenu.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

siteMenu.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    siteMenu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});


/* ── Carousel cards ──────────────────────────────────────────────────
   Axios articles are auto-updated by scripts/update-axios-feed.mjs.
   Own content (newsletters, deliverables, case studies) is managed
   manually in OWN_CARDS below.
   ─────────────────────────────────────────────────────────────────── */

/* axios-cards:start */
const AXIOS_CARDS = [
  {
    title: "China's new open-source model accelerates AI hacking threat",
    source: "Axios",
    href: "https://www.axios.com/2026/06/25/china-glm-52-open-source-hackers",
    img: "assets/axios-feed/01-china-glm-52-open-source-hackers.jpg",
    alt: "",
    external: true,
  },
  {
    title: "Water joins energy as top AI flashpoint",
    source: "Axios",
    href: "https://www.axios.com/2026/06/25/water-energy-ai-flashpoint",
    img: "assets/axios-feed/02-water-energy-ai-flashpoint.jpg",
    alt: "",
    external: true,
  },
  {
    title: "Exclusive: Codex agents are inching into the mainstream",
    source: "Axios",
    href: "https://www.axios.com/2026/06/25/codex-agents-growth-openai",
    img: "assets/axios-feed/03-codex-agents-growth-openai.jpg",
    alt: "",
    external: true,
  },
  {
    title: "Chamath Palihapitiya rejects the AI jobs apocalypse",
    source: "Axios",
    href: "https://www.axios.com/2026/06/24/chamath-palihapitiya-future-of-work-ai",
    img: "assets/axios-feed/04-chamath-palihapitiya-future-of-work-ai.png",
    alt: "",
    external: true,
  },
  {
    title: "Investors may be hitting pause on the AI run-up",
    source: "Axios",
    href: "https://www.axios.com/2026/06/24/ai-stocks-chips-selloff",
    img: "assets/axios-feed/05-ai-stocks-chips-selloff.png",
    alt: "",
    external: true,
  },
];
/* axios-cards:end */

/* ── Own content cards ───────────────────────────────────────────────
   Add newsletter, deliverable, and case study cards here manually.
   Use source labels: "Newsletter / Issue NN", "Deliverable / Issue NN",
   "Research / Issue NN", or "Case Study".
   ─────────────────────────────────────────────────────────────────── */
const OWN_CARDS = [
  {
    title: "One engineer's workload, zero new hires.",
    source: "Deliverable / Issue 02",
    href: "workflow-notes-02.html",
    img: "assets/enterprise-command-center.png",
    alt: "Abstract enterprise command center with infrastructure monitoring signals",
    external: false,
  },
  {
    title: "Turn AI pilots into operating capacity.",
    source: "Newsletter / Issue 01",
    href: "workflow-notes-01.html",
    img: "assets/latest-workflows.png",
    alt: "Abstract enterprise workflow architecture with gold automation paths",
    external: false,
  },
  {
    title: "The metrics that prove automation is working after launch.",
    source: "Case Study",
    href: "#",
    img: "assets/latest-roi.png",
    alt: "Executive analytics environment showing abstract AI ROI signals",
    external: false,
  },
];

/* ── Carousel ────────────────────────────────────────────────────────

   HOW THE SEAMLESS LOOP WORKS
   ────────────────────────────
   1. CAROUSEL_CARDS is rendered twice into #carousel-track (set A then
      set B), producing a flex row like: [A₁ A₂ … Aₙ | B₁ B₂ … Bₙ].

   2. The CSS keyframe `carousel-scroll` animates the track from
      translateX(0) to translateX(-50%). Because the track is
      `width: max-content` (two sets wide), -50% = exactly one set's
      pixel width.

   3. When the animation loops back to 0% the browser resets instantly —
      but set B is now in the exact same position set A began. The eye
      sees no jump; the stream appears infinite.

   4. Cards use `margin-right` instead of a flex `gap` so the spacing
      between the last card of set A and B₁ matches every other inter-
      card gap, eliminating a visible seam at the join point.

   5. Set B cards carry aria-hidden="true" and tabIndex=-1 so screen
      readers and keyboard users only encounter each card once.
   ─────────────────────────────────────────────────────────────────── */
const CAROUSEL_CARDS = [...AXIOS_CARDS, ...OWN_CARDS];

function buildCarouselCard(card, isDuplicate) {
  const a = document.createElement("a");
  a.className = "carousel-card";
  a.href = card.href;
  a.setAttribute("role", "listitem");

  if (card.external) {
    a.target = "_blank";
    a.rel = "noopener";
  }

  // Duplicate set: hidden from screen readers and tab order
  if (isDuplicate) {
    a.setAttribute("aria-hidden", "true");
    a.tabIndex = -1;
  }

  a.innerHTML =
    `<div class="carousel-card-img-wrap">` +
    `<img class="carousel-card-img" src="${card.img}" alt="${card.alt}" loading="lazy" decoding="async">` +
    `</div>` +
    `<div class="carousel-card-meta">` +
    `<span class="carousel-card-title">${card.title}</span>` +
    `<span class="carousel-card-source">${card.source}</span>` +
    `</div>`;

  return a;
}

/* ── Careers form ────────────────────────────────────────────────────
   Handles: email validation, filename display, submit transition.
   Does NOT send data anywhere — see the TODO below.
   ─────────────────────────────────────────────────────────────────── */
(function () {
  const form = document.getElementById("careers-form");
  const confirmation = document.getElementById("careers-confirmation");
  if (!form || !confirmation) return;

  const emailInput = form.querySelector(".careers-input");
  const fileInput = form.querySelector(".careers-file");
  const uploadLabel = form.querySelector(".careers-upload-label");

  // Show selected filename in the upload button
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    uploadLabel.textContent = file ? file.name : "Upload résumé";
  });

  // Clear invalid state as soon as the user starts correcting their email
  emailInput.addEventListener("input", () => {
    emailInput.classList.remove("is-invalid");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailOk) {
      emailInput.classList.add("is-invalid");
      emailInput.focus();
      return;
    }

    // TODO: wire up to backend — POST { email, resume: fileInput.files[0] } to /api/apply

    // ── Submit transition ─────────────────────────────────────────────
    // Apple-smooth ease-out cubic-bezier over ~400–500ms.
    // prefers-reduced-motion: instant swap, no animation.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      form.style.display = "none";
      confirmation.style.display = "block";
      return;
    }

    // Phase 1: form fades + slides up (400ms ease-out)
    form.style.transition =
      "opacity 400ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 400ms cubic-bezier(0.25, 0.1, 0.25, 1)";
    form.style.opacity = "0";
    form.style.transform = "translateY(-14px)";

    setTimeout(() => {
      // Phase 2: hide form, stage confirmation below its resting position
      form.style.display = "none";
      confirmation.style.opacity = "0";
      confirmation.style.transform = "translateY(14px)";
      confirmation.style.display = "block";

      // Force reflow so the browser registers the start state before transitioning
      void confirmation.offsetHeight;

      // Phase 3: confirmation fades + slides up into place (500ms ease-out)
      confirmation.style.transition =
        "opacity 500ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 500ms cubic-bezier(0.25, 0.1, 0.25, 1)";
      confirmation.style.opacity = "1";
      confirmation.style.transform = "translateY(0)";
    }, 420); // wait for phase 1 to finish before swapping
    // ─────────────────────────────────────────────────────────────────
  });
})();

/* ── Carousel render ─────────────────────────────────────────────── */
const track = document.getElementById("carousel-track");
if (track && CAROUSEL_CARDS.length > 0) {
  // Set A — real cards, accessible
  CAROUSEL_CARDS.forEach((card) => track.appendChild(buildCarouselCard(card, false)));
  // Set B — duplicates for seamless loop, hidden from assistive tech
  CAROUSEL_CARDS.forEach((card) => track.appendChild(buildCarouselCard(card, true)));
}
