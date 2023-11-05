import { User } from "model"
import { updateUserBrokerFunds } from "../handler/fyers.handler"

export default async function (user: user, newTradeDetails: any) {
	/**
	 * first update user funds
	 * then check if new trade funds requirement is less than allowed funds
	 * also check how much funds are utilized
	 */
	const _updateUserBrokerFunds = updateUserBrokerFunds(user)
}
