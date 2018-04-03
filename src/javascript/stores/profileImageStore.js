import _ from 'lodash';
import { reloadProfileImage } from './userStore';
import { getAuthHeaders } from '../util/headers';

const types = {
  SHOW_MODAL: 'PROFILE_IMAGE_SHOW_MODAL',
  SET_IMAGE: 'PROFILE_IMAGE_SET_IMAGE',
  UPLOADED_IMAGE: 'PROFILE_IMAGE_UPLOADED_IMAGE'
};

export const showModal = (isVisible) => ({
  type: types.SHOW_MODAL,
  isVisible
});

export const setImage = ({ fileName, data }) => ({
  type: types.SET_IMAGE,
  fileName: fileName,
  data
});

export const uploadImage = ({ fileName, data }) => dispatch => {
  awaitFetch(fileName, data, dispatch);
};

const awaitFetch = async function awaitFetch(fileName, data, dispatch) {
  console.log(fileName, data)
  const userId = sessionStorage.getItem('userId');
  const endpoint = `api/users/${userId}/photo`;
  try {
    const formData = new FormData();
    formData.append('photo', data);
    const result = await fetch(endpoint, {
      method: 'post',
      body: formData,
      headers: getAuthHeaders()
    });
    const resJson = await result.json();
    dispatch({ type: types.UPLOADED_IMAGE });
    dispatch(reloadProfileImage(userId));
  } catch (e) {
    console.log(e);
  }
};


const initialState = {
  showModal: false,
  fileName: null,
  data: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SHOW_MODAL:
      return {
        ...state,
        showModal: action.isVisible
      };
    case types.SET_IMAGE:
      return {
        ...state,
        fileName: action.fileName,
        data: action.data
      };
    case types.UPLOADED_IMAGE:
      return state;
    default:
      return state;
  };
};

export default {
  reducer
};
