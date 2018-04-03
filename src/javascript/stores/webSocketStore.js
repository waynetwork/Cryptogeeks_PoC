import io from 'socket.io-client';

// move to local storage
const delayedMessages = [];

let currentConnection = null;
let messageHandler = null;
let connectionCloseHandler = null;
let connectionSuccessHandler = null;
let userId = null;
let intialized = false;

export const initWebSocketStore = (newUserId, newMessageHandler, 
    newConnectionSuccessHandler, newConnectionCloseHandler) => {
    messageHandler = newMessageHandler || (() => {throw new Error('Message handle required');})();
    connectionCloseHandler = newConnectionCloseHandler || (() => {});
    connectionSuccessHandler = newConnectionSuccessHandler || (() => {});
    if (!intialized && !isConnected()) {
        userId = newUserId;
        newConnection();
        intialized = true;
    }
};

export const send = async function send(msg) {
    if (!userId && !messageHandler) {
        throw new Error('call initStore first');
    }
    const result = await managedSend(msg); 
    console.log("send message: " + msg);
    return result;
}

export const markDelivered = async function markDelivered(msg) {
    currentConnection.emit('MESSAGE_DELIVERED', msg.id);
}

const managedSend = async function managedSend(msg) {
    if (isConnected()) {
        currentConnection.emit('NEW_MESSAGE', msg);
        console.log("Supposed to be SENT. :D", msg)
        return true;
    } else {
        // connection issue, store messages locally
        delayedMessages.push(msg);
        // newConnection();
        return false;
    }
};

const isConnected = function isConnected() {
    return currentConnection && currentConnection.connected;
}

const newConnection = async function newConnection() {
    let connection = io(WEBSOCKET_BASE_URL + 
        'messaging?user_id=' + userId + '&token=' + sessionStorage.getItem('token'));
    console.log("New connection setted up");
    addMessagehandler(connection);
    addClosehandler(connection);
    addConnectionhandler(connection);
    console.log("New connection Finished", connection);
    return connection;
} 

const onSuccess = function onSuccess() {
    // indirection so that connectionSuccessHandler can be replaced after connection had been created
    connectionSuccessHandler();
}

const onMessage = function onMessage(event) {
    // indirection so that messageHandler can be replaced after connection had been created
    messageHandler(event);
}

const onClose = function onClose() {
    // indirection so that connectionCloseHandler can be replaced after connection had been created
    connectionCloseHandler();
}

function sendDelayedMessages() {
    while (delayedMessages.length && isConnected()) {
        currentConnection.emit('NEW_MESSAGE', delayedMessages.shift());
    }
}

const addConnectionhandler = function addConnectionhandler(connection) {
    connection.on('connect', () => {
        currentConnection = connection;
        // send previously delayed messages after a small delay
        setTimeout(() => {
            sendDelayedMessages();
            onSuccess();
        }, 500);
    });
}

const addMessagehandler = function addMessagehandler(connection) {
    connection.on('NEW_MESSAGE', (msg) => {
        console.log('message received', JSON.stringify(msg));
        onMessage(msg);
    });
}

const addClosehandler = function addClosehandler(connection) {
    connection.on('disconnect', (reason) => {
        console.log('chat connection closed ', reason);
        onClose();
    });
} 

