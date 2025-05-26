// src/socket.js (또는 socket.jsx)
import { io } from 'socket.io-client';

export const socket = io('http://localhost:3001', {
    transports: ['websocket'],
});
