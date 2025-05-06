import fs from "node:fs";
import { join } from "node:path";
import fetch from "node-fetch";
import type {
	HistoricalData,
	HistoricalResponse,
	OhlcvResponse,
} from "./apiAdapter";
import type { ApiAdapter } from "./apiAdapter";

const apiKey = process.env.RAPIDAPI_KEY;

if (!apiKey) {
	throw new Error("RAPIDAPI_KEY environment variable not set");
}

const baseUrl = "https://insightsentry.p.rapidapi.com/v2/symbols";
const historicalDataDir = "data/historical";

const insightsSentryApi: ApiAdapter = {
	fetchOhlcv: async (symbol: string, bar_type = "day", bar_interval = 1) => {
		const url = `${baseUrl}/${symbol}/series?bar_type=${bar_type}&bar_interval=${bar_interval}&extended=true&badj=true&dadj=false`;

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
	},
	fetchHistoricalData: async (symbol: string) => {
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
	},
	storeHistoricalData: async (
		symbol: string,
		data: HistoricalResponse,
		destinationDir: string = historicalDataDir,
	) => {
		const filePath = join(destinationDir, `${symbol}.json`);

		try {
			// Read existing data from file
			let existingData: { series?: HistoricalData[] } = {};
			try {
				const fileContent = await fs.promises.readFile(filePath, "utf-8");
				existingData = JSON.parse(fileContent);
			} catch (readError: unknown) {
				if ((readError as { code: string }).code !== "ENOENT") {
					console.error(
						`Error reading existing data for ${symbol}:`,
						readError,
					);
					throw readError;
				}
			}

			// Append new data to existing data
			const updatedData = {
				...existingData,
				series: [...(existingData.series || []), ...data.series],
			};

			// Write updated data back to file
			await fs.promises.writeFile(
				filePath,
				JSON.stringify(updatedData, null, 2),
			);

			console.log(`Historical data stored for ${symbol} in ${filePath}`);
		} catch (error: unknown) {
			console.error(`Error storing historical data for ${symbol}:`, error);
			throw error;
		}
	},
};

export { insightsSentryApi };
