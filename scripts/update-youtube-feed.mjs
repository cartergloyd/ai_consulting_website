import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const scriptPath = path.join(rootDir, "script.js");

const PLAYLISTS = [
  {
    id: "PLOXw6I10VTv9sJFe69lRqRLtpj41wOw8V",
    source: "ChatGPT Workspace Agents",
    stripPrefix: "Workspace agents in ChatGPT: ",
  },
  {
    id: "PLf2m23nhTg1NjL3-jL3s0qZCYzO07ZQPv",
    source: "AI Fluency Course",
    stripSuffix: " | AI Fluency: Framework & Foundations Course",
  },
];

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "gold-ai-website-feed-updater/1.0" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

function parsePlaylistFeed(xml, playlist) {
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi));
  return entries.map(([, entry]) => {
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/i);
    if (!videoIdMatch || !titleMatch) return null;

    const videoId = videoIdMatch[1].trim();
    let title = titleMatch[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    if (playlist.stripPrefix && title.startsWith(playlist.stripPrefix)) {
      title = title.slice(playlist.stripPrefix.length).trim();
    }
    if (playlist.stripSuffix && title.endsWith(playlist.stripSuffix)) {
      title = title.slice(0, title.length - playlist.stripSuffix.length).trim();
    }
    // Also strip trailing pipe variants from playlist 2
    title = title.replace(/\s*\|\s*AI Fluency:.*$/, "").trim();
    // Strip trailing pipe with nothing after
    title = title.replace(/\s*\|+\s*$/, "").trim();

    return { videoId, title, source: playlist.source };
  }).filter(Boolean);
}

function escapeJs(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

function interleave(arrays) {
  const result = [];
  const maxLen = Math.max(...arrays.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of arrays) {
      if (i < arr.length) result.push(arr[i]);
    }
  }
  return result;
}

async function updateCarouselScript(videos) {
  const source = await readFile(scriptPath, "utf8");
  const cardLines = videos.map((v) =>
    `  {\n    videoId: "${escapeJs(v.videoId)}",\n    title: "${escapeJs(v.title)}",\n    source: "${escapeJs(v.source)}",\n  },`
  );
  const replacement =
    `/* youtube-cards:start */\nconst VIDEO_CARDS = [\n${cardLines.join("\n")}\n];\n/* youtube-cards:end */`;
  const updated = source.replace(
    /\/\* youtube-cards:start \*\/[\s\S]*?\/\* youtube-cards:end \*\//,
    replacement
  );
  if (updated === source) {
    throw new Error("Could not find /* youtube-cards:start/end */ markers in script.js");
  }
  await writeFile(scriptPath, updated);
}

async function main() {
  const allLists = [];

  for (const playlist of PLAYLISTS) {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlist.id}`;
    const xml = await fetchText(feedUrl);
    const videos = parsePlaylistFeed(xml, playlist);
    console.log(`  Playlist ${playlist.id}: ${videos.length} videos`);
    allLists.push(videos);
  }

  // Interleave videos from both playlists so the carousel alternates sources
  const interleaved = interleave(allLists);
  await updateCarouselScript(interleaved);
  console.log(`Updated ${interleaved.length} video cards in script.js.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
