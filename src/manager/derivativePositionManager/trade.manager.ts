import chatter from "../../events"
import logger from "../../logger"
import { User } from "../../model"
import moneyManager from "./positionApprovalAuthority/money.manager"
import riskManager from "./positionApprovalAuthority/risk.manager"

export default async () => {
	logger.info("Loaded Trade Manager", "Trade Manager")
}
