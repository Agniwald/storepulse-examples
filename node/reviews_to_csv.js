#!/usr/bin/env node
// Export Google Play reviews to CSV (for sentiment / analysis) with StorePulse.
//
// Pages through reviews using the opaque `cursor` -> `next_cursor` token and
// writes each review as a CSV row. Ready to load into a spreadsheet or an NLP
// pipeline.
//
// StorePulse — Google Play app metadata, reviews, search rankings & charts as a
// clean, cached JSON API. Stop maintaining your own Play scraper:
// https://rapidapi.com/  (search "StorePulse")
//
// Usage:
//   export RAPIDAPI_KEY=...
//   node reviews_to_csv.js com.zhiliaoapp.musically reviews.csv [pages] [sort] [country] [lang]
//
// Requires Node 18+ (built-in fetch).

const fs = require("fs");

const HOST = "storepulse.p.rapidapi.com";
const FIELDS = ["id", "author", "rating", "date", "version", "thumbs_up", "text"];

async function fetchPage(packageId, sort, cursor, country, lang) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("set RAPIDAPI_KEY in your environment");

  const params = { id: packageId, sort, country, lang };
  if (cursor) params.cursor = cursor;

  const url = new URL(`https://${HOST}/v1/reviews`);
  url.search = new URLSearchParams(params).toString();

  const resp = await fetch(url, {
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return { reviews: data.reviews ?? [], nextCursor: data.next_cursor };
}

function csvCell(value) {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`; // RFC-4180 quoting
}

async function main() {
  const [packageId, outfile, pagesArg, sort = "newest", country = "us", lang = "en"] =
    process.argv.slice(2);
  if (!packageId || !outfile) {
    console.error(
      "usage: node reviews_to_csv.js <package_id> <outfile> [pages] [sort] [country] [lang]"
    );
    process.exit(1);
  }
  const maxPages = parseInt(pagesArg, 10) || 1;

  const out = fs.createWriteStream(outfile, { encoding: "utf-8" });
  out.write(FIELDS.join(",") + "\n");

  let cursor = null;
  let total = 0;
  for (let page = 0; page < maxPages; page++) {
    const { reviews, nextCursor } = await fetchPage(packageId, sort, cursor, country, lang);
    for (const r of reviews) {
      out.write(FIELDS.map((f) => csvCell(r[f])).join(",") + "\n");
    }
    total += reviews.length;
    console.log(`page ${page + 1}: ${reviews.length} reviews`);
    cursor = nextCursor;
    if (!cursor) break; // last page reached
  }

  out.end();
  console.log(`wrote ${total} reviews to ${outfile}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
