import type { HistoricalData } from "./api/apiAdapter";

/**
 * Represents the calculated Camarilla pivot points.
 */
interface CamarillaPivots {
	R6?: number;
	R4: number;
	R3: number;
	CP: number; // Central Pivot, using the close value for calculation
	S3: number;
	S4: number;
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
	const R4 = Math.round(closeToUse + (range * 1.1) / 2);
	const R3 = Math.round(closeToUse + (range * 1.1) / 4);

	const S3 = Math.round(closeToUse - (range * 1.1) / 4);
	const S4 = Math.round(closeToUse - (range * 1.1) / 2);
	const S6 = Math.round(closeToUse - (R6 - closeToUse));

	const pivots: CamarillaPivots = {
		R6,
		R4,
		R3,
		CP: closeToUse, // CP is the previous day's close, not a calculated pivot level, so not rounding
		S3,
		S4,
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
		{ note: "R4", color: "#990000" },
		{ note: "R3", color: "#990000" },
		{ note: "CP", color: "#FFFF00" },
		{ note: "S3", color: "#339897" },
		{ note: "S4", color: "#339897" },
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

export {
	calculateCamarillaPivots,
	formatPivotsToCsv,
	type CamarillaPivots,
};
