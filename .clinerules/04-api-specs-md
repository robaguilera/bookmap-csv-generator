# API Specs

This file will house the apis and their specs for ease of reference.

The symbols to fetch the data will be CME_MINI:ES1! (ES) and CME_MINI:NQ1! (NQ).

## OHLCV

This endpoint returns the latest series data for a given symbol code.

### Response
The response will include the following fields:

```
bar_end: The end time of the last bar.
bar_type: The type of bar (e.g., 1s for one second, 5m for 5 minute, one day for 1D).
series - close: The last price

```

### Params

HEADERS

```
X-RapidAPI-Key: {{apikey}}
```

PARAMS
```
bar_type: second

(Optional) Bar type. The default is day. Allowed values: second, minute, hour, day, week, month.

bar_interval: 1

(Optional) Bar Interval. Default is 1.

extended: true

(Optional) The default value is true. If set to true, the data will include extended hours.

dadj: false

(Optional) The default value is false. If set to true, the data will be adjusted for dividends.

badj: true

(Optional) Back-adjustment for continuous futures contracts. Default value is true
```

PATH VARIABLES

```
symbol: CME_MINI:ES1!
```

```bash
curl --request GET \
	--url 'https://insightsentry.p.rapidapi.com/v2/symbols/CME_MINI:NQ1!/series?bar_type=day&bar_interval=1&extended=true&badj=true&dadj=false' \
	--header 'x-rapidapi-host: insightsentry.p.rapidapi.com' \
	--header 'x-rapidapi-key: {apiKey}'
```

```json
{
  "code": "CME_MINI:NQ1!",
  "bar_end": 1746139964,
  "last_update": 1746139973691,
  "bar_type": "1s",
  "series": [
    {
      "time": 1746139963,
      "open": 19791.25,
      "high": 19791.25,
      "low": 19791.25,
      "close": 19791.25,
      "volume": 1
    }
  ]
}
```

## Historical Data

This endpoint returns historical data for a specific symbol code. All available data for all available data for non-intraday interval and up to 20k data points for intraday interval. As for continous Futures contracts, by default back-adjustment is on. To turn off back-adjustment, pass 'badj=false' in query parameter.

### Response
The response will include the following fields:

```
bar_end: The end time for the current bar.
bar_type: The type of bar. (e.g., 1s for one second, 5m for 5 minute, one day for 1D)
series - close: The closing price of the bar.
```

### Params

HEADERS

```
X-RapidAPI-Key: {{apikey}}
```

PARAMS
```
bar_type: second

(Optional) Bar type. The default is day. Allowed values: second, minute, hour, day, week, month.

bar_interval: 1

(Optional) Bar Interval. Default is 1.

extended: true

(Optional) The default value is true. If set to true, the data will include extended hours.

dadj: false

(Optional) The default value is false. If set to true, the data will be adjusted for dividends.

badj: true

(Optional) Back-adjustment for continuous futures contracts. Default value is true
```

PATH VARIABLES

```
symbol: CME_MINI:ES1!
```


```bash
curl --request GET \
	--url 'https://insightsentry.p.rapidapi.com/v2/symbols/CME_MINI:NQ1!/history?bar_interval=1&bar_type=day&extended=true&badj=true&dadj=false' \
	--header 'x-rapidapi-host: insightsentry.p.rapidapi.com' \
	--header 'x-rapidapi-key: {apiKey}'
```

### Response
```json
{
	"code": "TEST_MARKET:TEST_INSTRUMENT",
	"bar_end": 1739491200,
	"last_update": 1739454721532,
	"bar_type": "1D",
	"series": [
		{
			"time": 1502928000,
			"open": 4261.48,
			"high": 4485.39,
			"low": 4200.74,
			"close": 4285.08,
			"volume": 795
		},
		{
			"time": 1503014400,
			"open": 4285.08,
			"high": 4371.52,
			"low": 3938.77,
			"close": 4108.37,
			"volume": 1199
		},
		{
			"time": 1503100800,
			"open": 4108.37,
			"high": 4184.69,
			"low": 3850,
			"close": 4139.98,
			"volume": 381
		},
		{
			"time": 1503187200,
			"open": 4120.98,
			"high": 4211.08,
			"low": 4032.62,
			"close": 4086.29,
			"volume": 467
		},
		{
			"time": 1503273600,
			"open": 4069.13,
			"high": 4119.62,
			"low": 3911.79,
			"close": 4016,
			"volume": 691
		},
		{
			"time": 1503360000,
			"open": 4016,
			"high": 4104.82,
			"low": 3400,
			"close": 4040,
			"volume": 966
		},
		{
			"time": 1503446400,
			"open": 4040,
			"high": 4265.8,
			"low": 4013.89,
			"close": 4114.01,
			"volume": 1001
		},
		{
			"time": 1503532800,
			"open": 4147,
			"high": 4371.68,
			"low": 4085.01,
			"close": 4316.01,
			"volume": 787
		},
		{
			"time": 1503619200,
			"open": 4316.01,
			"high": 4453.91,
			"low": 4247.48,
			"close": 4280.68,
			"volume": 573
		},
		{
			"time": 1503705600,
			"open": 4280.71,
			"high": 4367,
			"low": 4212.41,
			"close": 4337.44,
			"volume": 228
		}
	]
}

```