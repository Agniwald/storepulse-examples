#!/usr/bin/env node
// Ranked Google Play search results with StorePulse.
//
// StorePulse — Google Play app metadata, reviews, search rankings & charts as a
// clean, cached JSON API. Stop maintaining your own Play scraper:
// https://rapidapi.com/  (search "StorePulse")
//
// Usage:
//   export RAPIDAPI_KEY=...
//   node search.js "photo editor" [country] [lang]
//
// Requires Node 18+ (built-in fetch).

const HOST = "storepulse.p.rapidapi.com";

async function search(query, country = "us", lang = "en") {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("set RAPIDAPI_KEY in your environment");

  const url = new URL(`https://${HOST}/v1/search`);
  url.search = new URLSearchParams({ q: query, country, lang }).toString();

  const resp = await fetch(url, {
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data.results;
}

async function main() {
  const [query, country = "us", lang = "en"] = process.argv.slice(2);
  if (!query) {
    console.error('usage: node search.js "<query>" [country] [lang]');
    process.exit(1);
  }

  console.log(`Top results for "${query}" in ${country}:`);
  for (const r of await search(query, country, lang)) {
    const rank = String(r.rank).padStart(2);
    console.log(`  #${rank}  ${r.title}  (${r.app_id})  ★${r.score ?? "—"}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
