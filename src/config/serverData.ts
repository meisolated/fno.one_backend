export default {
	positionTypes: {
		long: {
			id: "long",
			name: "Long",
			description: "Place a limit order to buy the option at the limit price or lower and very lenient stop loss",
			maxRiskToRewardRatio: 5,
			minRiskToRewardRatio: 2,
			trailing: {
				enable: true,
				after: 2,
				percentage: 0.5,
				percentageType: "soft",
			},
		},
		scalping: {
			id: "scalping",
			name: "Scalping",
			description: "Place a limit order to buy the option at the limit price or lower and very strict stop loss",
			maxRiskToRewardRatio: 1.5,
			minRiskToRewardRatio: 1,
			trailing: {
				enable: true,
				after: 0.5,
				percentage: 0.5,
				percentageType: "hard",
			},
		},
		swing: {
			id: "swing",
			name: "Swing",
			description: "Place a limit order to buy the option at the limit price or lower and strict stop loss",
			maxRiskToRewardRatio: 2,
			minRiskToRewardRatio: 1.5,
			trailing: {
				enable: true,
				after: 1,
				percentage: 0.5,
				percentageType: "soft",
			},
		},
		expiry: {
			id: "expiry",
			name: "Expiry",
			description: "Place 2 orders on each side of the option chain like a straddle and wait for the market to move in one direction",
			maxRiskToRewardRatio: 10,
			minRiskToRewardRatio: 2,
			trailing: {
				enable: false,
				after: 0.5,
				percentage: 0.5,
				percentageType: "veryHard",
			},
		},
	},
	optionSelectionTypes: ["ATM", "NAP", "ITM", "OTM"],
}
