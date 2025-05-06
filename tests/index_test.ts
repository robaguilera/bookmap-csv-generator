import { beforeAll, expect, test } from "bun:test";
import fs from "node:fs/promises";
import { join } from "node:path";

import { insightsSentryApi } from "../src/api/insightsSentry";
import { getPreviousDayOHLC, saveHistoricalData } from "../src/dataService";

import type { HistoricalData } from "../src/api/apiAdapter";

beforeAll(async () => {
	try {
		await fs.mkdir("test_data/historical", { recursive: true });
	} catch (error) {
		console.error("Error creating test directory:", error);
	}
});

test("storeHistoricalData stores data to file", async () => {
	const symbol = "CME_MINI:ES1!";
	const filePath = join("./test_data/historical", `${symbol}.json`);
	const mockHistoricalData = {
		code: symbol,
		bar_end: 1672531200,
		last_update: 1672531200000,
		bar_type: "1D",
		series: [
			{
				time: 1672531200,
				open: 100,
				high: 120,
				low: 90,
				close: 110,
				volume: 1000,
			},
		],
	};

	// Ensure the file doesn't exist before the test
	try {
		await fs.unlink(filePath);
	} catch (error: unknown) {
		if ((error as { code: string }).code !== "ENOENT") {
			throw error;
		}
	}

	// Call storeHistoricalData
	await saveHistoricalData(
		symbol,
		mockHistoricalData,
		"./test_data/historical",
	);

	// Check if the file exists after the function call
	try {
		await fs.access(filePath);
	} catch (error) {
		expect(error).toBeNull();
	}

	// Clean up the file after the test
	await fs.unlink(filePath);
});

test("getPreviousDayOHLC returns the previous day's OHLC data", async () => {
	const symbol = "CME_MINI:ES1!";
	const mockHistoricalData = {
		code: symbol,
		bar_end: 1672531200,
		last_update: 1672531200000,
		bar_type: "1D",
		series: [
			{
				time: 1672531100,
				open: 90,
				high: 100,
				low: 80,
				close: 95,
				volume: 1300,
			},
			{
				time: 1672531200,
				open: 100,
				high: 120,
				low: 90,
				close: 110,
				volume: 1000,
			},
			{
				time: 1672617600,
				open: 110,
				high: 130,
				low: 100,
				close: 120,
				volume: 1100,
			},
		],
	};

	const originalFetchHistoricalData = insightsSentryApi.fetchHistoricalData;

	insightsSentryApi.fetchHistoricalData = () =>
		Promise.resolve(mockHistoricalData);

	const previousDayOHLC = await getPreviousDayOHLC(symbol);

	expect(previousDayOHLC).toEqual(
		mockHistoricalData.series[1] as HistoricalData,
	);

	insightsSentryApi.fetchHistoricalData = originalFetchHistoricalData;
});

test("getCurrentDayPremarketHighLow returns correct high/low from premarket data", async () => {
	const symbol = "CME_MINI:ES1!";
	// Mock data with timestamps before and after 14:30 UTC
	const now = new Date();
	const cutoffTime = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
		14,
		30,
		0,
		0,
	);
	const premarketTime1 = Math.floor((cutoffTime - 120 * 60 * 1000) / 1000); // 2 hours before cutoff
	const premarketTime2 = Math.floor((cutoffTime - 60 * 60 * 1000) / 1000); // 1 hour before cutoff
	const postmarketTime = Math.floor((cutoffTime + 60 * 60 * 1000) / 1000); // 1 hour after cutoff

	const mockOhlcvData = {
		code: symbol,
		bar_end: postmarketTime,
		last_update: Date.now(),
		bar_type: "minute",
		series: [
			{
				time: premarketTime1,
				open: 100,
				high: 105,
				low: 95,
				close: 102,
				volume: 10,
			}, // Premarket
			{
				time: premarketTime2,
				open: 102,
				high: 110,
				low: 101,
				close: 108,
				volume: 15,
			}, // Premarket - Highest high
			{
				time: cutoffTime,
				open: 108,
				high: 109,
				low: 90,
				close: 92,
				volume: 20,
			}, // At cutoff - Lowest low (should be included if logic changes)
			{
				time: postmarketTime,
				open: 92,
				high: 115,
				low: 91,
				close: 112,
				volume: 25,
			}, // Postmarket (should be ignored)
		],
	};

	const originalFetchOhlcv = insightsSentryApi.fetchOhlcv;
	// Mock fetchOhlcv to return the specific minute data
	insightsSentryApi.fetchOhlcv = (sym, type, interval) => {
		expect(sym).toBe(symbol);
		expect(type).toBe("minute");
		expect(interval).toBe(1);
		return Promise.resolve(mockOhlcvData);
	};

	const { getCurrentDayPremarketHighLow } = await import("../src/dataService");
	const highLow = await getCurrentDayPremarketHighLow(symbol);

	// Should only consider premarketTime1 and premarketTime2
	expect(highLow).toEqual({ high: 110, low: 95 });

	insightsSentryApi.fetchOhlcv = originalFetchOhlcv; // Restore original function
});

test("getCurrentDayPremarketHighLow returns undefined if only postmarket data exists", async () => {
	const symbol = "CME_MINI:ES1!";
	const now = new Date();
	const cutoffTime = Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate(),
		14,
		30,
		0,
		0,
	);
	const postmarketTime = Math.floor((cutoffTime + 60 * 60 * 1000) / 1000);

	const mockOhlcvData = {
		code: symbol,
		bar_end: postmarketTime,
		last_update: Date.now(),
		bar_type: "minute",
		series: [
			{
				time: postmarketTime,
				open: 92,
				high: 115,
				low: 91,
				close: 112,
				volume: 25,
			},
		],
	};

	const originalFetchOhlcv = insightsSentryApi.fetchOhlcv;
	insightsSentryApi.fetchOhlcv = () => Promise.resolve(mockOhlcvData);

	const { getCurrentDayPremarketHighLow } = await import("../src/dataService");
	const highLow = await getCurrentDayPremarketHighLow(symbol);

	expect(highLow).toBeUndefined();

	insightsSentryApi.fetchOhlcv = originalFetchOhlcv;
});

test("getCurrentDayPremarketHighLow returns undefined for empty series", async () => {
	const symbol = "CME_MINI:ES1!";
	const mockOhlcvData = {
		code: symbol,
		bar_end: 1672531200, // Example timestamp
		last_update: Date.now(),
		bar_type: "minute",
		series: [],
	};

	const originalFetchOhlcv = insightsSentryApi.fetchOhlcv;
	insightsSentryApi.fetchOhlcv = () => Promise.resolve(mockOhlcvData);

	const { getCurrentDayPremarketHighLow } = await import("../src/dataService");
	const highLow = await getCurrentDayPremarketHighLow(symbol);

	expect(highLow).toBeUndefined();

	insightsSentryApi.fetchOhlcv = originalFetchOhlcv;
});

test("generateOhlcCSV generates CSV file", async () => {
	const symbol = "CME_MINI:ES1!";
	const filePath = join("csv", `${symbol}.csv`);

	// Ensure the directory exists
	try {
		await fs.mkdir("csv", { recursive: true });
	} catch (error) {
		// Ignore
	}

	// Ensure the file doesn't exist before the test
	try {
		await fs.unlink(filePath);
	} catch (error: unknown) {
		if ((error as { code: string }).code !== "ENOENT") {
			throw error;
		}
	}

	const { generateOhlcCSV } = await import("../src/csv");

	await generateOhlcCSV(symbol);

	// Check if the file exists after the function call
	try {
		await fs.access(filePath);
	} catch (error) {
		expect(error).toBeNull();
	}

	const historicalDataFile = await fs.readFile(
		join("./data/historical", "CME_MINI:ES1!.json"),
		"utf-8",
	);
	const historicalData = JSON.parse(historicalDataFile);
	const lastDay = historicalData.series[historicalData.series.length - 1];

	const expectedCsvContent = `Symbol,Price Level,Note,Foreground Color,Background Color,Text Alignment,Draw Note Price Horizontal Line
	CME_MINI:ES1!,${lastDay.high},PDH,#ffffff,#FF00FF,right,TRUE
	CME_MINI:ES1!,${lastDay.close},PDC,#ffffff,#FF00FF,right,TRUE
	CME_MINI:ES1!,${lastDay.low},PDL,#ffffff,#FF00FF,right,TRUE
	CME_MINI:ES1!,${lastDay.open},PDO,#ffffff,#FF00FF,right,TRUE`;

	const fileContent = await fs.readFile(filePath, "utf-8");

	// Normalize whitespace
	const normalizedExpected = expectedCsvContent.replace(/\s/g, "");
	const normalizedReceived = fileContent.replace(/\s/g, "");

	expect(normalizedReceived).toBe(normalizedExpected);

	// Clean up the file after the test
	await fs.unlink(filePath);
});
