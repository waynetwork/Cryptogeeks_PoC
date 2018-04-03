import ReactGA from 'react-ga';

export const events = {
  USER_SELECTED_LOCATION: 'User selected a location',
  USER_CHANGED_WAITING_TIME: 'User changed waiting time',
  USER_UPLOADED_PROFILE_PHOTO: 'User uploaded profile photo',
  USER_CHANGED_PROFILE_DATA: 'User changed profile data',
  USER_SEND_MESSAGE: 'User send a chat message',
  USER_RECEIVED_MESSAGE: 'User received a chat message',
  USER_LOGGED_IN: 'User logged in with account',
  USER_REGISTERED_ACCOUNT: 'User registered an account'
};

export const initializeGoogleAnalytics = () => {
  if(GOOGLE_ANALYTICS_ID.length > 0) {
    const options = {
      debug: DEVELOPMENT_MODE
    };
    console.log("initialize Google Analytics", options);
    ReactGA.initialize(GOOGLE_ANALYTICS_ID, options);
  }
};

export const trackPageView = (path) => {
  if(GOOGLE_ANALYTICS_ID.length > 0) {
    ReactGA.pageview(path);
  }
};

export const trackEvent = async function trackEvent(action, parameters = {}) {
  if(GOOGLE_ANALYTICS_ID.length > 0) {
    const {label = null, value = null} = parameters;
    ReactGA.event({
      category: 'User',
      action,
      label,
      value
    });
  }
};
