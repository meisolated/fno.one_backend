interface CandleStick {
	open: number
	close: number
	high: number
	low: number
}

const isHammer = (candle: CandleStick) => {
	const bodySize = Math.abs(candle.close - candle.open)
	const lowerShadow = Math.abs(candle.low - Math.min(candle.open, candle.close))
	const upperShadow = Math.abs(candle.high - Math.max(candle.open, candle.close))
	const isHammer = bodySize < lowerShadow && upperShadow < bodySize && candle.close > candle.open
	return isHammer
}

const isInvertedHammer = (candle: CandleStick) => {
	const bodySize = Math.abs(candle.close - candle.open)
	const lowerShadow = Math.abs(candle.low - Math.min(candle.open, candle.close))
	const upperShadow = Math.abs(candle.high - Math.max(candle.open, candle.close))
	const isInvertedHammer = bodySize < upperShadow && lowerShadow < bodySize && candle.close < candle.open
	return isInvertedHammer
}
