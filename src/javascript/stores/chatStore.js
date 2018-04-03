import _ from 'lodash';
import {getAuthHeaders} from '../util/headers';
import {notify, types as notificationTypes} from '../util/notification';

const types = {
  LOADING: 'CHAT_LOADING',
  LOADED: 'CHAT_LOADED',
  ADDMESSAGE: 'CHAT_ADD_MESSAGE',
};

const getUsername = (userId) => {
  // TODO: This is highly inefficient and has to be refactored!
  const usernames = JSON.parse(sessionStorage.getItem('usernames'));
  return usernames[userId];
};

export const notifyNewMessage = (message) => {
  const currentPath = window.location.hash;
  const userId = sessionStorage.getItem('userId');
  if(message.sender != userId && !currentPath.includes(message.sender)) {
    const senderName = getUsername(message.sender).name;
    notify(`New message from ${senderName}`, notificationTypes.NEW_MESSAGE_RECEIVED, message.message);
  }
};

export const transformMessages = (messages) => {
  const transformedMessages = [];
  _.each(messages, entry => {
    transformedMessages.push({
      id: entry.id,
      local_id: entry.local_id,
      sender: entry.sender_id,
      receiver: entry.receiver_id,
      message: entry.message,
      delivered: entry.delivered,
      createdAt: entry.created_at
    });
  });
  return transformedMessages;
};

const sortMessages = (messages) => {
  const distinctMessages = _(messages)
  .orderBy('createdAt', 'desc')
  .uniqBy('local_id') // uniqBy will remove duplicates(locally added messages when offline) by keeping only the first occurrence
  .reverse() // reverse again to make it createdAt asc
  .value();
  return distinctMessages;
};

export const loadMessages = (userId, chatPartnerId) => (dispatch) => {
  dispatch({type: types.LOADING});

  const endpoint = `api/messages/receive?buddy_id=${chatPartnerId}`;
  console.log("load chat: " + endpoint);

  fetch(endpoint, {
    method: 'post',
    headers: getAuthHeaders()
  })
  .then((res) => res.json())
  .then((data) => {
    console.log("receive chat messages: " + JSON.stringify(data));
    const messages = transformMessages(data);
    dispatch({
      type: types.LOADED,
      data: messages
    });
  });
};

export const addMessagesToChat = (messages, chatPartnerId) => {
  const transformedMessages = transformMessages(messages);
  _.each(transformedMessages, (message) => {
    notifyNewMessage(message);
  });
  const messagesFromOpenChatOnly = _.filter(transformedMessages, (msg) => {
    return msg.sender === chatPartnerId || msg.receiver === chatPartnerId;
  });
  return {
    type: types.ADDMESSAGE,
    data: messagesFromOpenChatOnly
  };
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
        loading: true,
        loaded: false,
        data: []
      };
      case types.LOADED:
        return {
          loading: false,
          loaded: true,
          data: sortMessages(action.data)
        };
      case types.ADDMESSAGE:
        const newMessages = action.data;
        const allMessages = sortMessages(newMessages.concat(state.data));
        return {
          ...state,
          data: allMessages
        };
    default:
      return state;
  };
};

export default {
  reducer
};
