import fs from "fs"
export default function log(data: any) {
	if (!data) return
	if (typeof data !== "string") data = JSON.stringify(data)
	if (!fs.existsSync("./logs")) {
		fs.mkdirSync("./logs")
	}
	const fileName = new Date().toLocaleDateString().replace(/\//g, "-")
	fs.appendFile(`./logs/${fileName}-tradeCommunications.log`, `\n ${data}`, (err: any) => {
		if (err) {
			console.error("Failed to write to log file:", err)
		}
	})
}
