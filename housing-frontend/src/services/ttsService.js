
// src/services/ttsService.js - VERSION COMPLÈTE

export const speak = (text, lang = "fr-FR") => {
  if (!window.speechSynthesis) {
    console.warn("Text-to-Speech non supporté");
    return;
  }

  // Stop si déjà en train de parler
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};
