#!/usr/bin/env node
// Snapshot a Google Play top chart with StorePulse.
//
// Pulls a top-chart (top_free / top_paid / top_grossing) for a category and
// prints the ranked entries. Run daily to track chart movement over time.
//
// StorePulse — Google Play app metadata, reviews, search rankings & charts as a
// clean, cached JSON API. Stop maintaining your own Play scraper:
// https://rapidapi.com/egosumkira/api/storepulse
//
// Usage:
//   export RAPIDAPI_KEY=...
//   node chart_snapshot.js [collection] [category] [country] [lang]
//   node chart_snapshot.js top_free APPLICATION us
//
// Requires Node 18+ (built-in fetch).

const HOST = "storepulse.p.rapidapi.com";

async function getChart(collection = "top_free", category = "APPLICATION", country = "us", lang = "en") {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("set RAPIDAPI_KEY in your environment");

  const url = new URL(`https://${HOST}/v1/charts`);
  url.search = new URLSearchParams({ collection, category, country, lang }).toString();

  const resp = await fetch(url, {
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return data.charts;
}

async function main() {
  const [collection = "top_free", category = "APPLICATION", country = "us", lang = "en"] =
    process.argv.slice(2);

  console.log(`${collection} / ${category} in ${country}:`);
  for (const entry of await getChart(collection, category, country, lang)) {
    const rank = String(entry.rank).padStart(2);
    console.log(`  #${rank}  ${entry.title}  (${entry.app_id})  ★${entry.score ?? "—"}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
