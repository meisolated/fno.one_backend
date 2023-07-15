/**
 * @param date In format of DD-MM-YYYY
 * @returns true if date is passed else false
 */
const datePassed = (date: string) => {
	const today = new Date()
	const dateArray = date.split("-")
	const dateObject = new Date(`${dateArray[1]}-${dateArray[0]}-${dateArray[2]}`)
	//make dateObject time as 23:59:59
	dateObject.setHours(23)
	if (dateObject.getTime() < today.getTime()) {
		return true
	}
	return false
}

const TrueDataMonthStringToNumber = (month: string) => {
	switch (month) {
		case "Jan":
			return "01"
		case "Feb":
			return "02"
		case "Mar":
			return "03"
		case "Apr":
			return "04"
		case "May":
			return "05"
		case "Jun":
			return "06"
		case "Jul":
			return "07"
		case "Aug":
			return "08"
		case "Sep":
			return "09"
		case "Oct":
			return "10"
		case "Nov":
			return "11"
		case "Dec":
			return "12"
	}
}
const FyersMonthStringToNumber = (month: string) => {
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

export { FyersMonthStringToNumber, TrueDataMonthStringToNumber, datePassed }

