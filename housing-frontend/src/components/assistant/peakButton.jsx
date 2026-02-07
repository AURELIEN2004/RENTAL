import { speak } from "../../services/ttsService";


const SpeakButton = ({ text, lang }) => {
    
  return (
    <button onClick={() => speak(text, lang)}>
      🔊 Écouter la réponse
    </button>
  );
};

export default SpeakButton;
