from datetime import datetime as dt
import json
import pandas as pd
import requests
from typing import Union


ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co"
ALPHA_VANTAGE_TIME_SERIES_FUNC = "TIME_SERIES_DAILY_ADJUSTED"
COLUMNS = ["Date", "Open", "High", "Low", "Close", "Volume", "AdjClose"]

class AlphaVantage:
    """
    Encapsulates calls to the Alpha Vantage API with a provided API key.
    """

    def __init__(self, api_key: str = "XI1HLJDZAEDM22FA") -> None:
        """
        Initialize the AlphaVantage instance.

        Parameters
        ----------
        api_key : str, optional
            The API key for the associated Alpha Vantage account.
        """
        self.api_key = api_key

    def _construct_alpha_vantage_symbol_call(self, ticker: str) -> str:
        """
        Construct the full API call to Alpha Vantage based on the user
        provided API key and the desired ticker symbol.

        Parameters
        ----------
        ticker : str
            The ticker symbol, e.g. 'AAPL'

        Returns
        -------
        str
            The full API URL for a ticker time series.
        """
        return (
            f"{ALPHA_VANTAGE_BASE_URL}/query?"
            f"function={ALPHA_VANTAGE_TIME_SERIES_FUNC}"
            f"&symbol={ticker}&outputsize=full&apikey={self.api_key}"
        )

    def get_daily_historic_data(
        self,
        ticker: str,
        start_date: Union[dt, str],
        end_date: Union[dt, str],
    ) -> pd.DataFrame:
        """
        Query Alpha Vantage and return a DataFrame of OHLCV prices for a ticker.

        Parameters
        ----------
        ticker : str
            Ticker symbol, e.g. 'AAPL'
        start_date : datetime or 'YYYY-MM-DD'
            Starting date (inclusive)
        end_date : datetime or 'YYYY-MM-DD'
            Ending date (inclusive)

        Returns
        -------
        pd.DataFrame
            DataFrame with columns: Date, Open, High, Low, Close, Volume, AdjClose
            indexed by Date.
        """
        if isinstance(start_date, str):
            start_date = dt.strptime(start_date, "%Y-%m-%d")
        if isinstance(end_date, str):
            end_date = dt.strptime(end_date, "%Y-%m-%d")

        av_url = self._construct_alpha_vantage_symbol_call(ticker)

        try:
            resp = requests.get(av_url, timeout=30)
            resp.raise_for_status()
            js = resp.json()
            data = js.get("Time Series (Daily)")
            if data is None:
                # Handle API notes/errors (rate limits, invalid key, etc.)
                msg = js.get("Note") or js.get("Error Message") or "Unknown API response."
                raise RuntimeError(msg)
        except Exception as e:
            print(f"Could not download Alpha Vantage data for {ticker} ({e})... stopping.")
            return pd.DataFrame(columns=COLUMNS).set_index("Date")

        prices = []
        for date_str in sorted(data.keys()):
            date = dt.strptime(date_str, "%Y-%m-%d")
            if date < start_date or date > end_date:
                continue
            bar = data[date_str]
            prices.append(
                (
                    date,
                    float(bar["1. open"]),
                    float(bar["2. high"]),
                    float(bar["3. low"]),
                    float(bar["4. close"]),
                    int(bar["6. volume"]),
                    float(bar["5. adjusted close"]),
                )
            )

        df = pd.DataFrame(prices, columns=COLUMNS).set_index("Date")
        return df