import { config } from "dotenv";
import {
	getHistoricalData,
	getOhlcvData,
	saveHistoricalData,
} from "./dataService";

config();

async function testEndpoints() {
	try {
		const ohlcvData = await getOhlcvData("CME_MINI:ES1!");
		console.log("OHLCV Data:", ohlcvData);

		const historicalData = await getHistoricalData("CME_MINI:ES1!");
		console.log("Historical Data:", historicalData);

		await saveHistoricalData("CME_MINI:ES1!", historicalData);
	} catch (error) {
		console.error("Error:", error);
	}
}

testEndpoints();
