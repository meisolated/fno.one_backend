function splitLots(lot, quantity) {
	const lots = []

	while (quantity > 0) {
		// Determine the current lot size (minimum between lot and quantity)
		const currentLotSize = Math.min(lot, quantity)

		// Subtract the current lot size from the remaining quantity
		quantity -= currentLotSize

		// Push the current lot size to the array
		lots.push(currentLotSize)
	}

	return lots
}

// Example usage:
const result = splitLots(900, 50000)
console.log(result)
console.log(result.length)
