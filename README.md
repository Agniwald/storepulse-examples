# StorePulse examples

Short, copy-paste scripts for the **StorePulse** API — Google Play app metadata,
reviews, search rankings, and top charts as clean JSON.

> **Stop maintaining your own Play scraper.** A free library can scrape the Play
> Store today and break next week when the HTML changes. StorePulse is the hosted,
> cached, rate-limited version someone else keeps working — billed through an
> account you already have.
>
> **Get a key:** subscribe (free tier available) on RapidAPI →
> https://rapidapi.com/ (search "StorePulse" / "Google Play Data").

## Setup

Every script reads your RapidAPI key from the `RAPIDAPI_KEY` environment variable.

```bash
# macOS / Linux
export RAPIDAPI_KEY="your-rapidapi-key"

# Windows PowerShell
$env:RAPIDAPI_KEY = "your-rapidapi-key"
```

The free (BASIC) tier gives 500 requests/month — plenty to run everything here.

## One-line smoke test

```bash
curl --url 'https://storepulse.p.rapidapi.com/v1/app?id=com.spotify.music&country=us' \
  -H "X-RapidAPI-Key: $RAPIDAPI_KEY" \
  -H 'X-RapidAPI-Host: storepulse.p.rapidapi.com'
```

A `200` with JSON in ~10 seconds means you're ready.

## The scripts

| Script | What it does |
|---|---|
| `app_metadata` | Look up full metadata for one app by package id. |
| `search`       | Ranked search results for a keyword. |
| `rank_tracker` | Find where a specific app ranks for a keyword (ASO rank tracking). |
| `reviews_to_csv` | Page through reviews with the cursor and write them to a CSV. |
| `chart_snapshot` | Pull a top-chart (free/paid/grossing) for a category. |

Each exists in both **Python** (`python/`) and **Node** (`node/`).

### Python

Requires Python 3.8+.

```bash
cd python
pip install -r requirements.txt

python app_metadata.py com.spotify.music
python search.py spotify
python rank_tracker.py spotify com.spotify.music
python reviews_to_csv.py com.zhiliaoapp.musically reviews.csv --pages 3
python chart_snapshot.py top_free APPLICATION
```

### Node

Requires Node 18+ (uses the built-in `fetch` — no dependencies to install).

```bash
cd node

node app_metadata.js com.spotify.music
node search.js spotify
node rank_tracker.js spotify com.spotify.music
node reviews_to_csv.js com.zhiliaoapp.musically reviews.csv 3
node chart_snapshot.js top_free APPLICATION
```

## Endpoints used

| Endpoint | Returns |
|---|---|
| `GET /v1/app` | Full app metadata. |
| `GET /v1/reviews` | Paginated reviews (`cursor` / `next_cursor`). |
| `GET /v1/search` | Ranked search results (`rank` per result). |
| `GET /v1/charts` | Top-chart entries with `rank`. |

All endpoints accept `country` (ISO-3166 alpha-2, default `us`) and `lang`
(default `en`). Scores, prices, and rankings vary by country.

## License

MIT — see [LICENSE](LICENSE). Use these freely in your own projects.
