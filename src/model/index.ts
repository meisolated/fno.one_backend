import loggerModel from "./logger.model"
import marketData from "./marketData.model"
import marketHistoryModel from "./marketHistory.model"
import Mongoose from "./mongoose"
import openInterestsModel from "./openInterests.model"
import sessionModel from "./session.model"
import settingsModel from "./settings.model"
import userModel from "./user.model"
const connection = new Mongoose().connection()

export const MarketData = connection.model("MarketData", marketData)
export const User = connection.model("User", userModel)
export const Settings = connection.model("Settings", settingsModel)
export const Session = connection.model("Session", sessionModel)
export const OpenInterest = connection.model("OpenInterest", openInterestsModel)
export const MarketHistory = connection.model("MarketHistory", marketHistoryModel)
export const Logger = connection.model("Logger", loggerModel)
// connection.collection("videos").createIndex({ title: "text" })
