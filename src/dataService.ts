import { insightsSentryApi } from "./api/insightsSentry";

import type {
	HistoricalData,
	HistoricalResponse,
	OhlcvResponse,
} from "./api/apiAdapter";

const apiService = insightsSentryApi;

async function getOhlcvData(
	symbol: string,
	bar_type?: string,
	bar_interval?: number,
): Promise<OhlcvResponse> {
	return await apiService.fetchOhlcv(symbol, bar_type, bar_interval);
}

async function getHistoricalData(symbol: string): Promise<HistoricalResponse> {
	return await apiService.fetchHistoricalData(symbol);
}

async function saveHistoricalData(
	symbol: string,
	data: HistoricalResponse,
	destinationDir: string,
) {
	await apiService.storeHistoricalData(symbol, data, destinationDir);
}

async function getPreviousDayOHLC(
	symbol: string,
): Promise<HistoricalData | undefined> {
	const historicalData = await getHistoricalData(symbol);

	const { series } = historicalData;

	if (!series || series.length < 2) {
		return undefined;
	}

	return series[series.length - 2];
}

async function getCurrentDayPremarketHighLow(
	symbol: string,
): Promise<{ high: number; low: number } | undefined> {
	// Fetch 1-minute data
	const ohlcvData = await getOhlcvData(symbol, "minute", 1);

	const { series } = ohlcvData;

	if (!series || series.length === 0) {
		return undefined;
	}

	// Calculate 9:30 AM EST cutoff time in UTC (assuming DST -> 14:30 UTC)
	// TODO: Make timezone handling more robust (consider DST changes)
	const now = new Date();
	const marketOpenCutoff = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate(),
			14,
			30,
			0,
			0,
		),
	);
	const cutoffTimestampSeconds = Math.floor(marketOpenCutoff.getTime() / 1000);

	// Filter for premarket bars (before 9:30 AM EST / 14:30 UTC)
	const premarketSeries = series.filter(
		(item) => item.time < cutoffTimestampSeconds,
	);

	if (premarketSeries.length === 0) {
		// No data before market open
		return undefined;
	}

	let high = Number.NEGATIVE_INFINITY;
	let low = Number.POSITIVE_INFINITY;

	for (const item of premarketSeries) {
		if (item.high > high) {
			high = item.high;
		}
		if (item.low < low) {
			low = item.low;
		}
	}

	// If high/low are still Infinity, it means no valid data was found
	if (high === Number.NEGATIVE_INFINITY || low === Number.POSITIVE_INFINITY) {
		return undefined;
	}

	return { high, low };
}

export {
	getOhlcvData,
	getHistoricalData,
	saveHistoricalData,
	getPreviousDayOHLC,
	getCurrentDayPremarketHighLow,
};
