//@ts-nocheck
class TokenGeneration {
    #appId: any
    #token: any
    #redirectUrl: any

    constructor() {
        if (TokenGeneration._instance) {
            return TokenGeneration._instance
        }
        TokenGeneration._instance = this
    }
    setAppId(value: any) {
        this.#appId = value
    }
    setToken(value: any) {
        this.#token = value
    }
    getAuthToken() {
        if (this.#token && this.#appId) {
            return `${this.#appId}:${this.#token}`
        } else {
            console.log("Warning : set AppId and Token")
        }
    }
    setRedirectUrl(url: string) {
        this.#redirectUrl = url
    }
    getRedirectUrl() {
        return this.#redirectUrl
    }
    getAppId() {
        return this.#appId
    }
}

export default new TokenGeneration()
