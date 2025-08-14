import API from "./client";

export const apiLogin = (wa_id, password) =>
  API.post("/contact/login", { wa_id, password });

export const apiRegister = (name, wa_id, password) =>
  API.post("/contact/register", { name, wa_id, password });
