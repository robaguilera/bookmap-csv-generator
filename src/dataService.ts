import type { HistoricalResponse, OhlcvResponse } from "./api/apiAdapter";
import { insightsSentryApi } from "./api/insightsSentry";

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
	console.log("storing historical data", data);
	await apiService.storeHistoricalData(symbol, data, destinationDir);
}

export { getOhlcvData, getHistoricalData, saveHistoricalData };
