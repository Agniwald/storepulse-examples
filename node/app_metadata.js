#!/usr/bin/env node
// Look up full Google Play app metadata with StorePulse.
//
// StorePulse — Google Play app metadata, reviews, search rankings & charts as a
// clean, cached JSON API. Stop maintaining your own Play scraper:
// https://rapidapi.com/egosumkira/api/storepulse
//
// Usage:
//   export RAPIDAPI_KEY=...
//   node app_metadata.js com.spotify.music [country] [lang]
//
// Requires Node 18+ (built-in fetch).

const HOST = "storepulse.p.rapidapi.com";

async function getApp(packageId, country = "us", lang = "en") {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("set RAPIDAPI_KEY in your environment");

  const url = new URL(`https://${HOST}/v1/app`);
  url.search = new URLSearchParams({ id: packageId, country, lang }).toString();

  const resp = await fetch(url, {
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

async function main() {
  const [packageId, country = "us", lang = "en"] = process.argv.slice(2);
  if (!packageId) {
    console.error("usage: node app_metadata.js <package_id> [country] [lang]");
    process.exit(1);
  }

  const app = await getApp(packageId, country, lang);
  console.log(`${app.title}  (${app.id})`);
  console.log(`  developer: ${app.developer}`);
  console.log(`  score:     ${app.score}  (${app.ratings} ratings)`);
  console.log(`  installs:  ${app.installs}`);
  console.log(`  genre:     ${app.genre}`);
  console.log(`  version:   ${app.version}`);
  console.log(`  free:      ${app.free}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
