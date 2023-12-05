import counterModel from "./counter.model"
import HistoricalDataModel from "./historicalData.model"
import loggerModel from "./logger.model"
import marketAlertsModel from "./marketAlerts.model"
import marketDataModel from "./marketData.model"
import Mongoose from "./mongoose"
import openInterestsModel from "./openInterests.model"
import ordersModel from "./orders.model"
import positionsModel from "./positions.model"
import sessionModel from "./session.model"
import settingsModel from "./settings.model"
import strategiesModel from "./strategies.model"
import symbolDataModel from "./symbolData.model"
import symbolTicksModel from "./symbolTicks.model"
import tradesModel from "./trades.model"
import userModel from "./user.model"
const connection = new Mongoose().connection()

export const HistoricalData = connection.model("HistoricalData", HistoricalDataModel)
export const OpenInterest = connection.model("OpenInterest", openInterestsModel)
export const MarketAlerts = connection.model("MarketAlerts", marketAlertsModel)
export const SymbolTicks = connection.model("symbolTicks", symbolTicksModel)
export const MarketData = connection.model("MarketData", marketDataModel)
export const Strategies = connection.model("Strategies", strategiesModel)
export const SymbolData = connection.model("SymbolData", symbolDataModel)
export const Positions = connection.model("Positions", positionsModel)
export const Settings = connection.model("Settings", settingsModel)
export const Session = connection.model("Session", sessionModel)
export const Counter = connection.model("Counter", counterModel)
export const Logger = connection.model("Logger", loggerModel)
export const Orders = connection.model("Orders", ordersModel)
export const Trades = connection.model("Trades", tradesModel)
export const User = connection.model("User", userModel)

export async function getNextSequenceValue(sequenceName: string) {
	const counter = await Counter.findByIdAndUpdate({ _id: sequenceName }, { $inc: { sequenceValue: 1 } }, { new: true, upsert: true })
	return counter.sequenceValue
}
// connection.collection("").createIndex({ title: "" })
