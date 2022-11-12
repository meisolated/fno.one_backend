import marketData from "./marketData.model"
import Mongoose from "./mongoose"
import userModel from "./user.model"
import settingsModel from "./settings.model"
const connection = new Mongoose().connection()

export const MarketData = connection.model("MarketData", marketData)
export const User = connection.model("User", userModel)
export const settings = connection.model("Settings", settingsModel)
// connection.collection("videos").createIndex({ title: "text" })
