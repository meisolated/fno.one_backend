const EventEmitter = require("events")

// Create an instance of EventEmitter
const myEmitter = new EventEmitter()

// Define a listener function
const myListener = () => {
	console.log("Event emitted!")
}
const myListener2 = () => {
	console.log("Event emitted2!")
}

// Add the listener to the 'myEvent' event
myEmitter.on("myEvent", myListener)
myEmitter.on("myEvent", myListener2)
// Emit the event
myEmitter.emit("myEvent") // This will trigger the listener and print 'Event emitted!'

// Remove the listener from the 'myEvent' event
myEmitter.removeListener("myEvent", myListener)

// Emit the event again
myEmitter.emit("myEvent") // This time, the listener is not triggered
