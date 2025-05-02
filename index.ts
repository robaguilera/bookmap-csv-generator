import { generateOhlcCSV } from "./src/csv";

async function main() {
	const symbols = ["CME_MINI:ES1!", "CME_MINI:NQ1!"];

	for (const symbol of symbols) {
		// Generate OHLC CSV
		await generateOhlcCSV(symbol);
	}
}

main().catch(console.error);
