import candleHistoryModel from "./candleHistory.model"
import loggerModel from "./logger.model"
import marketDataModel from "./marketData.model"
import Mongoose from "./mongoose"
import openInterestsModel from "./openInterests.model"
import sessionModel from "./session.model"
import settingsModel from "./settings.model"
import strategiesModel from "./strategies.model"
import symbolTicksModel from "./symbolTicks.model"
import userModel from "./user.model"
const connection = new Mongoose().connection()

export const SymbolTicks = connection.model("symbolTicks", symbolTicksModel)
export const User = connection.model("User", userModel)
export const Settings = connection.model("Settings", settingsModel)
export const Session = connection.model("Session", sessionModel)
export const OpenInterest = connection.model("OpenInterest", openInterestsModel)
export const CandleHistory = connection.model("CandleHistory", candleHistoryModel)
export const Logger = connection.model("Logger", loggerModel)
export const MarketData = connection.model("MarketData", marketDataModel)
export const Strategies = connection.model("Strategies", strategiesModel)
// connection.collection("").createIndex({ title: "" })
