// const now = new Date()
// const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 10, 0)
// const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0)
// const fromString = `${from.getFullYear()}${from.getMonth() + 1}${from.getDate()}T${from.getHours()}:${from.getMinutes()}:${from.getSeconds()}`
// const _toString = `${to.getFullYear()}${to.getMonth() + 1}${to.getDate()}T${to.getHours()}:${to.getMinutes()}:${to.getSeconds()}`
// console.log(fromString, _toString)

// import { updateSymbolMasterData } from "./worker"

// async function main() {
// 	// find time took
// 	const start = performance.now()
// 	const returned = await updateSymbolMasterData()
// 	console.log(returned)
// 	const end = performance.now()
// 	console.log(`Time took: ${(end - start) / 1000}s`)
// 	return true
// }

// main().then(() => {
// 	console.log("done")
// 	process.exit(0)
// })
const taskList = [
	{ taskName: "Task 1", data: {} },
	{ taskName: "Task 2", data: {} },
	{ taskName: "Task 3", data: {} },
	// ... more tasks
]
async function executeTask(task: any) {
	return new Promise((resolve, reject) => {
		// Simulate some asynchronous task execution
		setTimeout(() => {
			console.log(`Completed ${task.taskName}`)
			// Perform the actual task here
			// ...

			resolve(true) // Resolve the promise to indicate task completion
		}, 1000) // Simulated delay for demonstration
	})
}

async function runTasksSequentially(taskList: any) {
	for (const task of taskList) {
		console.log(`Waiting for ${task.taskName} to complete...`)
		await executeTask(task)
	}
}

runTasksSequentially(taskList)
	.then(() => {
		console.log("All tasks completed.")
	})
	.catch((error) => {
		console.error("An error occurred:", error)
	})
