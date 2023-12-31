let something = {}
something["a"] = {
	a: 1,
}

if (something["a"]) {
	console.log("exist")
}
something["a"] = null

if (something["a"]) {
	console.log("exist")
} else {
	console.log("not exist")
}
