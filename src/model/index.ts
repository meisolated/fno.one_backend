import marketData from "./marketData.model"
import Mongoose from "./mongoose"
const connection = new Mongoose().connection()

export const MarketData = connection.model("MarketData", marketData)

// connection.collection("videos").createIndex({ title: "text" })
