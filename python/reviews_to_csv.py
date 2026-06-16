#!/usr/bin/env python3
"""Export Google Play reviews to CSV (for sentiment / analysis) with StorePulse.

Pages through reviews using the opaque `cursor` -> `next_cursor` token and writes
each review as a CSV row. Ready to load into pandas, a spreadsheet, or an NLP
pipeline.

StorePulse — Google Play app metadata, reviews, search rankings & charts as a
clean, cached JSON API. Stop maintaining your own Play scraper:
https://rapidapi.com/  (search "StorePulse")

Usage:
    export RAPIDAPI_KEY=...
    python reviews_to_csv.py com.zhiliaoapp.musically reviews.csv --pages 3
"""
import argparse
import csv
import os

import requests

HOST = "storepulse.p.rapidapi.com"
FIELDS = ["id", "author", "rating", "date", "version", "thumbs_up", "text"]


def fetch_page(package_id, sort, cursor, country, lang):
    key = os.environ["RAPIDAPI_KEY"]
    params = {"id": package_id, "sort": sort, "country": country, "lang": lang}
    if cursor:
        params["cursor"] = cursor
    resp = requests.get(
        f"https://{HOST}/v1/reviews",
        params=params,
        headers={"X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("reviews", []), data.get("next_cursor")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("package_id")
    ap.add_argument("outfile")
    ap.add_argument("--pages", type=int, default=1, help="max pages to fetch")
    ap.add_argument("--sort", default="newest", choices=["newest", "rating", "helpfulness"])
    ap.add_argument("--country", default="us")
    ap.add_argument("--lang", default="en")
    args = ap.parse_args()

    cursor = None
    total = 0
    with open(args.outfile, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        for page in range(args.pages):
            reviews, cursor = fetch_page(
                args.package_id, args.sort, cursor, args.country, args.lang
            )
            for review in reviews:
                writer.writerow(review)
            total += len(reviews)
            print(f"page {page + 1}: {len(reviews)} reviews")
            if not cursor:
                break  # last page reached

    print(f"wrote {total} reviews to {args.outfile}")


if __name__ == "__main__":
    main()
