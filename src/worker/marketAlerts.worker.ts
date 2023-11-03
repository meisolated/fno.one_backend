import chatter from "../events"
import { sendMail } from "../lib/mail"
import logger from "../logger"
import { MarketAlerts, User } from "../model"
let marketAlerts: any = []
let symbolLTP: any = {}

export default () => {
	const getMarketAlerts = async () => {
		marketAlerts = await MarketAlerts.find({}).then((alerts) => alerts.filter((alert: any) => !alert.alerted))
		return
	}
	chatter.on("symbolUpdateTicks-", "tick", (data) => {
		return (symbolLTP[data.symbol] = data.lp)
	})

	setInterval(async () => {
		await getMarketAlerts()
	}, 2000)

	setInterval(async () => {
		marketAlerts.forEach(async (alert: any) => {
			if (!alert.alerted) {
				if (alert.condition === "greaterThan") {
					if (symbolLTP[alert.symbol] > alert.value) {
						alert.alerted = true
						await alert.save()
						chatter.emit("marketAlerts-", alert.userId, {
							status: "triggered",
							symbol: alert.symbol,
							condition: alert.condition,
							value: alert.value,
						})
						console.log("alert triggered")
						console.log(alert.symbol, alert.value, symbolLTP[alert.symbol])
						const user = await User.findById(alert.userId)
						if (user) {
							await sendMail(user.email, "Market Alert Triggered", "", emailTemplate(alert, user))
						} else {
							logger.error("User not found", "marketAlerts.worker.ts")
						}
					}
				} else if (alert.condition === "lessThan") {
					if (symbolLTP[alert.symbol] < alert.value) {
						alert.alerted = true
						await alert.save()
						chatter.emit("marketAlerts-", alert.userId, {
							status: "triggered",
							symbol: alert.symbol,
							condition: alert.condition,
							value: alert.value,
						})
						console.log("alert triggered")
						console.log(alert.symbol, alert.value, symbolLTP[alert.symbol])
						const user = await User.findById(alert.userId)
						if (user) {
							await sendMail(user.email, "Market Alert Triggered", "", emailTemplate(alert, user))
						} else {
							logger.error("User not found", "marketAlerts.worker.ts")
						}
					}
				}
			}
		})
	}, 500)
}

const emailTemplate = (alert: any, user: any) => `<!DOCTYPE html>
<html>
<head>
    <style>
       @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300&display=swap');
        
        body {
      font-family: 'Outfit', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }

        header {
            background-color: #0074d9;
            color: white;
            text-align: center;
            padding: 20px 0;
        }

        footer {
        font-family: 'Outfit', sans-serif;
            background-color: #333;
            color: white;
            text-align: center;
            padding: 10px 0;
            position: absolute;
            bottom: 0;
            width: 100%;
        }

        .container {
            font-family: 'Outfit', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        h1 {
            font-size: 28px;
        }

        p {
            font-size: 16px;
            margin: 10px 0;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        table, th, td {
            border: 1px solid #ccc;
        }

        th, td {
            padding: 10px;
            text-align: left;
        }
    </style>
</head>
<body>
    <header>
        <h1>FnO</h1>
    </header>
    <div class="container">
    <a>Hey, ${user.displayName || user.name}</a>
        <h1>Market Alert Triggered</h1>
        <p>Symbol: ${alert.symbol}</p>
        <p>Condition: ${alert.condition}</p>
        <p>Value: ${alert.value}</p>
        <p>LTP: ${symbolLTP[alert.symbol]}</p>
        <!-- Insert your table content here -->
    </div>
    <footer>
        &copy; 2023 Vedus. All rights reserved.
    </footer>
</body>
</html>
`
