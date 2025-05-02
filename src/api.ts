import fs from "node:fs";
import { join } from "node:path";
import fetch from "node-fetch";

const apiKey = process.env.RAPIDAPI_KEY;

if (!apiKey) {
	throw new Error("RAPIDAPI_KEY environment variable not set");
}

const baseUrl = "https://insightsentry.p.rapidapi.com/v2/symbols";
const historicalDataDir = "data/historical";

interface OhlcvData {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

interface OhlcvResponse {
	code: string;
	bar_end: number;
	last_update: number;
	bar_type: string;
	series: OhlcvData[];
}

async function fetchOhlcv(symbol: string): Promise<OhlcvResponse> {
	const url = `${baseUrl}/${symbol}/series?bar_type=day&bar_interval=1&extended=true&badj=true&dadj=false`;

	const options = {
		method: "GET",
		headers: {
			"X-RapidAPI-Key": apiKey ?? "",
			"X-RapidAPI-Host": "insightsentry.p.rapidapi.com",
		},
	};

	const response = await fetch(url, options);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = (await response.json()) as OhlcvResponse;

	return data;
}

interface HistoricalData {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

interface HistoricalResponse {
	code: string;
	bar_end: number;
	last_update: number;
	bar_type: string;
	series: HistoricalData[];
}

async function fetchHistoricalData(
	symbol: string,
): Promise<HistoricalResponse> {
	const url = `${baseUrl}/${symbol}/history?bar_interval=1&bar_type=day&extended=true&badj=true&dadj=false`;

	const options = {
		method: "GET",
		headers: {
			"X-RapidAPI-Key": apiKey ?? "",
			"X-RapidAPI-Host": "insightsentry.p.rapidapi.com",
		},
	};

	const response = await fetch(url, options);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = (await response.json()) as HistoricalResponse;
	return data;
}

async function storeHistoricalData(
	symbol: string,
	data: HistoricalResponse,
	destinationDir: string = historicalDataDir,
) {
	const filePath = join(destinationDir, `${symbol}.json`);

	try {
		// Read existing data from file
		let existingData: { series?: HistoricalData[] } = {};
		try {
			const fileContent = await fs.promises.readFile(filePath, "utf-8");
			existingData = JSON.parse(fileContent);
		} catch (readError: unknown) {
			if ((readError as { code: string }).code !== "ENOENT") {
				console.error(`Error reading existing data for ${symbol}:`, readError);
				throw readError;
			}
		}

		// Append new data to existing data
		const updatedData = {
			...existingData,
			series: [...(existingData.series || []), ...data.series],
		};

		// Write updated data back to file
		await fs.promises.writeFile(filePath, JSON.stringify(updatedData, null, 2));

		console.log(`Historical data stored for ${symbol} in ${filePath}`);
	} catch (error: unknown) {
		console.error(`Error storing historical data for ${symbol}:`, error);
		throw error;
	}
}

export { fetchOhlcv, fetchHistoricalData, storeHistoricalData };

export type { HistoricalResponse };
