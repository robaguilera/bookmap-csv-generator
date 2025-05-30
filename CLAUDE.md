# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a trading pivots calculator for ES (E-mini S&P 500) and NQ (E-mini Nasdaq 100) futures contracts. It fetches market data from the InsightSentry API and generates CSV files with important price levels formatted for import into trading platforms.

## Commands

### Development
- `bun run index.ts` - Run the main script to generate CSV files
- `bun test` - Run all tests
- `bun install` - Install dependencies

### Environment Setup
Requires a `.env` file with:
```
RAPIDAPI_KEY=your_api_key_here
```

## Architecture

The application follows a modular architecture:

1. **Data Flow**: 
   - `index.ts` orchestrates the entire process
   - `src/dataService.ts` fetches and processes market data from the API
   - `src/csv.ts` generates OHLC (Open, High, Low, Close) CSV files
   - `src/pivots.ts` calculates Camarilla pivots and generates pivot CSV files

2. **API Integration**:
   - Uses RapidAPI's InsightSentry service via `src/api/insightsSentry.ts`
   - Implements caching in `data/historical/` to minimize API calls
   - Fetches both historical daily bars and current intraday data

3. **Output Structure**:
   - CSV files are generated in `csv/` directory
   - Separate subdirectories for `es/` and `nq/` futures
   - Pivot files stored in `csv/pivots/`
   - Each symbol gets its own CSV file with formatted price levels

4. **Key Price Levels Calculated**:
   - Previous Day: High (PDH), Low (PDL), Open (PDO), Close (PDC)
   - Overnight/Premarket: High (ONH), Low (ONL)
   - Camarilla Pivots: R6-R1 (resistance), CP (central pivot), S1-S6 (support)

## Important Notes

- The project uses Bun as the JavaScript runtime
- Pivot generation is currently commented out in `index.ts` (lines 17-21)
- Multiple trading symbols are processed for each futures contract
- CSV output format is specifically designed for trading platform import with Symbol, Price, Note, Color, and Text Alignment fields