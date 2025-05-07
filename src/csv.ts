import { promises as fs } from "node:fs";
import { join } from "node:path";
import {
	getCurrentDayPremarketHighLow,
	getPreviousDayOHLC,
} from "./dataService";

const csvDir = "csv";

interface CombinedData {
	Symbol: string;
	"Price Level": number;
	Note: string;
	"Foreground Color": string;
	"Background Color": string;
	"Text Alignment": string;
	"Draw Note Price Horizontal Line": string;
}

/**
 * Generates OHLC CSV files for a given API symbol and a list of CSV symbols.
 * Fetches data using the API symbol and creates a separate CSV file for each CSV symbol.
 *
 * @param apiSymbol The symbol used for API calls (e.g., "CME_MINI:ES1!").
 * @param csvSymbols An array of symbols to be used in the CSV file names and content.
 */
async function generateOhlcCSV(apiSymbol: string, csvSymbols: string[]) {
	const historicalData = await getPreviousDayOHLC(apiSymbol);

	// Get the last day's data
	const lastDay = await historicalData;

	if (!lastDay) {
		console.error(`No last day data found for ${apiSymbol}`);
		return;
	}

	// Get premarket high and low
	const premarketData = await getCurrentDayPremarketHighLow(apiSymbol);

	for (const csvSymbol of csvSymbols) {
		const csvData: CombinedData[] = [
			{
				Symbol: csvSymbol,
				"Price Level": lastDay.high ?? 0,
				Note: "PDH",
				"Foreground Color": "#ffffff",
				"Background Color": "#FF00FF",
				"Text Alignment": "right",
				"Draw Note Price Horizontal Line": "TRUE",
			},
			{
				Symbol: csvSymbol,
				"Price Level": lastDay.close ?? 0,
				Note: "PDC",
				"Foreground Color": "#ffffff",
				"Background Color": "#FF00FF",
				"Text Alignment": "right",
				"Draw Note Price Horizontal Line": "TRUE",
			},
			{
				Symbol: csvSymbol,
				"Price Level": lastDay.low ?? 0,
				Note: "PDL",
				"Foreground Color": "#ffffff",
				"Background Color": "#FF00FF",
				"Text Alignment": "right",
				"Draw Note Price Horizontal Line": "TRUE",
			},
			{
				Symbol: csvSymbol,
				"Price Level": lastDay.open ?? 0,
				Note: "PDO",
				"Foreground Color": "#ffffff",
				"Background Color": "#FF00FF",
				"Text Alignment": "right",
				"Draw Note Price Horizontal Line": "TRUE",
			},
		];

		if (premarketData) {
			csvData.push({
				Symbol: csvSymbol,
				"Price Level": premarketData?.high ?? 0,
				Note: "ONH",
				"Foreground Color": "#000000",
				"Background Color": "#ccccff",
				"Text Alignment": "right",
				"Draw Note Price Horizontal Line": "TRUE",
			});

			csvData.push({
				Symbol: csvSymbol,
				"Price Level": premarketData?.low ?? 0,
				Note: "ONL",
				"Foreground Color": "#000000",
				"Background Color": "#ccccff",
				"Text Alignment": "right",
				"Draw Note Price Horizontal Line": "TRUE",
			});
		}

		if (csvData.length === 0) {
			console.error(
				`No CSV data found for ${csvSymbol} (using data from ${apiSymbol})`,
			);
			return;
		}

		const csvHeader = csvData[0] ? Object.keys(csvData[0]).join(",") : "";
		const csvRows = csvData
			.map((row) => Object.values(row).join(","))
			.join("\n");
		const csvContent = `${csvHeader}\n${csvRows}`;

		const filePathCsv = join(csvDir, `${csvSymbol}.csv`);
		await fs.writeFile(filePathCsv, csvContent);
	}
}

export { generateOhlcCSV };
