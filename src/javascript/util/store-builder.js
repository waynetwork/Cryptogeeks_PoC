import _ from 'lodash';
import {getAuthHeaders} from './headers';
import {handle401} from './check-auth';

export default ({name, route}) => {

  const actionPrefix = name.toUpperCase();
  const types = {
    PENDING: `${actionPrefix}_PENDING`,
    SUCCESSFUL: `${actionPrefix}_SUCCESSFUL`,
    FAILED: `${actionPrefix}_FAILED`,
  };

  const send = (payload) => (dispatch) => {
    const url = _.isFunction(route) ? route(payload) : route;
    dispatch({
      type: types.PENDING
    });
    const headers = {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    };
    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    .then((res) => handle401(res, dispatch))
    .then((res) => {
      if (res.status < 200 || res.status > 299) {
        dispatch({
          type: types.FAILED
        });
      } else {
        res.json().then(json => {
          dispatch({
            type: types.SUCCESSFUL,
            data: json
          });
        });
      }
    })
    .catch(error => {
      dispatch({
        type: types.FAILED
      });
    });
  };

  const initialState = {
    initiated: false,
    pending: false,
    successful: false,
    failed: false,
    data: null
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case types.PENDING:
        return {
          ...state,
          initiated: true,
          pending: true,
          successful: false,
          failed: false
        };
      case types.SUCCESSFUL:
        return {
          initiated: true,
          pending: false,
          successful: true,
          failed: false,
          data: action.data
        };
      case types.FAILED:
        return {
          initiated: true,
          pending: false,
          successful: false,
          failed: true,
          data: null
        };
      default:
        return state;
    };
  };

  return {
    name,
    types,
    reducer,
    actions: {
      send
    }
  };

};
