const menuButton = document.querySelector(".menu-button");
const siteMenu = document.querySelector("#site-menu");
const axiosFeed = document.querySelector("#axios-feed");
const AXIOS_AI_URL = "https://www.axios.com/technology/automation-and-ai";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const FALLBACK_IMAGES = [
  "assets/axios-ai-cost-human-workers.jpeg",
  "assets/axios-israel-ai-influence.jpeg",
  "assets/axios-colorado-ai-law.jpg",
  "assets/axios-google-anthropic.gif",
  "assets/axios-ai-productivity-inflation.gif"
];
const CACHED_AXIOS_IMAGES = {
  "https://www.axios.com/2026/04/26/ai-cost-human-workers": "assets/axios-ai-cost-human-workers.jpeg",
  "https://www.axios.com/2026/04/25/israel-ai-influence-parscale": "assets/axios-israel-ai-influence.jpeg",
  "https://www.axios.com/2026/04/24/justice-department-joins-xai-challenge-colorado-ai-law": "assets/axios-colorado-ai-law.jpg",
  "https://www.axios.com/2026/04/24/google-amazon-anthropic-investment": "assets/axios-google-anthropic.gif",
  "https://www.axios.com/2026/04/23/ai-inflation-productivity-companies": "assets/axios-ai-productivity-inflation.gif"
};

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

async function fetchHtml(url) {
  const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);

  if (!response.ok) {
    throw new Error(`Unable to load ${url}`);
  }

  const html = await response.text();
  return new DOMParser().parseFromString(html, "text/html");
}

function cleanHeadline(text) {
  return text.replace(/\s*Go deeper\s*\([^)]*\)\s*/i, "").replace(/\s+/g, " ").trim();
}

function absoluteAxiosUrl(href) {
  return new URL(href, AXIOS_AI_URL).href;
}

function findAxiosStories(document) {
  const seen = new Set();

  return Array.from(document.querySelectorAll("a[href]"))
    .map((link) => ({
      headline: cleanHeadline(link.textContent),
      url: absoluteAxiosUrl(link.getAttribute("href"))
    }))
    .filter((story) => {
      const isArticle = /^https:\/\/www\.axios\.com\/\d{4}\/\d{2}\/\d{2}\//.test(story.url);
      const isNew = !seen.has(story.url);
      const hasHeadline = story.headline.length > 16;
      seen.add(story.url);
      return isArticle && isNew && hasHeadline;
    })
    .slice(0, 5);
}

async function enrichStory(story, index) {
  if (CACHED_AXIOS_IMAGES[story.url]) {
    return {
      ...story,
      image: CACHED_AXIOS_IMAGES[story.url]
    };
  }

  try {
    const document = await fetchHtml(story.url);
    const image = document.querySelector('meta[property="og:image"]')?.content;
    const title = document.querySelector('meta[property="og:title"]')?.content;

    return {
      ...story,
      headline: title ? cleanHeadline(title) : story.headline,
      image: image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
    };
  } catch {
    return {
      ...story,
      image: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
    };
  }
}

function renderAxiosFeed(stories) {
  axiosFeed.replaceChildren(
    ...stories.map((story) => {
      const card = document.createElement("a");
      card.className = "latest-card";
      card.href = story.url;
      card.target = "_blank";
      card.rel = "noopener";

      const image = document.createElement("img");
      image.className = "card-image";
      image.src = story.image;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.src = FALLBACK_IMAGES[0];
      }, { once: true });

      const body = document.createElement("div");
      body.className = "card-body";
      const source = document.createElement("img");
      source.className = "source-logo";
      source.src = "assets/axios-logo.svg";
      source.alt = "Axios";
      const headline = document.createElement("h3");
      headline.textContent = story.headline;

      body.append(source, headline);
      card.append(image, body);
      return card;
    })
  );
}

async function loadAxiosFeed() {
  if (!axiosFeed) {
    return;
  }

  try {
    const document = await fetchHtml(AXIOS_AI_URL);
    const stories = findAxiosStories(document);

    if (stories.length === 0) {
      return;
    }

    const enrichedStories = await Promise.all(stories.map(enrichStory));
    renderAxiosFeed(enrichedStories);
  } catch {
    axiosFeed.dataset.status = "fallback";
  }
}

loadAxiosFeed();
