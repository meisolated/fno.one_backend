const MongoClient = require("mongodb").MongoClient

const url = "mongodb://10.69.69.236:27017" // Update with your MongoDB connection URL
const dbName = "fno" // Update with your database name
const collectionName = "HistoricalData" // Update with your collection name

const breakoutStrategyBacktest = async () => {
	const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })

	try {
		await client.connect()
		console.log("Connected to MongoDB")

		const db = client.db(dbName)
		const collection = db.collection(collectionName)

		const candleData = await collection.find({}).toArray()

		let totalProfit = 0
		let totalLoss = 0
		let profitableDays = 0
		let lossDays = 0
		let highestProfit = 0
		let currentTrade = null

		for (let i = 1; i < candleData.length; i++) {
			const currentCandle = candleData[i]

			if (currentCandle.t.getHours() === 9 && currentCandle.t.getMinutes() === 20) {
				// Market opens, initialize trade
				currentTrade = {
					entryPrice: currentCandle.o,
					stopLoss: currentCandle.o - 60,
				}
			} else if (currentTrade) {
				// Check for breakout
				const breakoutUp = currentCandle.h > currentTrade.entryPrice
				const breakoutDown = currentCandle.l < currentTrade.entryPrice

				if (breakoutUp || breakoutDown) {
					const profitOrLoss = breakoutUp ? currentCandle.h - currentTrade.entryPrice : currentTrade.entryPrice - currentCandle.l

					if (profitOrLoss > 0) {
						totalProfit += profitOrLoss
						profitableDays++
						if (profitOrLoss > highestProfit) {
							highestProfit = profitOrLoss
						}
					} else {
						totalLoss += Math.abs(profitOrLoss)
						lossDays++
					}

					currentTrade = null // Reset trade
				}
			}
		}

		const averageProfit = profitableDays > 0 ? totalProfit / profitableDays : 0

		console.log("Backtest Results:")
		console.log("Profitable Days:", profitableDays)
		console.log("Loss Days:", lossDays)
		console.log("Highest Profit:", highestProfit)
		console.log("Average Profit:", averageProfit)
	} catch (err) {
		console.error("Error during backtest:", err)
	} finally {
		await client.close()
		console.log("Closed MongoDB connection")
	}
}

breakoutStrategyBacktest()
