import { getConfig } from "./config/initialize"
import backtest from "./strategies/trafficLight/backtest"

async function main() {
	const config = await getConfig()
	await backtest()
}
main()
