import { SET_IS_REFRESH, SET_SIGNUP_TYPE, SET_SIGNUP_DATA, USER_INFO, FORGET_PASSWORD_DATA,UPDATE_ME_CALL, ADD_ROLE_DATA,ADD_OFFER_DATA, ADD_PRODUCT_DATA,FEEDBACK_VIEW_DATA, ROLE_PERMMISION_DATA } from "../action/CommonAction";
// import { signupFormInterface, userInfoInterface } from "../OpenInterfaces";


export interface isRefreshState {
  isRefresh: any;
}

interface forgetPass {
  email: string;
  otp: string
}

export interface reduxState {
  signUpType: string;
  isRefresh: boolean;
  forget_pass: forgetPass;
  role: any;
  offer:any;
  product:any;
  update_me_call:any
  Feedback_View_Data:any
  // rolePermission:any;
  // signupData: signupFormInterface;
  // user_info: userInfoInterface;
}

const initialState: reduxState = {
  signUpType: "",
  isRefresh: false,
  forget_pass: {} as forgetPass,
  role: {},
  offer:{},
  product:{},
  update_me_call:false,
  Feedback_View_Data:{}

  // rolePermission:{},
  // signupData: {} as signupFormInterface,
  // user_info: JSON.parse(localStorage.getItem("user_info") || "{}")
}


interface Action {
  type: string;
  payload?: any;
}

export const commonReducerData = (state: reduxState = initialState, action: Action) => {
  switch (action.type) {
    case SET_SIGNUP_TYPE: return { ...initialState, ...{ signUpType: action.payload } };
    case SET_IS_REFRESH: return { ...initialState, ...{ isRefresh: action.payload } };
    case SET_SIGNUP_DATA: return { ...initialState, ...{ signupData: action.payload } };
    case FORGET_PASSWORD_DATA: return { ...initialState, ...{ forget_pass: action.payload } };
    case ADD_ROLE_DATA: return { ...initialState, ...{ role: action.payload } };
    case ADD_OFFER_DATA: return {...initialState,...{offer:action.payload}};
    case ADD_PRODUCT_DATA: return {...initialState,...{product:action.payload}};
    // case ROLE_PERMMISION_DATA: return {...initialState,...{rolePermission:action.payload}};
    //////
    case UPDATE_ME_CALL: return {...initialState,...{update_me_call:action.payload}};
    case FEEDBACK_VIEW_DATA: return {...initialState,...{Feedback_View_Data:action.payload}};

    
    default: return state;
  }
};




export const updateuserInfo = (state: any = { user_info: {} }, action: Action) => {
  switch (action.type) {
    case USER_INFO: return { user_info: action.payload };
    default: return state;
  }
};

export const updaterolepermission = (state: any = { rolePermission: {} }, action: Action) => {
  switch (action.type) {
    case ROLE_PERMMISION_DATA: return { rolePermission: action.payload };
    default: return state;
  }
};



