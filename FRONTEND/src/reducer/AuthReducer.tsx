import { USER_LOGIN_FAIL, USER_LOGIN_REQUEST, USER_LOGIN_SUCCESS, USER_LOGOUT } from "../action/CommonAction"

export interface UserState {
    loading?: boolean,
    error?: string,
    loginSuccess?: false,
    userInfo: {}
}

interface Action {
    type: string,
    payload?: object
}

export const userLoginReducer = (state: UserState = { userInfo: {} }, action: Action) => {
    switch (action.type) {
        case USER_LOGIN_REQUEST: return { loading: true }
        case USER_LOGIN_SUCCESS: return { loading: false, userInfo: action.payload, loginSuccess: true }
        case USER_LOGIN_FAIL: return { loading: false, error: action.payload, loginSuccess: false }
        case USER_LOGOUT: return {}
        default: return state
    }
}