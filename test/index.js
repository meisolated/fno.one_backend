const crypto = require("crypto")
const axios = require("axios")

//  ---------------| VARIABLES |-----------------
const api_key = "5IwNvODnlXo8W11ToeIwPpTOEc9xZh"
const api_secret = "GScLVHzgJhkW1aPeGLkkmfLtELPY5yNLAZcZt8LrngQE8ywbwVOU5EVAwSpo"

// const api_key = 'A5SkfoNLQKfq9dvQj6JgEFydebf2gq'
// const api_secret = '3tA9X9xOUoEoewEnNhyKupJHUjeBViQAnJH4O6qzvgFTJy7lgpGejxCdpOv4'
const url = "https://api.delta.exchange/v2/orders"
//------------------------------------------------

//  ---------------| FUNCTIONS |-----------------
function generateSignature(secret, message) {
	const messageBuffer = Buffer.from(message, "utf-8")
	const secretBuffer = Buffer.from(secret, "utf-8")
	const hash = crypto.createHmac("sha256", secretBuffer).update(messageBuffer).digest("hex")
	return hash
}

function getTimeStamp() {
	const timestamp = Math.floor(new Date().getTime() / 1000).toString()
	return timestamp
}
//------------------------------------------------

//  ---------------| MAIN |-----------------

const method = "POST"
const timestamp = getTimeStamp()
const path = "/v2/orders"
const payload = '{"order_type":"market_order","size":3,"side":"buy","limit_price":"0.0005","product_id":5401}'
const message = method + timestamp + path + "" + payload
const signature = generateSignature(api_secret, message)

const headers = {
	"Content-Type": "application/json",
	"User-Agent": "rest-client",
	"api-key": api_key,
	"signature": signature,
	"timestamp": timestamp,
}

axios.post(url, payload, { headers: { ...headers } })
