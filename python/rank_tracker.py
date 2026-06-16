#!/usr/bin/env python3
"""Track where an app ranks for a keyword (ASO rank tracking) with StorePulse.

Search the store for a keyword and report the position of a specific app — the
core of any ASO / keyword rank-tracking workflow. Run it on a schedule and log
the rank over time.

StorePulse — Google Play app metadata, reviews, search rankings & charts as a
clean, cached JSON API. Stop maintaining your own Play scraper:
https://rapidapi.com/egosumkira/api/storepulse

Usage:
    export RAPIDAPI_KEY=...
    python rank_tracker.py "music streaming" com.spotify.music [country] [lang]
"""
import os
import sys
from datetime import datetime, timezone

import requests

HOST = "storepulse.p.rapidapi.com"


def find_rank(query, target_app_id, country="us", lang="en"):
    key = os.environ["RAPIDAPI_KEY"]
    resp = requests.get(
        f"https://{HOST}/v1/search",
        params={"q": query, "country": country, "lang": lang},
        headers={"X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST},
        timeout=30,
    )
    resp.raise_for_status()
    for r in resp.json()["results"]:
        if r["app_id"] == target_app_id:
            return r["rank"]
    return None  # not in the returned page of results


def main():
    if len(sys.argv) < 3:
        sys.exit('usage: python rank_tracker.py "<query>" <package_id> [country] [lang]')
    query = sys.argv[1]
    target = sys.argv[2]
    country = sys.argv[3] if len(sys.argv) > 3 else "us"
    lang = sys.argv[4] if len(sys.argv) > 4 else "en"

    rank = find_rank(query, target, country, lang)
    now = datetime.now(timezone.utc).isoformat()
    if rank is None:
        print(f"{now}  {target}  query={query!r}  country={country}  rank=NOT_FOUND")
    else:
        print(f"{now}  {target}  query={query!r}  country={country}  rank={rank}")


if __name__ == "__main__":
    main()
