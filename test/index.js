// Sample list of candle data with timestamps
const candleData = [
	{ timestamp: "2023-09-07T00:00:00", data: "candle 1" },
	{ timestamp: "2023-09-07T12:00:00", data: "candle 2" },
	{ timestamp: "2023-09-08T00:00:00", data: "candle 3" },
	// ... more data
]

// Create an object to group candle data by date
const groupedData = {}

// Iterate through the candle data and group by date
candleData.forEach((candle) => {
	const date = new Date(candle.timestamp).toLocaleDateString()

	if (!groupedData[date]) {
		groupedData[date] = []
	}

	groupedData[date].push(candle.data)
})

// Convert grouped data to an array of arrays
const result = Object.values(groupedData).map((candleArray) => [candleArray])

console.log(result)
