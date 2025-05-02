import { fetchHistoricalData, storeHistoricalData } from "./api";

async function generateHistoricalData(symbol: string) {
	// Fetch and store historical data
	const historicalData = await fetchHistoricalData(symbol);
	await storeHistoricalData(symbol, historicalData);
}

export { generateHistoricalData };
