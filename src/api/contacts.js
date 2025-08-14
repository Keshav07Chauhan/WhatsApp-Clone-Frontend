import API from "./client";

export const apiGetContacts = () => API.get("/contact");
export const apiAddContact = (phone) => API.post("/contact/add", { phone });
