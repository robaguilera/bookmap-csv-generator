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
	barType: string;
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
	barType: string;
	series: HistoricalData[];
}

interface ApiParams {
	symbol: string;
	barType?: string;
	barInterval?: number;
	extended?: boolean;
}

interface ApiAdapter {
	fetchOhlcv({
		symbol,
		barType,
		barInterval,
		extended,
	}: ApiParams): Promise<OhlcvResponse>;
	fetchHistoricalData({
		symbol,
		barType,
		barInterval,
		extended,
	}: ApiParams): Promise<HistoricalResponse>;
}

export type {
	ApiParams,
	ApiAdapter,
	OhlcvResponse,
	HistoricalResponse,
	HistoricalData,
	OhlcvData,
};
