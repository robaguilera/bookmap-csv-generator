import { generateOhlcCSV } from "./src/csv";
import { generatePivotsCSV } from "./src/pivots";

async function main() {
	const esApiSymbol = "CME_MINI:ES1!";
	const esCsvSymbols = ["ESM5.CME@RITHMIC", "MESM5.CME@RITHMIC", ">3ES@TM.Pro"];

	const nqApiSymbol = "CME_MINI:NQ1!";
	const nqCsvSymbols = ["NQM5.CME@RITHMIC", "MNQM5.CME@RITHMIC", ">3NQ@TM.Pro"];

	// Generate OHLC CSVs for ES symbols
	await generateOhlcCSV(esApiSymbol, esCsvSymbols);

	// Generate OHLC CSVs for NQ symbols
	await generateOhlcCSV(nqApiSymbol, nqCsvSymbols);

	// Generate Pivot CSVs for ES symbols
	// await generatePivotsCSV(esApiSymbol, esCsvSymbols);

	// Generate Pivot CSVs for NQ symbols
	// await generatePivotsCSV(nqApiSymbol, nqCsvSymbols);
}

main().catch(console.error);
