import { Settings } from "./model"


const getSettings = async () => {
	const settings = await Settings.findOne({ id: 1 })
	if (settings) {
		console.log(settings)
		settings.tasksLastRun = {
			"lastHistoricalDataUpdate": Date.now().toString()
		}
		await settings.save()
		console.log(settings)
	}
}

getSettings()