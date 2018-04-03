import _ from 'lodash';

const types = {
  PENDING: 'FEEDBACK_SUBMIT_PENDING',
  SUCCESSFUL: 'FEEDBACK_SUBMIT_SUCCESSFUL',
  ERROR: 'FEEDBACK_SUBMIT_ERROR'
};

export const submitFeedback = (email, feedback) => (dispatch) => {
  dispatch({type: types.PENDING});
  const endpoint = 'api/feedback';
  const body = JSON.stringify({email, feedback});
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
    dispatch({type: types.SUCCESSFUL});
  })
  .catch((error) => {
    dispatch({type: types.ERROR});
  });
};

const initialState = {
  isPending: false,
  isSuccessful: null,
  error: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOADING:
      return {
        isPending: true,
        isSuccessful: null,
        error: null
      };
    case types.SUCCESSFUL:
      return {
        isPending: false,
        isSuccessful: true,
        error: false
      };
    case types.ERROR:
      return {
        isPending: false,
        isSuccessful: false,
        error: true
      };
    default:
      return state;
  };
};

export default {
  reducer
};
