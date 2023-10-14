export const physiologyConfig = {
	monday: {
		quantity: "full",
		allowedFundsToBeUsed: 1000,
	},
}
interface userPhysiologyConfig {
	quantity: {
		full: number
		half: number
	}
	monday: {
		quantity: "full" | "half"
		allowedFundsToBeUsed: number
	}
}
