import chatter from "../events"
import logger from "../logger"
import { User } from "../model"
import moneyManager from "./tradeApprovalAuthority/money.manager"
import riskManager from "./tradeApprovalAuthority/risk.manager"

export default async () => {
	logger.info("Loaded Trade Manager", "Trade Manager")
}


