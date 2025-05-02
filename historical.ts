import { generateHistoricalData } from "./src/historical";

async function main() {
	const symbols = ["CME_MINI:ES1!", "CME_MINI:NQ1!"];

	for (const symbol of symbols) {
		await generateHistoricalData(symbol);
	}
}

main().catch(console.error);
