import _ from 'lodash';
import { getAuthHeaders } from '../util/headers';
import { handle401 } from '../util/check-auth';

const types = {
  EDITING: 'USER_EDIT',
  LOADING: 'USER_LOADING',
  LOADED: 'USER_LOADED',
  UPDATED: 'USER_UPDATED',
  PHOTO_RELOADED: 'USER_PHOTO_RELOADED'
};

export const isOnboarded = (user) => {
  const name = _.get(user, 'data.name', '');
  const interests = _.get(user, 'data.interests', '');
  const isOnboarded = name.trim() !== '' && interests.trim() !== '';
  return isOnboarded;
};

export const editUserData = () => {
  return {
    type: types.EDITING
  };
};

export const reloadProfileImage = (userId) => (dispatch) => {
  const endpoint = 'api/users/' + userId + '/details';
  fetch(endpoint, {
    headers: getAuthHeaders()
  })
    .then((res) => handle401(res, dispatch))
    .then((res) => res.json())
    .then((data) => {
      const photo = data.photo;
      dispatch({
        type: types.PHOTO_RELOADED,
        photo
      });
    });
};

export const loadUserDataWithBonusUrl = (userId) => {
  const endpoint = 'api/users/' + userId + '/details?generate_url=true';
  return loadUserDataGeneral(userId, endpoint);
};

export const loadUserData = (userId) => {
  const endpoint = 'api/users/' + userId + '/details';
  return loadUserDataGeneral(userId, endpoint);
};

export const loadUserDataGeneral = (userId, endpoint) => (dispatch) => {
  dispatch({ type: types.LOADING });

  fetch(endpoint, {
    headers: getAuthHeaders()
  })
    .then((res) => handle401(res, dispatch))
    .then((res) => res.json())
    .then((data) => {
      const user = {
        id: userId,
        location: data.location ? data.location.toLowerCase() : undefined,
        waitingTime: data.waiting_time,
        photo: data.photo,
        name: data.name,
        interests: data.interests,
        username: data.username,
        interactionUrl: data.interaction_url,
        waytcoins: data.waytcoins
      };
      dispatch({
        type: types.LOADED,
        data: user
      });
    });
};

export const updateUserData = (userId, data) => (dispatch) => {
  const endpoint = 'api/users/' + userId;
  data['address'] = window.web3 ? window.web3.eth.accounts[0] : null
  const body = JSON.stringify(data);
  const headers = getAuthHeaders();
  headers.append('content-type', 'application/json');
  fetch(endpoint, {
    method: 'put',
    body,
    headers: headers
  })
    .then((res) => handle401(res, dispatch))
    .then((res) => res.json())
    .then((json) => {
      dispatch({
        type: types.UPDATED
      });
      dispatch(loadUserData(userId));
    });
};


const initialState = {
  loading: false,
  loaded: false,
  isEditable: false,
  data: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOADING:
      return {
        ...state,
        loading: true
      };
    case types.LOADED:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.data
      };
    case types.EDITING:
      return {
        ...state,
        isEditable: true
      };
    case types.UPDATED:
      return {
        ...state,
        isEditable: false
      };
    case types.PHOTO_RELOADED:
      return {
        ...state,
        data: {
          ...state.data,
          photo: action.photo
        }
      };

    default:
      return state;
  };
};

export default {
  reducer
};
