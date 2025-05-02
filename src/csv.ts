import { promises as fs } from "node:fs";
import { join } from "node:path";

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

interface CombinedData extends HistoricalData {
	Symbol: string;
	"Price Level": number;
	Note: string;
	"Foreground Color": string;
	"Background Color": string;
	"Text Alignment": string;
	"Draw Note Price Horizontal Line": string;
}

async function generateOhlcCSV(symbol: string) {
	const filePath = join(historicalDataDir, `${symbol}.json`);

	let data: { series: CombinedData[] } | undefined;
	try {
		const fileContent = await fs.readFile(filePath, "utf-8");
		data = JSON.parse(fileContent);
	} catch (error: unknown) {
		console.error(`Error reading historical data for ${symbol}:`, error);
		return;
	}

	if (!data || !data.series || data.series.length === 0) {
		console.error(`No historical data found for ${symbol}`);
		return;
	}

	// Get the last day's data
	const lastDay = data.series[data.series.length - 1];

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
			time: lastDay.time,
			open: lastDay.open,
			high: lastDay.high,
			low: lastDay.low,
			close: lastDay.close,
			volume: lastDay.volume,
		},
		{
			Symbol: symbol,
			"Price Level": lastDay.close ?? 0,
			Note: "PDC",
			"Foreground Color": "#ffffff",
			"Background Color": "#FF00FF",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
			time: lastDay.time,
			open: lastDay.open,
			high: lastDay.high,
			low: lastDay.low,
			close: lastDay.close,
			volume: lastDay.volume,
		},
		{
			Symbol: symbol,
			"Price Level": lastDay.low ?? 0,
			Note: "PDL",
			"Foreground Color": "#ffffff",
			"Background Color": "#FF00FF",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
			time: lastDay.time,
			open: lastDay.open,
			high: lastDay.high,
			low: lastDay.low,
			close: lastDay.close,
			volume: lastDay.volume,
		},
		{
			Symbol: symbol,
			"Price Level": lastDay.open ?? 0,
			Note: "PDO",
			"Foreground Color": "#ffffff",
			"Background Color": "#FF00FF",
			"Text Alignment": "right",
			"Draw Note Price Horizontal Line": "TRUE",
			time: lastDay.time,
			open: lastDay.open,
			high: lastDay.high,
			low: lastDay.low,
			close: lastDay.close,
			volume: lastDay.volume,
		},
	];

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
