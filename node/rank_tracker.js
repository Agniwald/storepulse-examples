#!/usr/bin/env node
// Track where an app ranks for a keyword (ASO rank tracking) with StorePulse.
//
// Search the store for a keyword and report the position of a specific app — the
// core of any ASO / keyword rank-tracking workflow. Run it on a schedule and log
// the rank over time.
//
// StorePulse — Google Play app metadata, reviews, search rankings & charts as a
// clean, cached JSON API. Stop maintaining your own Play scraper:
// https://rapidapi.com/egosumkira/api/storepulse
//
// Usage:
//   export RAPIDAPI_KEY=...
//   node rank_tracker.js "music streaming" com.spotify.music [country] [lang]
//
// Requires Node 18+ (built-in fetch).

const HOST = "storepulse.p.rapidapi.com";

async function findRank(query, targetAppId, country = "us", lang = "en") {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("set RAPIDAPI_KEY in your environment");

  const url = new URL(`https://${HOST}/v1/search`);
  url.search = new URLSearchParams({ q: query, country, lang }).toString();

  const resp = await fetch(url, {
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const hit = data.results.find((r) => r.app_id === targetAppId);
  return hit ? hit.rank : null; // null = not in the returned page of results
}

async function main() {
  const [query, target, country = "us", lang = "en"] = process.argv.slice(2);
  if (!query || !target) {
    console.error('usage: node rank_tracker.js "<query>" <package_id> [country] [lang]');
    process.exit(1);
  }

  const rank = await findRank(query, target, country, lang);
  const now = new Date().toISOString();
  const value = rank === null ? "NOT_FOUND" : rank;
  console.log(`${now}  ${target}  query="${query}"  country=${country}  rank=${value}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
