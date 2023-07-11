import mongoose from "mongoose"
import { datePassedOrNot } from "../helper"

describe("datePassedOrNot", () => {
	test("should return true if date is passed", () => {
		expect(datePassedOrNot("01-01-2021")).toBe(true)
	})
	test("should return false if date is not passed", () => {
		expect(datePassedOrNot("01-01-2999")).toBe(false)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
	await mongoose.disconnect()
	await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for a brief moment
	await mongoose.connection.close()
})
