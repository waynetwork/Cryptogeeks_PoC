export const handle401 = (response, dispatch) => {
  return new Promise((resolve, reject) => {
    if (response.status == 401) {
      sessionStorage.clear();
      dispatch({action: 'ACCOUNT_LOGOUT'});
      reject('Invalid token!');
    } else {
      resolve(response);
    }
  });
};
