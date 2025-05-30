// src/socket.js (또는 socket.jsx)
/* import { io } from 'socket.io-client';

export const socket = io(' http://localhost:3001 https://effective-space-fortnight-jq9j5r6qjr2j5w7.github.dev:3001', {
    transports: ['websocket'],
});
 */
// src/socket.js
/* import { io } from 'socket.io-client';

const hostname = "https://effective-space-fortnight-jq9j5r6qjr2j5w7-3001.app.github.dev";
const socketURL = `https://${hostname}:3001`;

export const socket = io(socketURL, {
  transports: ['websocket'],
}); */

import { io } from 'socket.io-client';

// 서버 URL 포맷: https://[codespace]-3001.app.github.dev
const socketURL = 'https://effective-space-fortnight-jq9j5r6qjr2j5w7-3001.app.github.dev';

export const socket = io(socketURL, {
  transports: ['websocket'],
  secure: true,
});