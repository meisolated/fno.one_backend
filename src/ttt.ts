const now = new Date()
const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() - 10, 0)
const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0)
const fromString = `${from.getFullYear()}${from.getMonth() + 1}${from.getDate()}T${from.getHours()}:${from.getMinutes()}:${from.getSeconds()}`
const _toString = `${to.getFullYear()}${to.getMonth() + 1}${to.getDate()}T${to.getHours()}:${to.getMinutes()}:${to.getSeconds()}`
console.log(fromString, _toString)