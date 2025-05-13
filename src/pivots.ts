import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { HistoricalData } from "./api/apiAdapter";
import {
	getCurrentDayPremarketHighLow,
	getPreviousDayOHLC,
} from "./dataService";

/**
 * Represents the calculated Camarilla pivot points.
 */
interface CamarillaPivots {
	R6?: number;
	R5?: number;
	R4a?: number;
	R4: number;
	R3: number;
	R2: number;
	R1: number;
	CP: number; // Central Pivot, using the close value for calculation
	S1: number;
	S2: number;
	S3: number;
	S4: number;
	S4a?: number;
	S5?: number;
	S6?: number;
}

/**
 * Calculates the Camarilla pivot points based on previous day's OHLC and current day's premarket high/low.
 * Determines whether to use premarket data based on the rules defined in 02-planning.md.
 *
 * @param previousDayOHLC - The OHLC data from the previous trading day.
 * @param premarketHighLow - The high and low data from the current day's premarket/Globex session.
 * @returns The calculated Camarilla pivot points.
 */
function calculateCamarillaPivots(
	previousDayOHLC: HistoricalData,
	premarketHighLow?: { high: number; low: number },
): CamarillaPivots {
	const { high: highValue, low: lowValue, close: closeValue } = previousDayOHLC;

	let highToUse = highValue;
	let lowToUse = lowValue;
	const closeToUse = closeValue;

	// Determine if premarket data should be used
	const usePremarket =
		premarketHighLow &&
		(premarketHighLow.high > highValue || premarketHighLow.low < lowValue);

	if (usePremarket && premarketHighLow) {
		highToUse = premarketHighLow.high;
		lowToUse = premarketHighLow.low;
	}

	const range = highToUse - lowToUse;

	// Calculate pivots
	const R6 = Math.round((highToUse / lowToUse) * closeToUse);
	const R5 = Math.round(
		closeToUse +
			(range * 1.1) / 2 +
			1.168 *
				(closeToUse + (range * 1.1) / 2 - (closeToUse + (range * 1.1) / 4)),
	);
	const R4 = Math.round(closeToUse + (range * 1.1) / 2);
	const R3 = Math.round(closeToUse + (range * 1.1) / 4);
	const R2 = Math.round(closeToUse + (range * 1.1) / 6);
	const R1 = Math.round(closeToUse + (range * 1.1) / 12);

	const S1 = Math.round(closeToUse - (range * 1.1) / 12);
	const S2 = Math.round(closeToUse - (range * 1.1) / 6);
	const S3 = Math.round(closeToUse - (range * 1.1) / 4);
	const S4 = Math.round(closeToUse - (range * 1.1) / 2);
	const S5 = Math.round(
		closeToUse -
			(range * 1.1) / 2 -
			1.168 *
				(closeToUse - (range * 1.1) / 4 - (closeToUse - (range * 1.1) / 2)),
	);
	const S6 = Math.round(closeToUse - (R6 - closeToUse));

	const pivots: CamarillaPivots = {
		R6,
		R5,
		R4,
		R3,
		R2,
		R1,
		CP: closeToUse, // CP is the previous day's close, not a calculated pivot level, so not rounding
		S1,
		S2,
		S3,
		S4,
		S5,
		S6,
	};

	return pivots;
}

/**
 * Formats the calculated Camarilla pivot points into a CSV string.
 *
 * @param symbol - The trading symbol (e.g., ESM5.CME@RITHMIC).
 * @param pivots - The calculated Camarilla pivot points.
 * @returns A string formatted as CSV content.
 */
function formatPivotsToCsv(symbol: string, pivots: CamarillaPivots): string {
	const header =
		"Symbol,Price Level,Note,Foreground Color,Background Color,Text Alignment,Draw Note Price Horizontal Line";
	const lines: string[] = [header];

	const pivotLevels: { note: keyof CamarillaPivots; color: string }[] = [
		{ note: "R6", color: "#990000" },
		{ note: "R5", color: "#990000" },
		{ note: "R4", color: "#990000" },
		{ note: "R3", color: "#990000" },
		{ note: "CP", color: "#FFFF00" },
		{ note: "S3", color: "#339897" },
		{ note: "S4", color: "#339897" },
		{ note: "S5", color: "#339897" },
		{ note: "S6", color: "#339897" },
	];

	for (const { note, color } of pivotLevels) {
		const priceLevel = pivots[note];
		if (priceLevel !== undefined) {
			lines.push(
				`${symbol},${priceLevel.toFixed(2)},${note},#ffffff,${color},right,TRUE`,
			);
		}
	}

	return lines.join("\n");
}

const csvDir = "csv";
const pivotsDir = "pivots";

/**
 * Generates Camarilla pivot point CSV files for a given API symbol and a list of CSV symbols.
 * Fetches data using the API symbol and creates a separate CSV file for each CSV symbol.
 *
 * @param apiSymbol The symbol used for API calls (e.g., "CME_MINI:ES1!").
 * @param csvSymbols An array of symbols to be used in the CSV file names and content.
 */
async function generatePivotsCSV(apiSymbol: string, csvSymbols: string[]) {
	console.log(`Generating Pivot CSV for ${apiSymbol}`);

	const previousDayOHLC = await getPreviousDayOHLC(apiSymbol, true);

	if (!previousDayOHLC) {
		console.error(`No previous day OHLC data found for ${apiSymbol}`);
		return;
	}

	const premarketHighLow = await getCurrentDayPremarketHighLow(apiSymbol);

	for (const csvSymbol of csvSymbols) {
		const pivots = calculateCamarillaPivots(previousDayOHLC, premarketHighLow);
		const csvContent = formatPivotsToCsv(csvSymbol, pivots);

		const indicatorDir = apiSymbol.includes("ES") ? "es" : "nq";
		const filePathCsv = join(
			csvDir,
			pivotsDir,
			indicatorDir,
			`${csvSymbol}.csv`,
		);

		// Ensure the directory exists
		await fs.mkdir(join(csvDir, pivotsDir, indicatorDir), { recursive: true });

		await fs.writeFile(filePathCsv, csvContent);
	}
	console.log(`Done! ${apiSymbol} pivot csv generated.`);
}

export {
	calculateCamarillaPivots,
	formatPivotsToCsv,
	generatePivotsCSV,
	type CamarillaPivots,
};
