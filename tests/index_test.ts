import { beforeAll, expect, mock, test } from "bun:test";
import fs from "node:fs/promises";
import { join } from "node:path";
import {
	getHistoricalData,
	getOhlcvData,
	saveHistoricalData,
} from "../src/dataService";

beforeAll(async () => {
	try {
		await fs.mkdir("test_data/historical", { recursive: true });
	} catch (error) {
		console.error("Error creating test directory:", error);
	}
});

// Mock API calls
mock(() => ({
	getOhlcvData: async (symbol: string) => {
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
	getHistoricalData: async (symbol: string) => {
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
	const data = await getOhlcvData("CME_MINI:ES1!");
	expect(data).toBeDefined();
	expect(data.series.length).toBeGreaterThan(0);
});

test("fetchHistoricalData returns data", async () => {
	const data = await getHistoricalData("CME_MINI:ES1!");
	expect(data).toBeDefined();
	expect(data.series.length).toBeGreaterThan(0);
});

test("storeHistoricalData stores data to file", async () => {
	const symbol = "CME_MINI:ES1!";
	const data = await getHistoricalData(symbol);
	const filePath = join("./test_data/historical", `${symbol}.json`);

	// Ensure the file doesn't exist before the test
	try {
		await fs.unlink(filePath);
	} catch (error: unknown) {
		if ((error as { code: string }).code !== "ENOENT") {
			throw error;
		}
	}

	// Call storeHistoricalData
	await saveHistoricalData(symbol, data, "./test_data/historical");

	// Check if the file exists after the function call
	try {
		await fs.access(filePath);
	} catch (error) {
		expect(error).toBeNull();
	}

	// Clean up the file after the test
	await fs.unlink(filePath);
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
