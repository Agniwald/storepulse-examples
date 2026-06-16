#!/usr/bin/env python3
"""Ranked Google Play search results with StorePulse.

StorePulse — Google Play app metadata, reviews, search rankings & charts as a
clean, cached JSON API. Stop maintaining your own Play scraper:
https://rapidapi.com/  (search "StorePulse")

Usage:
    export RAPIDAPI_KEY=...
    python search.py "photo editor" [country] [lang]
"""
import os
import sys
import requests

HOST = "storepulse.p.rapidapi.com"


def search(query, country="us", lang="en"):
    key = os.environ["RAPIDAPI_KEY"]
    resp = requests.get(
        f"https://{HOST}/v1/search",
        params={"q": query, "country": country, "lang": lang},
        headers={"X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["results"]


def main():
    if len(sys.argv) < 2:
        sys.exit('usage: python search.py "<query>" [country] [lang]')
    query = sys.argv[1]
    country = sys.argv[2] if len(sys.argv) > 2 else "us"
    lang = sys.argv[3] if len(sys.argv) > 3 else "en"

    print(f'Top results for "{query}" in {country}:')
    for r in search(query, country, lang):
        score = r.get("score", "—")
        print(f"  #{r['rank']:>2}  {r['title']}  ({r['app_id']})  ★{score}")


if __name__ == "__main__":
    main()
