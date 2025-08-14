// src/socket.js
import { io } from "socket.io-client";

export const socket = io(`${import.meta.env.VITE_API_BASE_URL}`, {
  autoConnect: false, // we'll connect manually in ChatPage
  withCredentials: true
});
