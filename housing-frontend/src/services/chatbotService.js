// import api from "../config/api";
import api from "./api";

console.log("API =", api);
console.log("TYPE =", typeof api);

// export const assistantSearch = (message) =>
//   api.post("recherche/assistant/", { message });


// API chatbot avancé
// export const chatbotSearch = (message, conversationId = null) =>
//   api.post("recherche/chatbot/", { 
//     message,
//     conversation_id: conversationId 
//   });

  export const chatbotSearch = (message) => {
  return api.post("/assistant/search/", { message });
};

// Ancienne API (rétrocompatibilité)
export const assistantSearch = (message) =>
  api.post("recherche/assistant/", { message });

// Récupérer une conversation
export const getConversation = (conversationId) =>
  api.get(`recherche/conversation/${conversationId}/`);

// Liste des conversations
export const getUserConversations = () =>
  api.get("recherche/conversations/");