// src/socket.js
import { io } from "socket.io-client";

export const socket = io("https://whatsapp-clone-backend-xytk.onrender.com/api/v1", {
  autoConnect: false, // we'll connect manually in ChatPage
  withCredentials: true
});
