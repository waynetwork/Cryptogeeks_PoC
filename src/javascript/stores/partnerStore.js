import _ from 'lodash';

const types = {
  LOADING: 'PARTNERS_LOADING',
  LOADED: 'PARTNERS_LOADED'
};

const awaitFetch = async function awaitFetch(dispatch) {
  const endpoint = 'api/partners';
  try {
    const result = await fetch(endpoint);
    const resJson = await result.json();
    const partners = [];
    _.each(resJson, entry => {
      partners.push({
        id: entry._id,
        name: entry.name,
        uniqueKey: entry.unique_key,
        industry: entry.industry,
        location: entry.location,
        createdAt: entry.createdAt
      });
    });
    dispatch({
      type: types.LOADED,
      data: partners
    });
  } catch(e) {
    console.log(e);
  }
};

export const loadPartnerData = () => (dispatch) => {
  dispatch({type: types.LOADING});
  awaitFetch(dispatch);
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
