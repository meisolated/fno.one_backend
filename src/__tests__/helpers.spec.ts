import mongoose from "mongoose"
import { datePassed } from "../helper"

describe("datePassed", () => {
	test("should return true if date is passed", () => {
		expect(datePassed("01-01-2021")).toBe(true)
	})
	test("should return false if date is not passed", () => {
		expect(datePassed("01-01-2999")).toBe(false)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
	await mongoose.disconnect()
	await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for a brief moment
	await mongoose.connection.close()
})
