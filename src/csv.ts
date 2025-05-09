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

interface OHLCData {
	open: number | null;
	high: number | null;
	low: number | null;
	close: number | null;
}

interface PremarketData {
	high: number | null;
	low: number | null;
}

/**
 * Prepares the core CSV data rows based on the previous day's OHLC data.
 *
 * @param csvSymbol The symbol to use in the CSV data.
 * @param lastDay The previous day's OHLC data.
 * @returns An array of CombinedData objects for the core OHLC levels.
 */
function prepareCoreOhlcData(
	csvSymbol: string,
	lastDay: OHLCData,
): CombinedData[] {
	return [
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
}

/**
 * Adds premarket high and low data rows to the CSV data if available.
 *
 * @param csvData The existing CSV data array.
 * @param csvSymbol The symbol to use in the CSV data.
 * @param premarketData The premarket high and low data.
 */
function addPremarketData(
	csvData: CombinedData[],
	csvSymbol: string,
	premarketData: PremarketData | undefined, // Updated type here
): void {
	if (premarketData) {
		csvData.push({
			Symbol: csvSymbol,
			"Price Level": premarketData.high ?? 0,
			Note: "ONH",
			"Foreground Color": "#000000",
			"Background Color": "#ccccff",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
		});

		csvData.push({
			Symbol: csvSymbol,
			"Price Level": premarketData.low ?? 0,
			Note: "ONL",
			"Foreground Color": "#000000",
			"Background Color": "#ccccff",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
		});
	}
}

/**
 * Formats the CSV data array into a CSV string.
 *
 * @param csvData The array of CombinedData objects.
 * @returns A string in CSV format.
 */
function formatCsvContent(csvData: CombinedData[]): string {
	if (csvData.length === 0) {
		return "";
	}
	// Reason: Ensure csvData[0] is not undefined before accessing its keys.
	const firstRow = csvData[0];
	if (!firstRow) {
		return ""; // Should not happen based on the check above, but for type safety
	}
	const csvHeader = Object.keys(firstRow).join(",");
	const csvRows = csvData.map((row) => Object.values(row).join(",")).join("\n");
	return `${csvHeader}\n${csvRows}`;
}

/**
 * Generates OHLC CSV files for a given API symbol and a list of CSV symbols.
 * Fetches data using the API symbol and creates a separate CSV file for each CSV symbol.
 *
 * @param apiSymbol The symbol used for API calls (e.g., "CME_MINI:ES1!").
 * @param csvSymbols An array of symbols to be used in the CSV file names and content.
 */
async function generateOhlcCSV(apiSymbol: string, csvSymbols: string[]) {
	console.log(`Generating CSV for ${apiSymbol}`);

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
		const csvData = prepareCoreOhlcData(csvSymbol, lastDay);
		addPremarketData(csvData, csvSymbol, premarketData);

		if (csvData.length === 0) {
			console.error(
				`No CSV data found for ${csvSymbol} (using data from ${apiSymbol})`,
			);
			return;
		}

		const csvContent = formatCsvContent(csvData);

		const indicatorDir = apiSymbol.includes("ES") ? "es" : "nq";
		const filePathCsv = join(csvDir, indicatorDir, `${csvSymbol}.csv`);

		await fs.writeFile(filePathCsv, csvContent);
	}
	console.log(`Done! ${apiSymbol} csv generated. Go make that money!`);
}

export { generateOhlcCSV };
