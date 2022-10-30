export interface user {
    auth_code: string
    loggedIn: boolean
    access_token: string
    refresh_token: string
}
export class User implements user {
    auth_code
    loggedIn
    access_token
    refresh_token
    constructor() {
        this.auth_code = ""
        this.loggedIn = false
        this.access_token = ""
        this.refresh_token = ""
    }
    setAuthCode(authCode: any) {
        this.auth_code = authCode
    }
    getAuthCode() {
        return this.auth_code
    }
    isLoggedIn() {
        return this.loggedIn
    }
    setLogin(state: any) {
        return (this.loggedIn = state)
    }
    setAccessToken(token: any) {
        this.access_token = token
    }
    setRefreshToken(token: any) {
        this.refresh_token = token
    }
    getAccessToken() {
        return this.access_token
    }
    getRefreshToken() {
        return this.refresh_token
    }
}
