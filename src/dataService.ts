import { insightsSentryApi } from "./api/insightsSentry";

import type { HistoricalResponse, OhlcvResponse } from "./api/apiAdapter";

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

export { getOhlcvData, getHistoricalData, saveHistoricalData };
