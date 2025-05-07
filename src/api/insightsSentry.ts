import fetch from "node-fetch";
import type {
	ApiParams,
	HistoricalResponse,
	OhlcvResponse,
} from "./apiAdapter";
import type { ApiAdapter } from "./apiAdapter";

const apiKey = process.env.RAPIDAPI_KEY;

if (!apiKey) {
	throw new Error("RAPIDAPI_KEY environment variable not set");
}

const baseUrl = "https://insightsentry.p.rapidapi.com/v2/symbols";

const insightsSentryApi: ApiAdapter = {
	fetchOhlcv: async ({
		symbol,
		barType = "day",
		barInterval = 1,
	}: ApiParams) => {
		const url = `${baseUrl}/${symbol}/series?bar_type=${barType}&bar_interval=${barInterval}&extended=true&badj=true&dadj=false`;

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
	fetchHistoricalData: async ({
		symbol,
		barType = "day",
		barInterval = 1,
		extended = false,
	}: ApiParams) => {
		const url = `${baseUrl}/${symbol}/history?bar_interval=${barInterval}&bar_type=${barType}&extended=${extended}&badj=true&dadj=false`;

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
};

export { insightsSentryApi };
