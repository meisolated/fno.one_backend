//@ts-nocheck
import axios from "axios"
import crypto from "crypto"

interface DeltaExchangeOrder {
	side: "buy" | "sell"
	order_type: "limit_order" | "market_order"
	stop_order_type: "stop_loss_order" | "take_profit_order"
	stop_trigger_method: "mark_price" | "last_traded_price" | "spot_price"
	time_in_force: "gtc" | "ioc" | "fok"
	mmp: "disabled" | "mmp1" | "mmp2" | "mmp3" | "mmp4" | "mmp5"
	post_only: boolean
	reduce_only: boolean
	close_on_trigger: boolean
	product_id?: number
	limit_price?: string
	size?: number
	stop_price?: string
	trail_amount?: string
	bracket_stop_loss_limit_price?: string
	bracket_stop_loss_price?: string
	bracket_take_profit_limit_price?: string
	bracket_take_profit_price?: string
	client_order_id?: string
}

class DeltaExchange {
	private apiKey: string
	private apiSecret: string
	private userId: string
	private baseUrl = "https://api.delta.exchange"

	constructor(apiKey: string, apiSecret: string, userId: string) {
		this.apiKey = apiKey
		this.apiSecret = apiSecret
		this.userId = userId
	}
	private generateSignature(secret: string, message: string) {
		const messageBuffer = Buffer.from(message, "utf-8")
		const secretBuffer = Buffer.from(secret, "utf-8")
		const hash = crypto.createHmac("sha256", secretBuffer).update(messageBuffer).digest("hex")
		return hash
	}
	private getTimeStamp() {
		const timestamp = Math.floor(new Date().getTime() / 1000).toString()
		return timestamp
	}
	placeOrder(order: DeltaExchangeOrder): Promise<any> {
		const method = "POST"
		const path = "/orders"
		const timestamp = this.getTimeStamp()
		const body = JSON.stringify(order)
		const signaturePayload = method + timestamp + path + body
	}

	exitPosition(positionId: string): Promise<any> {}

	getPositions(): Promise<any[]> {}

	closeAllPositions(): Promise<any> {}

	getBalance(): Promise<any> {}
}

export default DeltaExchange
