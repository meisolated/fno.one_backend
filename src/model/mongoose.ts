import mongoose from "mongoose"
import config from "../config"

export default class Mongoose {
	uri: string
	constructor() {
		this.uri = config.database.mongoUri
	}
	connection() {
		return mongoose.createConnection(this.uri)
	}
}
