import fs from "fs"
function log(data: any) {
	if (!fs.existsSync("./logs")) {
		fs.mkdirSync("./logs")
	}
	const fileName = new Date().toLocaleDateString().replace(/\//g, "-")
	fs.appendFile(`./logs/${fileName}-console.log`, data, (err: any) => {
		if (err) {
			console.error("Failed to write to log file:", err)
		}
	})
}
