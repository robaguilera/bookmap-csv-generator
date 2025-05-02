# Overview
The purpose of this project is create CSV files from market data. The data will be provided via APIs. This script will be run automatically or at will via some 3rd party service (github actions for the moment). We're going to create individual CSV files for the ES and NQ with the following data:

1. Overnight high and low, previous day open, low and close
2. Camarilla pivot points

Each Future will have it's own file with it's own calculations. In the tests folder are samples of what we're going to create and the data we're going to get back from the APIs.

The current flow will be as follows:
- the current CSV files are copied and stored into an `archive` folder
- an api call is initiated to the futures data provider (service TBD) for the ES
- after the data is retrieved and the values are calculated we overwrite the current CSV files with the new data for today
- the process is then repeated for the NQ

# Dev Notes

## Calculating the Camarilla Pivot Points
The calculation for the Camarilla Pivot Points are as follows:

### Without Premarket Data
```
Variables:
- highValue = Previous period's high
- lowValue = Previous period's low
- closeValue = Previous period's close
- range = highValue - lowValue
```
```
// without premarket data
R6 = (highValue / lowValue) * closeValue
R5 = (closeValue + range * 1.1 / 2) + 1.168 * ((closeValue + range * 1.1 / 2) - (closeValue + range * 1.1 / 4))
R4a = closeValue + range * 1.098 / 2
R4 = closeValue + range * 1.1 / 2
R3 = closeValue + range * 1.1 / 4
R2 = closeValue + range * 1.1 / 6
R1 = closeValue + range * 1.1 / 12

S1 = closeValue - range * 1.1 / 12
S2 = closeValue - range * 1.1 / 6
S3 = closeValue - range * 1.1 / 4
S4 = closeValue - range * 1.1 / 2
S4a = closeValue - range * 1.098 / 2
S5 = (closeValue - range * 1.1 / 2) - 1.168 * ((closeValue - range * 1.1 / 4) - (closeValue - range * 1.1 / 2))
S6 = closeValue - (R6 - closeValue)
```

### With Premarket Data
```
Premarket Variables:
- priorGBXhigh = Premarket high
- priorGBXlow = Premarket low
- gxClose = Premarket close
- rangew = priorGBXhigh - priorGBXlow
```
```
R6w = (priorGBXhigh / priorGBXlow) * gxClose
R5w = (gxClose + rangew * 1.1 / 2) + 1.168 * ((gxClose + rangew * 1.1 / 2) - (gxClose + rangew * 1.1 / 4))
R4wa = gxClose + rangew * 1.098 / 2
R4w = gxClose + rangew * 1.1 / 2
R3w = gxClose + rangew * 1.1 / 4
R2w = gxClose + rangew * 1.1 / 6
R1w = gxClose + rangew * 1.1 / 12

S1w = gxClose - rangew * 1.1 / 12
S2w = gxClose - rangew * 1.1 / 6
S3w = gxClose - rangew * 1.1 / 4
S4w = gxClose - rangew * 1.1 / 2
S4wa = gxClose - rangew * 1.098 / 2
S5w = (gxClose - rangew * 1.1 / 2) - 1.168 * ((gxClose - rangew * 1.1 / 4) - (gxClose - rangew * 1.1 / 2))
S6w = gxClose - (R6w - gxClose)
```

How we determine when to use premarket data or not in calculating the pivot points depends if the Globex (premarket/extended hours) high is higher than the prior day’s high, or the Globex low is lower than the prior day’s low, if so we do use premarket data.

## APIs
The APIs we're using are a limited in funtionality so we're not going to be able to rely on them for all our needs but we'll have to store data as well as use the api.

For example, one of the apis give us historical data but it gives us years worth of data and we can't filter it down to only a day.

Another API gives us intraday data but we can't scope the results to a specific time frame. We have to know how many intervals we need.

So what we'll need to do is store in a file the previous day's data and then use the APIs to supplement the current intraday data.

Please see `04-api-specs.md` for more details.

## Testing
We will need tests to ensure that we're calculating not only the correct formulas but the test utilities that will modify data and files.

## Project Structure

| File/Directory                       | Description                                                       |
|--------------------------------------|-------------------------------------------------------------------|
| `csv/`                               | Directory containing the generated CSV files.                     |
| `data/historical/CME_MINI:ES1!.json` | Historical data for ES future.                                    |
| `src/api.ts`                         | Contains functions for fetching OHLCV and historical data         |
| `src/csv.ts`                         | Contains functions for generating CSV files from historical data. |
| `src/test.ts`                        | Script for testing API endpoints.                                 |
| `tests/index_test.ts`                | Tests for API and CSV generation functions.                       |
| `tests/sample_ohlcv.csv`             | Sample OHLCV CSV file for testing.                                |
| `tests/sample_pivots.csv`            | Sample pivots CSV file for testing.                               |
| `tests/test.json`                    | Test data.                                                        |

## Architectual Patterns
Please see the following for directions on conventions I prefer.

### � File Conventions
- **Use named exports over default exports**
- **Exports go at the bottom of the file**
- **Properly add types** whenever it makes sense
- **Prefer absolute imports** over relative imports

### �📎 Style & Conventions
- **Follow the Airbnb style guide**
- **Use Typescript** as the primary language.
- **Document functions using JSDoc** when appropriate
- **Add inline comments** if a function or logic is complex otherwise avoid
