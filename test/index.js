const months = ["January", "February", "March", "April", "May", "June"]

async function main() {
	for (const month of months) {
		try {
			// Make an API request for the specific month
			console.log(month)

			// Sleep for a calculated duration to control the rate (e.g., 1 second)
			await sleep(1000) // Sleep for 1 second
		} catch (error) {
			// Handle errors and retry logic if needed
		}
	}
}
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}
main()
