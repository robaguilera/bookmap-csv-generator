import { getHistoricalData, saveHistoricalData } from "./dataService";

async function generateHistoricalData(symbol: string) {
	// Fetch and store historical data
	const historicalData = await getHistoricalData(symbol);
	await saveHistoricalData(symbol, historicalData);
}

export { generateHistoricalData };
