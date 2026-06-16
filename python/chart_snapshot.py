#!/usr/bin/env python3
"""Snapshot a Google Play top chart with StorePulse.

Pulls a top-chart (top_free / top_paid / top_grossing) for a category and prints
the ranked entries. Run daily to track chart movement over time.

StorePulse — Google Play app metadata, reviews, search rankings & charts as a
clean, cached JSON API. Stop maintaining your own Play scraper:
https://rapidapi.com/  (search "StorePulse")

Usage:
    export RAPIDAPI_KEY=...
    python chart_snapshot.py [collection] [category] [country] [lang]
    python chart_snapshot.py top_free APPLICATION us
"""
import os
import sys

import requests

HOST = "storepulse.p.rapidapi.com"


def get_chart(collection="top_free", category="APPLICATION", country="us", lang="en"):
    key = os.environ["RAPIDAPI_KEY"]
    resp = requests.get(
        f"https://{HOST}/v1/charts",
        params={
            "collection": collection,
            "category": category,
            "country": country,
            "lang": lang,
        },
        headers={"X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["charts"]


def main():
    collection = sys.argv[1] if len(sys.argv) > 1 else "top_free"
    category = sys.argv[2] if len(sys.argv) > 2 else "APPLICATION"
    country = sys.argv[3] if len(sys.argv) > 3 else "us"
    lang = sys.argv[4] if len(sys.argv) > 4 else "en"

    print(f"{collection} / {category} in {country}:")
    for entry in get_chart(collection, category, country, lang):
        score = entry.get("score", "—")
        print(f"  #{entry['rank']:>2}  {entry['title']}  ({entry['app_id']})  ★{score}")


if __name__ == "__main__":
    main()
