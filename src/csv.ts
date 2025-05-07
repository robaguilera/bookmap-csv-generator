import { promises as fs } from "node:fs";
import { join } from "node:path";
import {
	getCurrentDayPremarketHighLow,
	getPreviousDayOHLC,
} from "./dataService";

const csvDir = "csv";
const historicalDataDir = "data/historical";

interface HistoricalData {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

interface CombinedData {
	Symbol: string;
	"Price Level": number;
	Note: string;
	"Foreground Color": string;
	"Background Color": string;
	"Text Alignment": string;
	"Draw Note Price Horizontal Line": string;
}

async function generateOhlcCSV(symbol: string) {
	const historicalData = await getPreviousDayOHLC(symbol);

	// Get the last day's data
	const lastDay = await historicalData;

	if (!lastDay) {
		console.error(`No last day data found for ${symbol}`);
		return;
	}

	const csvData: CombinedData[] = [
		{
			Symbol: symbol,
			"Price Level": lastDay.high ?? 0,
			Note: "PDH",
			"Foreground Color": "#ffffff",
			"Background Color": "#FF00FF",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
		},
		{
			Symbol: symbol,
			"Price Level": lastDay.close ?? 0,
			Note: "PDC",
			"Foreground Color": "#ffffff",
			"Background Color": "#FF00FF",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
		},
		{
			Symbol: symbol,
			"Price Level": lastDay.low ?? 0,
			Note: "PDL",
			"Foreground Color": "#ffffff",
			"Background Color": "#FF00FF",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
		},
		{
			Symbol: symbol,
			"Price Level": lastDay.open ?? 0,
			Note: "PDO",
			"Foreground Color": "#ffffff",
			"Background Color": "#FF00FF",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
		},
	];

	// Get premarket high and low
	const premarketData = await getCurrentDayPremarketHighLow(symbol);

	if (premarketData) {
		csvData.push({
			Symbol: symbol,
			"Price Level": premarketData?.high ?? 0,
			Note: "PMH",
			"Foreground Color": "#000000",
			"Background Color": "#ccccff",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
		});

		csvData.push({
			Symbol: symbol,
			"Price Level": premarketData?.low ?? 0,
			Note: "PML",
			"Foreground Color": "#000000",
			"Background Color": "#ccccff",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
		});
	}

	if (csvData.length === 0) {
		console.error(`No CSV data found for ${symbol}`);
		return;
	}

	const csvHeader = csvData[0] ? Object.keys(csvData[0]).join(",") : "";
	const csvRows = csvData.map((row) => Object.values(row).join(",")).join("\n");
	const csvContent = `${csvHeader}\n${csvRows}`;

	const filePathCsv = join(csvDir, `${symbol}.csv`);
	await fs.writeFile(filePathCsv, csvContent);

	console.log(`CSV file generated for ${symbol} at ${filePathCsv}`);
}

export { generateOhlcCSV };
