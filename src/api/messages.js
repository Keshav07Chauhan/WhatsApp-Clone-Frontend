import API from "./client";

export const apiGetConversation = (wa_id) =>
  API.post("/message/conversation", { wa_id });

export const apiSendMessage = (to, text) =>
  API.post("/message", { to, text });

export const apiDeleteMessage = (msgId) =>
  API.delete(`/message/${msgId}`);

export const apiUpdateMessage = (msgId, text) =>
  API.put(`/message/${msgId}`, { text });

export const apiUnreadCount = (contactWaId) =>
  API.get(`/message/unread/count/${contactWaId}`);

export const apiMarkRead = (contactWaId) =>
  API.put(`/message/read/${contactWaId}`);
