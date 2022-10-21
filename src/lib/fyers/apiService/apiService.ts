import axios from "axios"
import errorHandler from "../errorHandler/errorHandler"

class ApiService {
    url: string
    token: string
    constructor(url: string, token: string) {
        this.url = url
        this.token = token
    }

    async get() {
        return this.callByMethod("get")
    }

    async post() {
        return this.callByMethod("post")
    }

    async put() {
        return this.callByMethod("put")
    }

    async delete() {
        return this.callByMethod("delete")
    }

    async callByMethod(method: any) {
        try {
            //@ts-ignore
            const result = await axios[method](this.url, {
                headers: {
                    Authorization: this.token,
                },
            })
            return result.data
        } catch (e) {
            return new errorHandler(e).getError()
        }
    }

    static generateUrl(url: string, queryObject: any) {
        let finalUrl = url + "?"
        for (let key in queryObject) {
            finalUrl = finalUrl + key + "=" + queryObject[key] + "&"
        }
        return finalUrl.substring(0, finalUrl.length - 1)
    }
}

export default ApiService
