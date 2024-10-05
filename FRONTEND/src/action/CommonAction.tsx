import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { RootState } from "../config/Store";
import { AnyAction } from "redux";

interface ReduxData {
  type: string;
  value: any;
}

export const setDataInRedux =
  (data: ReduxData): ThunkAction<void, RootState, unknown, AnyAction> =>
    async (
      dispatch: ThunkDispatch<RootState, unknown, AnyAction>
    ): Promise<void> => {
      dispatch({
        type: data.type,
        payload: data.value,
      });
    };

export const USER_LOGIN_REQUEST = "USER_LOGIN_REQUEST";
export const USER_LOGIN_SUCCESS = "USER_LOGIN_SUCCESS";
export const USER_LOGIN_FAIL = "USER_LOGIN_FAIL";
export const USER_LOGOUT = "USER_LOGOUT";

export const SET_IS_REFRESH = "SET_IS_REFRESH";
export const SET_SIGNUP_TYPE = "SET_SIGNUP_TYPE";
export const SET_SIGNUP_DATA = "SET_SIGNUP_DATA";
export const USER_INFO = "USER_INFO";
export const FORGET_PASSWORD_DATA = "FORGET_PASSWORD_DATA";
export  const ADD_OFFER_DATA = "ADD_OFFER_DATA";
export const ADD_ROLE_DATA = "ADD_ROLE_DATA";
export const ADD_PRODUCT_DATA ="ADD_PRODUCT_DATA"
export const ROLE_PERMMISION_DATA="ROLE_PERMMISION_DATA"

//////
export const UPDATE_ME_CALL="UPDATE_ME_CALL"
export const FEEDBACK_VIEW_DATA="FEEDBACK_VIEW_DATA"

