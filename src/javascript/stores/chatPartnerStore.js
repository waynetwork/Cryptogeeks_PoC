import _ from 'lodash';
import {getAuthHeaders} from '../util/headers';

const types = {
  LOADING: 'CHAT_PARTNER_LOADING',
  LOADED: 'CHAT_PARTNER_LOADED'
};

const awaitFetch = async function awaitFetch(chatPartnerId, dispatch) {
  const endpoint = 'api/users/' + chatPartnerId + '/details';
  try {
    const result = await fetch(endpoint, {
      headers: getAuthHeaders()
    });
    const data = await result.json();
    const chatPartner = {
      id: data.id,
      photo:  data.photo,
      name: data.name,
      interests: data.interests,
      username: data.username
    };
    dispatch({
      type: types.LOADED,
      data: chatPartner
    });
  } catch(e) {
    console.log(e);
  }
};

export const loadChatPartnerData = (chatPartnerId) => (dispatch) => {
  dispatch({type: types.LOADING});
  awaitFetch(chatPartnerId, dispatch);
};


const initialState = {
  loading: false,
  loaded: false,
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
          loading: false,
          loaded: true,
          data: action.data
        };
    default:
      return state;
  };
};

export default {
  reducer
};
