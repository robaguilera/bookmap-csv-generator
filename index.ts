import { generateOhlcCSV } from "./src/csv";

async function main() {
	const esApiSymbol = "CME_MINI:ES1!";
	const esCsvSymbols = ["ESU5.CME@RITHMIC", "MESU5.CME@RITHMIC"];

	const nqApiSymbol = "CME_MINI:NQ1!";
	const nqCsvSymbols = ["NQU5.CME@RITHMIC", "MNQU5.CME@RITHMIC"];

	// Generate OHLC CSVs for ES symbols
	await generateOhlcCSV(esApiSymbol, esCsvSymbols);

	// Generate OHLC CSVs for NQ symbols
	await generateOhlcCSV(nqApiSymbol, nqCsvSymbols);
}

main().catch(console.error);
