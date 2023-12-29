const currentPrice = 200
const riskToRewardRatio = 3
const stopLoss = 30

console.log("------------------------| Trade Details |--------------------------")
console.log("currentPrice: ", currentPrice)
console.log("riskToRewardRatio: ", riskToRewardRatio)
console.log("stopLoss: ", stopLoss)

console.log("------------------------| fib retracement trailing logic |--------------------------")
// fib retracement trailing logic
// depends on stopLoss and riskToReward Ratio
// this can be used when we are more interested in capturing as much points as possible
// better in trending market
const fibRetracementPercentages = [100, 78.6, 61.8, 50, 38.2, 23.6, 0]
const target = stopLoss * riskToRewardRatio

const firstShift = (target * fibRetracementPercentages[1]) / 100
const secondShift = ((target + firstShift) * fibRetracementPercentages[2]) / 100
const thirdShift = ((target + firstShift + secondShift) * fibRetracementPercentages[3]) / 100
const fourthShift = ((target + firstShift + secondShift + thirdShift) * fibRetracementPercentages[4]) / 100
const fifthShift = ((target + firstShift + secondShift + thirdShift + fourthShift) * fibRetracementPercentages[5]) / 100
const sixthShift = ((target + firstShift + secondShift + thirdShift + fourthShift + fifthShift) * fibRetracementPercentages[6]) / 100

console.log("firstShift", (currentPrice + firstShift).toFixed(2))
console.log("secondShift", (currentPrice + firstShift + secondShift).toFixed(2))
console.log("thirdShift", (currentPrice + firstShift + secondShift + thirdShift).toFixed(2))
console.log("fourthShift", (currentPrice + firstShift + secondShift + thirdShift + fourthShift).toFixed(2))
console.log("fifthShift", (currentPrice + firstShift + secondShift + thirdShift + fourthShift + fifthShift).toFixed(2))
console.log("sixthShift", (currentPrice + firstShift + secondShift + thirdShift + fourthShift + fifthShift + sixthShift).toFixed(2))

console.log("------------------------| decremental trailing logic |--------------------------")
// decremental trailing logic
// depends on price of the option
// this can be used when we are more interested in capturing the points
// better in sideways market

function generatePercentageArray(sum) {
	if (typeof sum !== "number" || sum <= 0) {
		// Handle invalid input
		console.error("Invalid input. Please provide a positive number.")
		return []
	}

	const percentages = [50, 40, 30, 20, 10]
	const totalPercentage = percentages.reduce((acc, percentage) => acc + percentage, 0)

	const resultArray = percentages.map((percentage) => (percentage / totalPercentage) * sum)

	return resultArray
}

const decrementalPercentages = generatePercentageArray(stopLoss * riskToRewardRatio)

const decrementalFirst = currentPrice + decrementalPercentages[0]
const decrementalSecond = decrementalFirst + decrementalPercentages[1]
const decrementalThird = decrementalSecond + decrementalPercentages[2]
const decrementalFourth = decrementalThird + decrementalPercentages[3]
const decrementalFifth = decrementalFourth + decrementalPercentages[4]

console.log("decrementalFirst", decrementalFirst.toFixed(2))
console.log("decrementalSecond", decrementalSecond.toFixed(2))
console.log("decrementalThird", decrementalThird.toFixed(2))
console.log("decrementalFourth", decrementalFourth.toFixed(2))
console.log("decrementalFifth", decrementalFifth.toFixed(2))

console.log("----------------------| simple trailing logic |----------------------------")
// simple trailing logic
// depends on stopLoss and riskToReward Ratio
// this can be used when we want to capture points way beyond the target
// better in sideways-trending market
const simplePercentages = [50, 40, 30, 20, 10, 0]

const simpleFirst = (stopLoss * riskToRewardRatio * simplePercentages[0]) / 100
const simpleSecond = (stopLoss * riskToRewardRatio * simplePercentages[1]) / 100
const simpleThird = (stopLoss * riskToRewardRatio * simplePercentages[2]) / 100
const simpleFourth = (stopLoss * riskToRewardRatio * simplePercentages[3]) / 100
const simpleFifth = (stopLoss * riskToRewardRatio * simplePercentages[4]) / 100
const simpleSixth = (stopLoss * riskToRewardRatio * simplePercentages[5]) / 100

console.log("simpleFirst", (currentPrice + simpleFirst).toFixed(2))
console.log("simpleSecond", (currentPrice + simpleFirst + simpleSecond).toFixed(2))
console.log("simpleThird", (currentPrice + simpleFirst + simpleSecond + simpleThird).toFixed(2))
console.log("simpleFourth", (currentPrice + simpleFirst + simpleSecond + simpleThird + simpleFourth).toFixed(2))
console.log("simpleFifth", (currentPrice + simpleFirst + simpleSecond + simpleThird + simpleFourth + simpleFifth).toFixed(2))
console.log("simpleSixth", (currentPrice + simpleFirst + simpleSecond + simpleThird + simpleFourth + simpleFifth + simpleSixth).toFixed(2))
