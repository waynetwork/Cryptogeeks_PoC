import _ from 'lodash';

const types = {
  ACCOUNT_AVAILABILITY_CHECK_PENDING: 'ACCOUNT_AVAILABILITY_CHECK_PENDING',
  ACCOUNT_AVAILABILITY_CHECK_PASSED: 'ACCOUNT_AVAILABILITY_CHECK_PASSED',
  ACCOUNT_AVAILABILITY_CHECK_FAILED: 'ACCOUNT_AVAILABILITY_CHECK_FAILED',
  ACCOUNT_REGISTER_PENDING: 'ACCOUNT_REGISTER_PENDING',
  ACCOUNT_REGISTER_PASSED: 'ACCOUNT_REGISTER_PASSED',
  ACCOUNT_REGISTER_FAILED: 'ACCOUNT_REGISTER_FAILED',
  ACCOUNT_LOGIN_PENDING: 'ACCOUNT_LOGIN_PENDING',
  ACCOUNT_LOGIN_PASSED: 'ACCOUNT_LOGIN_PASSED',
  ACCOUNT_LOGIN_FAILED: 'ACCOUNT_LOGIN_FAILED',
  ACCOUNT_LOGOUT: 'ACCOUNT_LOGOUT'
};

export const isLoggedIn = () => {
  // TODO remove this on FE and do it through an API call
  // logic - user should be an already signed up user with a currently valid token
  const userId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');
  const username = sessionStorage.getItem('username');
  const loggedIn = userId && token && username;
  console.log("isLoggedIn", loggedIn);
  return loggedIn;
};

export const registerAccount = (data) => (dispatch) => {
  dispatch({
    type: types.ACCOUNT_REGISTER_PENDING,
  });
  const endpoint = 'api/accounts';
  const body = JSON.stringify(data);
  fetch(endpoint, {
    method: 'post',
    body,
    headers: new Headers({
      'content-type': 'application/json'
    })
  })
  .then((res) => {
    if (res.status < 200 || res.status > 299) {
      throw new Error("Something went wrong!");
    }
    return res.json();
  })
  .then((data) => {
    console.log("registration passed", data);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('username', data.username);
    dispatch({
      type: types.ACCOUNT_REGISTER_PASSED,
      data
    });
    dispatch({
      type: types.ACCOUNT_LOGIN_PASSED,
      userId: data.id
    });
  })
  .catch(error => {
    dispatch({
      type: types.ACCOUNT_REGISTER_FAILED
    });
  });
};

export const checkUsernameAvailability = (username) => (dispatch) => {
  dispatch({
    type: types.ACCOUNT_AVAILABILITY_CHECK_PENDING,
  });
  const endpoint = 'api/accounts/checkname/' + username;
  fetch(endpoint)
  .then((res) => res.json())
  .then((data) => {
    if(data.exists === true) {
      dispatch({
        type: types.ACCOUNT_AVAILABILITY_CHECK_FAILED,
      });
    } else {
      dispatch({
        type: types.ACCOUNT_AVAILABILITY_CHECK_PASSED,
      });
    }
  })
  .catch(error => {
    dispatch({
      type: types.ACCOUNT_AVAILABILITY_CHECK_FAILED
    });
  });
};

export const login = (loginname, password) => (dispatch) => {
  dispatch({
    type: types.ACCOUNT_LOGIN_PENDING,
  });
  const endpoint = 'api/accounts/login';
  const body = JSON.stringify({
    loginname,
    password
  });
  console.log("body", body);
  fetch(endpoint, {
    method: 'post',
    body,
    headers: new Headers({
      'content-type': 'application/json'
    })
  })
  .then((res) => {
    if (res.status < 200 || res.status > 299) {
      throw new Error("Something went wrong!");
    }
    return res.json();
  })
  .then((data) => {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('username', data.username);
    dispatch({
      type: types.ACCOUNT_LOGIN_PASSED,
      userId: data.id
    });
  })
  .catch(error => {
    dispatch({
      type: types.ACCOUNT_LOGIN_FAILED
    });
  });
};


const initialState = {
  userId: null,

  isCheckingAvailability: false,
  isAvailable: null,

  isRegisteringAccount: false,
  wasRegistrationSuccessful: null,

  isLoginPending: false,
  wasLoginSuccessful: null,
  hasLoginFailed: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.ACCOUNT_AVAILABILITY_CHECK_PENDING:
      return {
        ...state,
        isCheckingAvailability: true,
        isAvailable: null
      };
    case types.ACCOUNT_AVAILABILITY_CHECK_PASSED:
      return {
        ...state,
        isCheckingAvailability: false,
        isAvailable: true
      };
    case types.ACCOUNT_AVAILABILITY_CHECK_FAILED:
      return {
        ...state,
        isCheckingAvailability: false,
        isAvailable: false
      };

    case types.ACCOUNT_REGISTER_PENDING:
      return {
        ...state,
        isRegisteringAccount: true,
        wasRegistrationSuccessful: null
      };
    case types.ACCOUNT_REGISTER_PASSED:
      console.log("ACCOUNT_REGISTER_PASSED", action);
      return {
        ...state,
        userId: action.data.id,
        isRegisteringAccount: false,
        wasRegistrationSuccessful: true
      };
    case types.ACCOUNT_REGISTER_FAILED:
      return {
        ...state,
        isRegisteringAccount: false,
        wasRegistrationSuccessful: false
      };

    case types.ACCOUNT_LOGIN_PENDING:
      return {
        ...state,
        isLoginPending: true,
        wasLoginSuccessful: null,
        hasLoginFailed: false
      };
    case types.ACCOUNT_LOGIN_PASSED:
      return {
        ...state,
        userId: action.userId,
        isLoginPending: false,
        wasLoginSuccessful: true,
        hasLoginFailed: false
      };
    case types.ACCOUNT_LOGIN_FAILED:
      return {
        ...state,
        isLoginPending: false,
        wasLoginSuccessful: false,
        hasLoginFailed: true
      };
    case types.ACCOUNT_LOGOUT:
      return {
        ...state,
        userId: null,
        isLoginPending: false,
        wasLoginSuccessful: null,
        hasLoginFailed: false
      };

    default:
      return state;
  };
};

export default {
  reducer
};
