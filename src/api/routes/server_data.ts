import { Express, Request, Response } from "express"
import { generateLoginUrl } from "../../lib/fyers"
import logger from "../../logger"
export default async function (app: Express, path: string) {
    logger.info("Loaded route: " + path)
    app.get(path, (req: Request, res: Response) => {
        const data = {
            apps: [
                {
                    name: "Fyers",
                    description: "Fyers is a discount broker that offers a flat fee of Rs. 20 per trade. It also offers a free demat account.",
                    link: "https://fyers.in/?utm_source=fno.one&utm_medium=referral&utm_campaign=referral",
                    logo: "https://fyers.in/assets/images/logo.png",
                    loginUrl: generateLoginUrl(),
                    status: "Live",
                    enabled: true,
                },
                {
                    name: "Zerodha",
                    description: "Zerodha is a discount broker that offers a flat fee of Rs. 20 per trade. It also offers a free demat account.",
                    link: "https://zerodha.com/?utm_source=fno.one&utm_medium=referral&utm_campaign=referral",
                    logo: "https://zerodha.com/static/images/logo.svg",
                    loginUrl: "https://zerodha.com/",
                    status: "Coming soon",
                    enabled: false,
                },
            ],
        }
    })
}
