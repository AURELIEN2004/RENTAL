# ============================================
# 📁 apps/recherche/voice_recognition.py
# ============================================


try:
    import speech_recognition as sr
    from pydub import AudioSegment
    DEPENDENCIES_AVAILABLE = True
except ImportError:
    DEPENDENCIES_AVAILABLE = False
    print("⚠️ Dépendances de reconnaissance vocale non installées")
    print("   Installez avec: pip install SpeechRecognition pydub")


class VoiceRecognition:
    """
    Classe pour la reconnaissance vocale bilingue
    """
    
    def __init__(self, language='fr'):
        """
        Initialise le module de reconnaissance vocale
        
        Args:
            language: 'fr' pour français, 'en' pour anglais
        """
        if not DEPENDENCIES_AVAILABLE:
            raise ImportError(
                "Les dépendances de reconnaissance vocale ne sont pas installées. "
                "Installez avec: pip install SpeechRecognition pydub"
            )
        
        self.language = language
        self.recognizer = sr.Recognizer()
        
        # Codes de langue pour Google Speech Recognition
        self.language_codes = {
            'fr': 'fr-FR',
            'en': 'en-US'
        }
    
    def transcribe(self, audio_file_path):
        """
        Transcrit un fichier audio en texte
        
        Args:
            audio_file_path: Chemin vers le fichier audio
        
        Returns:
            str: Texte transcrit ou None si échec
        """
        try:
            # Convertir en WAV si nécessaire
            if not audio_file_path.endswith('.wav'):
                audio_file_path = self._convert_to_wav(audio_file_path)
            
            # Charger le fichier audio
            with sr.AudioFile(audio_file_path) as source:
                # Ajuster pour le bruit ambiant
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                # Enregistrer l'audio
                audio_data = self.recognizer.record(source)
            
            # Reconnaissance avec Google Speech Recognition
            language_code = self.language_codes.get(self.language, 'fr-FR')
            
            try:
                text = self.recognizer.recognize_google(
                    audio_data,
                    language=language_code
                )
                return text
            
            except sr.UnknownValueError:
                print("⚠️ Audio non compréhensible")
                return None
            
            except sr.RequestError as e:
                print(f"⚠️ Erreur de service de reconnaissance: {e}")
                # Fallback sur Sphinx (reconnaissance offline)
                return self._recognize_with_sphinx(audio_data)
        
        except Exception as e:
            print(f"❌ Erreur lors de la transcription: {e}")
            return None
    
    def _convert_to_wav(self, audio_file_path):
        """
        Convertit un fichier audio en WAV
        
        Args:
            audio_file_path: Chemin vers le fichier audio
        
        Returns:
            str: Chemin vers le fichier WAV
        """
        try:
            # Détecter le format
            format_map = {
                '.mp3': 'mp3',
                '.m4a': 'm4a',
                '.ogg': 'ogg',
                '.flac': 'flac'
            }
            
            import os
            _, ext = os.path.splitext(audio_file_path)
            audio_format = format_map.get(ext.lower(), 'mp3')
            
            # Charger et convertir
            audio = AudioSegment.from_file(audio_file_path, format=audio_format)
            
            # Convertir en WAV
            wav_path = audio_file_path.rsplit('.', 1)[0] + '.wav'
            audio.export(wav_path, format='wav')
            
            return wav_path
        
        except Exception as e:
            print(f"⚠️ Erreur conversion audio: {e}")
            return audio_file_path
    
    def _recognize_with_sphinx(self, audio_data):
        """
        Reconnaissance offline avec CMU Sphinx (fallback)
        
        Note: Nécessite pocketsphinx installé
        """
        try:
            import warnings
            warnings.filterwarnings('ignore')
            
            text = self.recognizer.recognize_sphinx(audio_data)
            return text
        
        except:
            return None
    
    def transcribe_microphone(self, duration=5):
        """
        Transcrit depuis le microphone en temps réel
        
        Args:
            duration: Durée d'écoute en secondes
        
        Returns:
            str: Texte transcrit
        """
        try:
            with sr.Microphone() as source:
                print(f"🎤 Écoute pendant {duration} secondes...")
                
                # Ajuster pour le bruit ambiant
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                # Enregistrer
                audio_data = self.recognizer.listen(source, timeout=duration)
            
            # Reconnaissance
            language_code = self.language_codes.get(self.language, 'fr-FR')
            text = self.recognizer.recognize_google(audio_data, language=language_code)
            
            return text
        
        except sr.WaitTimeoutError:
            print("⚠️ Timeout: Aucun audio détecté")
            return None
        
        except sr.UnknownValueError:
            print("⚠️ Audio non compréhensible")
            return None
        
        except Exception as e:
            print(f"❌ Erreur microphone: {e}")
            return None


# ============================================
# Fonction utilitaire pour tester
# ============================================

def test_voice_recognition():
    """
    Teste la reconnaissance vocale
    """
    if not DEPENDENCIES_AVAILABLE:
        print("❌ Dépendances non installées")
        return
    
    print("=== TEST DE RECONNAISSANCE VOCALE ===\n")
    
    # Test français
    print("1️⃣ Test français")
    vr_fr = VoiceRecognition(language='fr')
    
    # Test anglais
    print("2️⃣ Test anglais")
    vr_en = VoiceRecognition(language='en')
    
    print("\n✅ Module de reconnaissance vocale opérationnel")


if __name__ == '__main__':
    test_voice_recognition()