#!/usr/bin/env python3
"""Look up full Google Play app metadata with StorePulse.

StorePulse — Google Play app metadata, reviews, search rankings & charts as a
clean, cached JSON API. Stop maintaining your own Play scraper:
https://rapidapi.com/egosumkira/api/storepulse

Usage:
    export RAPIDAPI_KEY=...
    python app_metadata.py com.spotify.music [country] [lang]
"""
import os
import sys
import requests

HOST = "storepulse.p.rapidapi.com"


def get_app(package_id, country="us", lang="en"):
    key = os.environ["RAPIDAPI_KEY"]
    resp = requests.get(
        f"https://{HOST}/v1/app",
        params={"id": package_id, "country": country, "lang": lang},
        headers={"X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: python app_metadata.py <package_id> [country] [lang]")
    package_id = sys.argv[1]
    country = sys.argv[2] if len(sys.argv) > 2 else "us"
    lang = sys.argv[3] if len(sys.argv) > 3 else "en"

    app = get_app(package_id, country, lang)
    print(f"{app['title']}  ({app['id']})")
    print(f"  developer: {app.get('developer')}")
    print(f"  score:     {app.get('score')}  ({app.get('ratings')} ratings)")
    print(f"  installs:  {app.get('installs')}")
    print(f"  genre:     {app.get('genre')}")
    print(f"  version:   {app.get('version')}")
    print(f"  free:      {app.get('free')}")


if __name__ == "__main__":
    main()
