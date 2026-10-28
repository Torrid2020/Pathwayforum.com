import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "data", "youtube-videos.json");
const channelUrl = "https://www.youtube.com/@torridcourts";
const fallback = JSON.parse(await readFile(output, "utf8"));

const decode = (value = "") => value
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const match = (text, expression) => expression.exec(text)?.[1] || "";

try {
  const channelPage = await fetch(channelUrl, { headers: { "user-agent": "Mozilla/5.0 PathwayForum/1.0" } });
  if (!channelPage.ok) throw new Error(`Channel page returned ${channelPage.status}`);
  const channelHtml = await channelPage.text();
  const channelId = match(channelHtml, /"externalId":"(UC[0-9A-Za-z_-]{22})"/);
  if (!channelId) throw new Error("Could not identify the Rise & Reasons channel ID");

  const feedResponse = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  if (!feedResponse.ok) throw new Error(`YouTube feed returned ${feedResponse.status}`);
  const feed = await feedResponse.text();
  const entries = [...feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, entry]) => {
    const id = match(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    return {
      id,
      title: decode(match(entry, /<title>([\s\S]*?)<\/title>/)),
      url: decode(match(entry, /<link rel="alternate" href="([^"]+)"\s*\/>/)),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      publishedAt: match(entry, /<published>([^<]+)<\/published>/)
    };
  }).filter((video) => video.id && video.title);
  const usefulTopic = /pathway|student|education|certificate|degree|scholarship|laptop|job|career|work|mindset|anxiety/i;
  const featured = {
    id: "yegA5KPIF5U",
    title: "How to get the BYU-Pathway Work-study job 2025",
    url: "https://www.youtube.com/watch?v=yegA5KPIF5U",
    thumbnail: "https://i.ytimg.com/vi/yegA5KPIF5U/hqdefault.jpg",
    publishedAt: "2025-06-09T00:00:00.000Z"
  };
  const videos = [featured, ...entries.filter((video) => video.id !== featured.id && usefulTopic.test(video.title))].slice(0, 6);
  if (!videos.length) throw new Error("The YouTube feed contained no relevant videos");

  const unchanged = JSON.stringify(fallback.videos || []) === JSON.stringify(videos);
  if (unchanged) {
    console.log("Rise & Reasons video feed is already current.");
  } else {
    await writeFile(output, `${JSON.stringify({ channel: "Rise & Reasons", channelUrl, generatedAt: new Date().toISOString(), videos }, null, 2)}\n`);
    console.log(`Saved ${videos.length} Rise & Reasons videos.`);
  }
} catch (error) {
  console.warn(`YouTube sync skipped: ${error.message}`);
  if (!fallback.videos?.length) process.exitCode = 1;
}
