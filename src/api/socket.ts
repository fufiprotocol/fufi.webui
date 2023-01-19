import io from 'socket.io-client';
const socketOptions = {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 1000,
  reconnectionAttempts: 1,
  query: {
    "tradePairCode": "METH_MUSDT",
    "account": "merchantxpro"
  },
  transports: ['websocket', 'polling']
}
const socket = io(process.env.REACT_APP_SOCKET, socketOptions);

export default socket