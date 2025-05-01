import { config } from "dotenv";
import { fetchHistoricalData, fetchOhlcv, storeHistoricalData } from "./api";

config();

async function testEndpoints() {
	try {
		const ohlcvData = await fetchOhlcv("CME_MINI:ES1!");
		console.log("OHLCV Data:", ohlcvData);

		const historicalData = await fetchHistoricalData("CME_MINI:ES1!");
		console.log("Historical Data:", historicalData);

		await storeHistoricalData("CME_MINI:ES1!", historicalData);
	} catch (error) {
		console.error("Error:", error);
	}
}

testEndpoints();
