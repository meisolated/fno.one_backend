function getRandomCoinFlip() {
	// Generate a random number (0 or 1) to simulate a coin flip
	return Math.floor(Math.random() * 2)
}
let numberOfLosses = 0
let numberOfProfits = 0
function simulateTradeDay(tradingDay, capital) {
	if (capital <= 0) console.log("-----------------| Capital exhausted |-----------------")
	const riskRewardRatio = tradingDay === "Monday" || tradingDay === "Tuesday" || tradingDay === "Wednesday" ? 3 : 4
	const maxRisk = 30 // Maximum risk per trade
	const quantity = tradingDay === "Monday" || tradingDay === "Tuesday" || tradingDay === "Wednesday" ? 105 : 45
	function takeTrade() {
		let pOrL = 0
		const strategyProbability = getRandomCoinFlip()
		const marketFavorProbability = getRandomCoinFlip()
		const luckProbability = getRandomCoinFlip()

		if (strategyProbability === marketFavorProbability && marketFavorProbability === luckProbability) {
			// Profit scenario
			const profit = riskRewardRatio * maxRisk * quantity
			capital += profit
			console.log(`\x1b[32mDay: ${tradingDay}, Profit of Rs. ${profit}, Capital: Rs. ${capital.toFixed(2)}`)
			pOrL = 1
			numberOfProfits++
		} else {
			// Loss scenario
			const loss = -maxRisk * quantity
			capital += loss
			console.log(`\x1b[31mDay: ${tradingDay}, Loss of Rs. ${Math.abs(loss)}, Capital: Rs. ${capital.toFixed(2)}`)
			pOrL = 0
			numberOfLosses++
		}
		return pOrL
	}
	for (let i = 0; i < 2; i++) {
		// Check if we have reached the maximum risk for the day
		// if (capital <= 0 || capital >= 1.5 * 100000 / 3) {
		//     break
		// }
	}
	const takeFirstTrade = takeTrade()
	if (takeFirstTrade === 0) {
		takeTrade()
	}

	return capital
}

function simulateTradingMonth() {
	let useableCapital = 70000 // Initial capital
	const tradingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

	//12 months
	for (let i = 0; i < 12; i++) {
		for (const day of tradingDays) {
			useableCapital = simulateTradeDay(day, useableCapital)
		}
		for (const day of tradingDays) {
			useableCapital = simulateTradeDay(day, useableCapital)
		}
		for (const day of tradingDays) {
			useableCapital = simulateTradeDay(day, useableCapital)
		}
		for (const day of tradingDays) {
			useableCapital = simulateTradeDay(day, useableCapital)
		}
	}

	console.log(`Final Capital: Rs. ${useableCapital}`)
	console.log(`Total Profits: ${numberOfProfits}`)
	console.log(`Total Losses: ${numberOfLosses}`)
}

simulateTradingMonth()
