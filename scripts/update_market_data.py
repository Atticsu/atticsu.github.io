"""
Pulls daily prices from Alpha Vantage for the current portfolio and updates:
- public/data/net_values.csv (daily net value series)
- public/data/portfolio.csv (live weights recalculated from latest prices)

Usage:
  python scripts/update_market_data.py

Environment:
- Reads API key from ALPHA_VANTAGE_API_KEY or public/price/api_key.txt
- Respects Alpha Vantage free-tier limits (5 calls/min); keeps a pause between calls.
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, List

import pandas as pd

# Paths
ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DATA_DIR = PUBLIC / "data"
PRICE_DIR = PUBLIC / "price"
API_KEY_PATH = PRICE_DIR / "api_key.txt"
BASE_PORTFOLIO_PATH = DATA_DIR / "portfolio_base.csv"
LIVE_PORTFOLIO_PATH = DATA_DIR / "portfolio.csv"
NET_VALUES_PATH = DATA_DIR / "net_values.csv"
META_PATH = DATA_DIR / "portfolio_base_meta.json"

# Alpha Vantage rate limit: 5 requests/min -> use a safe pause between calls
REQUEST_SLEEP_SECONDS = 15

# Allow importing the provided Alpha Vantage helper
sys.path.append(str(PRICE_DIR))
try:
  from alpha_vantage import AlphaVantage  # type: ignore
except Exception as exc:
  raise SystemExit(f"Failed to import alpha_vantage helper: {exc}")


def load_api_key() -> str:
  env_key = os.getenv("ALPHA_VANTAGE_API_KEY")
  if env_key:
    return env_key.strip()
  if API_KEY_PATH.exists():
    return API_KEY_PATH.read_text().strip()
  raise SystemExit("Missing API key. Set ALPHA_VANTAGE_API_KEY or create public/price/api_key.txt")


def load_rebalance_date() -> date:
  if not META_PATH.exists():
    raise SystemExit(f"Missing meta file with rebalance date: {META_PATH}")
  meta = json.loads(META_PATH.read_text())
  rebalance_str = meta.get("rebalance_date")
  if not rebalance_str:
    raise SystemExit("rebalance_date not found in portfolio_base_meta.json")
  return datetime.strptime(rebalance_str, "%Y-%m-%d").date()


def load_base_portfolio() -> pd.DataFrame:
  if not BASE_PORTFOLIO_PATH.exists():
    raise SystemExit(f"Base portfolio file not found: {BASE_PORTFOLIO_PATH}")
  df = pd.read_csv(BASE_PORTFOLIO_PATH)
  if "ticker" not in df.columns or "weight" not in df.columns:
    raise SystemExit("Base portfolio must include 'ticker' and 'weight' columns")
  df["weight"] = df["weight"].astype(float)
  if df["weight"].sum() <= 0:
    raise SystemExit("Base portfolio weights must sum to a positive number")
  df["weight_frac"] = df["weight"] / df["weight"].sum()
  df = df.set_index("ticker", drop=False)
  return df


def fetch_prices(
    tickers: List[str],
    start_date: date,
    end_date: date,
    api_key: str,
    sleep_seconds: int = REQUEST_SLEEP_SECONDS,
) -> pd.DataFrame:
  """Fetch adjusted close prices for tickers between start_date and end_date (inclusive)."""
  client = AlphaVantage(api_key=api_key)
  series_map: Dict[str, pd.Series] = {}
  # Pull a small buffer before start_date to ensure we have the first trading day
  padded_start = start_date - timedelta(days=7)
  for i, ticker in enumerate(tickers):
    print(f"[{i+1}/{len(tickers)}] Fetching {ticker} from Alpha Vantage...")
    df = client.get_daily_historic_data(
      ticker=ticker,
      start_date=datetime.combine(padded_start, datetime.min.time()),
      end_date=datetime.combine(end_date, datetime.min.time()),
    )
    if df.empty:
      raise SystemExit(f"No data returned for {ticker}; aborting update.")
    # Normalize index to date
    series = df["AdjClose"]
    series.index = pd.to_datetime(series.index).date
    # Only keep requested window
    series = series[(series.index >= start_date) & (series.index <= end_date)]
    if series.empty:
      raise SystemExit(f"No data in requested window for {ticker}")
    series_map[ticker] = series
    if i < len(tickers) - 1:
      time.sleep(sleep_seconds)

  # Align by intersection of dates to keep only days where every ticker has data
  frame = pd.concat(series_map, axis=1, join="inner").sort_index()
  if frame.empty:
    raise SystemExit("No overlapping trading days across tickers.")
  frame.index = pd.to_datetime(frame.index).date
  frame.columns = tickers
  return frame


def compute_net_values(price_frame: pd.DataFrame, base_weights: pd.Series, start_value: float) -> pd.DataFrame:
  """
  Compute normalized net values and daily pct_change scaled to a starting value.
  """
  base_prices = price_frame.iloc[0]
  rel_prices = price_frame.divide(base_prices)
  weighted = rel_prices.multiply(base_weights, axis=1)
  portfolio_value = weighted.sum(axis=1)
  net_value = (portfolio_value / portfolio_value.iloc[0]) * start_value
  pct_change = net_value.pct_change(fill_method=None).fillna(0.0)
  out = pd.DataFrame(
    {
      "date": [d.strftime("%Y-%m-%d") for d in pd.to_datetime(net_value.index)],
      "net_value": net_value.values,
      "pct_change": pct_change.values,
    }
  )
  return out


def update_live_weights(base_portfolio: pd.DataFrame, price_frame: pd.DataFrame) -> pd.DataFrame:
  base_prices = price_frame.iloc[0]
  latest_prices = price_frame.iloc[-1]
  latest_values = base_portfolio["weight_frac"] * (latest_prices / base_prices)
  latest_weights = latest_values / latest_values.sum()
  updated = base_portfolio.copy()
  updated["weight"] = (latest_weights * 100).round(4)
  # Keep only the original columns for the public CSV
  cols = [c for c in ["ticker", "stock_name", "weight", "reason"] if c in updated.columns]
  return updated[cols]


def write_csv(df: pd.DataFrame, path: Path) -> None:
  path.parent.mkdir(parents=True, exist_ok=True)
  df.to_csv(path, index=False)
  print(f"Wrote {path}")


def main() -> None:
  api_key = load_api_key()
  rebalance_date = load_rebalance_date()
  base_portfolio = load_base_portfolio()

  # Prefer the longest history: if both public and old_web exist, pick the one with earliest start date
  existing_candidates = []
  if NET_VALUES_PATH.exists():
    existing_candidates.append(NET_VALUES_PATH)
  legacy_path = ROOT / "old_web" / "atticsu.github.io-main" / "data" / "net_values.csv"
  if legacy_path.exists():
    existing_candidates.append(legacy_path)

  existing_df = None
  if existing_candidates:
    def load_net_values(path: Path) -> pd.DataFrame:
      df = pd.read_csv(path)
      df["date"] = pd.to_datetime(df["date"]).dt.date
      df = df.sort_values("date").drop_duplicates(subset="date", keep="last")
      return df

    loaded = [load_net_values(p) for p in existing_candidates]
    # choose earliest start date (longest history)
    chosen = min(loaded, key=lambda d: d["date"].min())
    existing_df = chosen

  today = date.today()

  if existing_df is not None and not existing_df.empty:
    last_row = existing_df.iloc[-1]
    last_date = last_row["date"]
    last_value = float(last_row["net_value"])
    if today <= last_date:
      print("Net values already up to date; nothing to append.")
      return
    start_date = max(rebalance_date, last_date)
    tickers = base_portfolio["ticker"].tolist()
    price_frame = fetch_prices(tickers, start_date, today, api_key=api_key)
    net_values = compute_net_values(price_frame, base_portfolio["weight_frac"], start_value=last_value)
    # drop the first row (duplicate last_date) before appending
    new_rows = net_values.iloc[1:].reset_index(drop=True)
    combined = pd.concat([existing_df, new_rows], ignore_index=True)
    write_csv(combined, NET_VALUES_PATH)
  else:
    if today <= rebalance_date:
      raise SystemExit("Today is before or on the rebalance date; nothing to update.")
    tickers = base_portfolio["ticker"].tolist()
    price_frame = fetch_prices(tickers, rebalance_date, today, api_key=api_key)
    net_values = compute_net_values(price_frame, base_portfolio["weight_frac"], start_value=1.0)
    write_csv(net_values, NET_VALUES_PATH)

  # Always refresh live weights using latest prices
  tickers = base_portfolio["ticker"].tolist()
  price_frame_for_weights = fetch_prices(tickers, rebalance_date, today, api_key=api_key)
  live_portfolio = update_live_weights(base_portfolio, price_frame_for_weights)
  write_csv(live_portfolio, LIVE_PORTFOLIO_PATH)


if __name__ == "__main__":
  main()
