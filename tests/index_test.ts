import { beforeAll, expect, mock, test } from "bun:test";
import fs from "node:fs/promises";
import { join } from "node:path";
import {
	fetchHistoricalData,
	fetchOhlcv,
	storeHistoricalData,
} from "../src/api";

beforeAll(async () => {
	try {
		await fs.mkdir("test_data/historical", { recursive: true });
	} catch (error) {
		console.error("Error creating test directory:", error);
	}
});

// Mock API calls
mock(() => ({
	fetchOhlcv: async (symbol: string) => {
		return {
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
	},
	fetchHistoricalData: async (symbol: string) => {
		return {
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
	},
}));

test("fetchOhlcv returns data", async () => {
	const data = await fetchOhlcv("CME_MINI:ES1!");
	expect(data).toBeDefined();
	expect(data.series.length).toBeGreaterThan(0);
});

test("fetchHistoricalData returns data", async () => {
	const data = await fetchHistoricalData("CME_MINI:ES1!");
	expect(data).toBeDefined();
	expect(data.series.length).toBeGreaterThan(0);
});

test("storeHistoricalData stores data to file", async () => {
	const symbol = "CME_MINI:ES1!";
	const data = await fetchHistoricalData(symbol);
	const filePath = join("./test_data/historical", `${symbol}.json`);

	// Ensure the file doesn't exist before the test
	try {
		await fs.unlink(filePath);
	} catch (error: any) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}

	// Call storeHistoricalData
	await storeHistoricalData(symbol, data, "./test_data/historical");

	// Check if the file exists after the function call
	try {
		await fs.access(filePath);
	} catch (error) {
		expect(error).toBeNull();
	}

	// Optionally, clean up the file after the test
	await fs.unlink(filePath);
});
