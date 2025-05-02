import { fetchHistoricalData, fetchOhlcv, storeHistoricalData } from "./api";

async function getOhlcvData(symbol: string) {
	return await fetchOhlcv(symbol);
}

async function getHistoricalData(symbol: string) {
	return await fetchHistoricalData(symbol);
}

import type { HistoricalResponse } from "./api";

async function saveHistoricalData(symbol: string, data: HistoricalResponse) {
	await storeHistoricalData(symbol, data);
}

export { getOhlcvData, getHistoricalData, saveHistoricalData };
