import Push from 'push.js';

export const types = {
  USER_JOINED_WAITLIST: 'USER_JOINED_WAITLIST',
  NEW_MESSAGE_RECEIVED: 'NEW_MESSAGE_RECEIVED'
};

const getType = (typeName) => {
  if(typeName && typeName in types) {
    return typeName;
  } else {
    return undefined;
  }
};

const notificationOptions = {
  icon: 'assets/waitlistlogo.svg'
};

export const requestPermissionForNotifications = () => {
  if(FEATURE_NOTIFICATIONS) {
    Push.Permission.request();
  }
};

export const notify = (message, type, body) => {
  if(FEATURE_NOTIFICATIONS) {
    if (Push.Permission.has()) {
      const options = {
        ...notificationOptions,
        tag: getType(type),
        body
      };
      Push.create(message, options);
    }
  }
};
