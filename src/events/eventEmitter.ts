import events from "events"
const chatter = new events.EventEmitter()
chatter.on("symbolMarketDataUpdate", (data: any) => {
    // console.log(data)
})
export default chatter
