import { insightsSentryApi } from "./api/insightsSentry";

import type {
	HistoricalData,
	HistoricalResponse,
	OhlcvResponse,
} from "./api/apiAdapter";

const apiService = insightsSentryApi;

async function getOhlcvData(symbol: string): Promise<OhlcvResponse> {
	return await apiService.fetchOhlcv(symbol);
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

export {
	getOhlcvData,
	getHistoricalData,
	saveHistoricalData,
	getPreviousDayOHLC,
};
