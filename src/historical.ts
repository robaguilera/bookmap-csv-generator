import { getHistoricalData, saveHistoricalData } from "./dataService";

async function generateHistoricalData(
	symbol: string,
	destinationDir = "data/historical",
) {
	// Fetch and store historical data
	const historicalData = await getHistoricalData(symbol);

	await saveHistoricalData(symbol, historicalData, destinationDir);
}

export { generateHistoricalData };
