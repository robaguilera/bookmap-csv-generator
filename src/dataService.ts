import { insightsSentryApi } from "./api/insightsSentry";

import type {
	ApiParams,
	HistoricalData,
	HistoricalResponse,
	OhlcvResponse,
} from "./api/apiAdapter";

const apiService = insightsSentryApi;

async function getOhlcvData({
	symbol,
	barType,
	barInterval,
	extended,
}: ApiParams): Promise<OhlcvResponse> {
	return await apiService.fetchOhlcv({
		symbol,
		barType,
		barInterval,
		extended,
	});
}

async function getHistoricalData({
	symbol,
	barType,
	barInterval,
	extended,
}: ApiParams): Promise<HistoricalResponse> {
	return await apiService.fetchHistoricalData({
		symbol,
		barType,
		barInterval,
		extended,
	});
}

async function getPreviousDayOHLC(
	symbol: string,
): Promise<HistoricalData | undefined> {
	const historicalData = await getHistoricalData({ symbol, extended: false });

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
	const ohlcvData = await getOhlcvData({ symbol });

	const { series } = ohlcvData;

	if (!series || series.length === 0) {
		return undefined;
	}

	const firstSeries = series[0];

	if (!firstSeries) {
		return undefined;
	}

	const { high, low } = firstSeries;

	return { high, low };
}

export {
	getOhlcvData,
	getHistoricalData,
	getPreviousDayOHLC,
	getCurrentDayPremarketHighLow,
};

function isMarketClosed(): boolean {
	// Get current time in EST
	const now = new Date();
	const estOffset = -5; // EST is UTC-5
	const estTime = new Date(now.getTime() + estOffset * 60 * 60 * 1000);

	const dayOfWeek = estTime.getDay(); // 0 = Sunday, 6 = Saturday
	const hour = estTime.getHours();

	// Market is closed on weekends
	if (dayOfWeek === 0 || dayOfWeek === 6) {
		return true;
	}

	// Market hours (EST): 9:30 AM - 4:00 PM
	const marketOpenHour = 9;
	const marketOpenMinute = 30;
	const marketCloseHour = 16;
	const marketCloseMinute = 0;

	const currentTimeInMinutes = hour * 60 + estTime.getMinutes();
	const marketOpenTimeInMinutes = marketOpenHour * 60 + marketOpenMinute;
	const marketCloseTimeInMinutes = marketCloseHour * 60 + marketCloseMinute;

	// Check if the current time is outside market hours
	if (
		currentTimeInMinutes < marketOpenTimeInMinutes ||
		currentTimeInMinutes >= marketCloseTimeInMinutes
	) {
		return true;
	}

	return false;
}
