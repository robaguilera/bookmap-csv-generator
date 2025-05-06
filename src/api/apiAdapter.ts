interface OhlcvData {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

interface OhlcvResponse {
	code: string;
	bar_end: number;
	last_update: number;
	bar_type: string;
	series: OhlcvData[];
}

interface HistoricalData {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

interface HistoricalResponse {
	code: string;
	bar_end: number;
	last_update: number;
	bar_type: string;
	series: HistoricalData[];
}

interface ApiAdapter {
	fetchOhlcv(
		symbol: string,
		bar_type?: string,
		bar_interval?: number,
	): Promise<OhlcvResponse>;
	fetchHistoricalData(symbol: string): Promise<HistoricalResponse>;
	storeHistoricalData(
		symbol: string,
		data: HistoricalResponse,
		destinationDir: string,
	): Promise<void>;
}

export type {
	ApiAdapter,
	OhlcvResponse,
	HistoricalResponse,
	HistoricalData,
	OhlcvData,
};
