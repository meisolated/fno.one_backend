function findNearestStrikePrice(options, side, targetPrice) {
	const filteredOptions = options //.filter(option => option[side] === `BANKNIFTY231004${option.strike}${side}`)

	if (filteredOptions.length === 0) {
		console.error(`No options found for side ${side}`)
		return null
	}

	const nearestOption = filteredOptions.reduce((prev, curr) => {
		return Math.abs(curr[`${side}_LTP`] - targetPrice) < Math.abs(prev[`${side}_LTP`] - targetPrice) ? curr : prev
	})

	return nearestOption.strike
}

// Example usage
const array = [
	{
		CE: "BANKNIFTY23100443400CE",
		PE: "BANKNIFTY23100443400PE",
		strike: 43400,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0443400PE",
				CE: "NSE:BANKNIFTY23O0443400CE",
			},
		},
		PE_LTP: 47.8,
		CE_LTP: 1066.55,
	},
	{
		CE: "BANKNIFTY23100443500CE",
		PE: "BANKNIFTY23100443500PE",
		strike: 43500,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0443500PE",
				CE: "NSE:BANKNIFTY23O0443500CE",
			},
		},
		PE_LTP: 56.4,
		CE_LTP: 977.25,
	},
	{
		CE: "BANKNIFTY23100443600CE",
		PE: "BANKNIFTY23100443600PE",
		strike: 43600,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0443600PE",
				CE: "NSE:BANKNIFTY23O0443600CE",
			},
		},
		PE_LTP: 70.15,
		CE_LTP: 891.25,
	},
	{
		CE: "BANKNIFTY23100443700CE",
		PE: "BANKNIFTY23100443700PE",
		strike: 43700,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0443700PE",
				CE: "NSE:BANKNIFTY23O0443700CE",
			},
		},
		PE_LTP: 84.45,
		CE_LTP: 803.65,
	},
	{
		CE: "BANKNIFTY23100443800CE",
		PE: "BANKNIFTY23100443800PE",
		strike: 43800,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0443800PE",
				CE: "NSE:BANKNIFTY23O0443800CE",
			},
		},
		PE_LTP: 99.55,
		CE_LTP: 726.9,
	},
	{
		CE: "BANKNIFTY23100443900CE",
		PE: "BANKNIFTY23100443900PE",
		strike: 43900,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0443900PE",
				CE: "NSE:BANKNIFTY23O0443900CE",
			},
		},
		PE_LTP: 120.6,
		CE_LTP: 644.15,
	},
	{
		CE: "BANKNIFTY23100444000CE",
		PE: "BANKNIFTY23100444000PE",
		strike: 44000,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444000PE",
				CE: "NSE:BANKNIFTY23O0444000CE",
			},
		},
		PE_LTP: 144.65,
		CE_LTP: 566.8,
	},
	{
		CE: "BANKNIFTY23100444100CE",
		PE: "BANKNIFTY23100444100PE",
		strike: 44100,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444100PE",
				CE: "NSE:BANKNIFTY23O0444100CE",
			},
		},
		PE_LTP: 172.75,
		CE_LTP: 498.35,
	},
	{
		CE: "BANKNIFTY23100444200CE",
		PE: "BANKNIFTY23100444200PE",
		strike: 44200,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444200PE",
				CE: "NSE:BANKNIFTY23O0444200CE",
			},
		},
		PE_LTP: 205.2,
		CE_LTP: 430.1,
	},
	{
		CE: "BANKNIFTY23100444300CE",
		PE: "BANKNIFTY23100444300PE",
		strike: 44300,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444300PE",
				CE: "NSE:BANKNIFTY23O0444300CE",
			},
		},
		PE_LTP: 241.35,
		CE_LTP: 367.15,
	},
	{
		CE: "BANKNIFTY23100444400CE",
		PE: "BANKNIFTY23100444400PE",
		strike: 44400,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444400PE",
				CE: "NSE:BANKNIFTY23O0444400CE",
			},
		},
		PE_LTP: 283.35,
		CE_LTP: 310.25,
	},
	{
		CE: "BANKNIFTY23100444500CE",
		PE: "BANKNIFTY23100444500PE",
		strike: 44500,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444500PE",
				CE: "NSE:BANKNIFTY23O0444500CE",
			},
		},
		PE_LTP: 332.5,
		CE_LTP: 258.15,
	},
	{
		CE: "BANKNIFTY23100444600CE",
		PE: "BANKNIFTY23100444600PE",
		strike: 44600,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444600PE",
				CE: "NSE:BANKNIFTY23O0444600CE",
			},
		},
		PE_LTP: 388.55,
		CE_LTP: 214.65,
	},
	{
		CE: "BANKNIFTY23100444700CE",
		PE: "BANKNIFTY23100444700PE",
		strike: 44700,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444700PE",
				CE: "NSE:BANKNIFTY23O0444700CE",
			},
		},
		PE_LTP: 448.75,
		CE_LTP: 174,
	},
	{
		CE: "BANKNIFTY23100444800CE",
		PE: "BANKNIFTY23100444800PE",
		strike: 44800,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444800PE",
				CE: "NSE:BANKNIFTY23O0444800CE",
			},
		},
		PE_LTP: 515.6,
		CE_LTP: 141,
	},
	{
		CE: "BANKNIFTY23100444900CE",
		PE: "BANKNIFTY23100444900PE",
		strike: 44900,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0444900PE",
				CE: "NSE:BANKNIFTY23O0444900CE",
			},
		},
		PE_LTP: 586.2,
		CE_LTP: 113.05,
	},
	{
		CE: "BANKNIFTY23100445000CE",
		PE: "BANKNIFTY23100445000PE",
		strike: 45000,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0445000PE",
				CE: "NSE:BANKNIFTY23O0445000CE",
			},
		},
		PE_LTP: 659,
		CE_LTP: 89.15,
	},
	{
		CE: "BANKNIFTY23100445100CE",
		PE: "BANKNIFTY23100445100PE",
		strike: 45100,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0445100PE",
				CE: "NSE:BANKNIFTY23O0445100CE",
			},
		},
		PE_LTP: 738.9,
		CE_LTP: 69,
	},
	{
		CE: "BANKNIFTY23100445200CE",
		PE: "BANKNIFTY23100445200PE",
		strike: 45200,
		other: {
			fy: {
				PE: "NSE:BANKNIFTY23O0445200PE",
				CE: "NSE:BANKNIFTY23O0445200CE",
			},
		},
		PE_LTP: 821.4,
		CE_LTP: 53.1,
	},
]
const side = "PE" // or 'PE'
const targetPrice = 53

const nearestStrike = findNearestStrikePrice(array, side, targetPrice)

if (nearestStrike !== null) {
	console.log(`The nearest strike price for ${side} and target price ${targetPrice} is: ${nearestStrike}`)
} else {
	console.log("No valid options found.")
}
