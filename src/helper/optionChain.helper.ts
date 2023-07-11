const datePassedOrNot = (date: string) => {
	const today = new Date()
	const dateArray = date.split("-")
	const dateObject = new Date(`${dateArray[1]}-${dateArray[0]}-${dateArray[2]}`)
	if (dateObject.getTime() < today.getTime()) {
		return true
	}
	return false
}

const SingleMForMonth = (month: string) => {
	switch (month) {
		case "Jan":
			return "1"
		case "Feb":
			return "2"
		case "Mar":
			return "3"
		case "Apr":
			return "4"
		case "May":
			return "5"
		case "Jun":
			return "6"
		case "Jul":
			return "7"
		case "Aug":
			return "8"
		case "Sep":
			return "9"
		case "Oct":
			return "O"
		case "Nov":
			return "N"
		case "Dec":
			return "D"
	}
}

export { SingleMForMonth, datePassedOrNot }
