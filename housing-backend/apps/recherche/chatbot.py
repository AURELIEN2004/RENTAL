# ============================================
# 📁 apps/recherche/chatbot.py
# ============================================

"""
Chatbot de recherche avec LLM local (Ollama) et reconnaissance vocale
Pour le LLM local, nous utilisons Ollama avec le modèle Mistral-7B ou Llama2
"""

import json
import uuid
from typing import Dict, List, Optional
from datetime import datetime

from .models import ChatbotConversation, ChatbotMessage
from .search_engine import NaturalLanguageSearchEngine


class LocalChatbot:
    """
    Chatbot utilisant un LLM local via Ollama
    
    Installation Ollama:
    1. Télécharger depuis https://ollama.ai
    2. Installer: curl -fsSL https://ollama.ai/install.sh | sh
    3. Lancer un modèle: ollama run mistral (ou llama2)
    """
    
    def __init__(self, language='fr', model='mistral'):
        self.language = language
        self.model = model
        self.search_engine = NaturalLanguageSearchEngine(language=language)
        self.ollama_available = self._check_ollama()
    
    def _check_ollama(self) -> bool:
        """Vérifie si Ollama est disponible"""
        try:
            import requests
            response = requests.get('http://localhost:11434/api/tags', timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def chat(
        self,
        user_message: str,
        session_id: Optional[str] = None,
        user=None,
        is_voice: bool = False
    ) -> Dict:
        """
        Traite un message utilisateur
        
        Args:
            user_message: Message de l'utilisateur
            session_id: ID de session (créé si non fourni)
            user: Utilisateur Django (optionnel)
            is_voice: Si le message provient de la voix
        
        Returns:
            Dictionnaire avec réponse et résultats
        """
        # Créer ou récupérer la conversation
        if not session_id:
            session_id = str(uuid.uuid4())
        
        conversation, created = ChatbotConversation.objects.get_or_create(
            session_id=session_id,
            defaults={'user': user, 'language': self.language}
        )
        
        # Sauvegarder le message utilisateur
        ChatbotMessage.objects.create(
            conversation=conversation,
            role='user',
            content=user_message,
            is_voice=is_voice
        )
        
        # Analyser l'intention
        intent = self._analyze_intent(user_message)
        
        if intent == 'search':
            # Recherche de logements
            response = self._handle_search(user_message, user)
        elif intent == 'greeting':
            response = self._handle_greeting()
        elif intent == 'help':
            response = self._handle_help()
        else:
            response = self._handle_general(user_message, conversation)
        
        # Sauvegarder la réponse
        ChatbotMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=response['message'],
            search_results=response.get('results', [])
        )
        
        return {
            'session_id': session_id,
            'message': response['message'],
            'results': response.get('results'),
            'intent': intent
        }
    
    def _analyze_intent(self, message: str) -> str:
        """Analyse l'intention du message"""
        message_lower = message.lower()
        
        # Salutations
        greetings_fr = ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou']
        greetings_en = ['hello', 'hi', 'hey', 'good morning', 'good evening']
        greetings = greetings_fr if self.language == 'fr' else greetings_en
        
        if any(word in message_lower for word in greetings):
            return 'greeting'
        
        # Aide
        help_keywords_fr = ['aide', 'aider', 'comment', 'faire']
        help_keywords_en = ['help', 'how', 'what can you do']
        help_keywords = help_keywords_fr if self.language == 'fr' else help_keywords_en
        
        if any(word in message_lower for word in help_keywords):
            return 'help'
        
        # Recherche (par défaut)
        search_keywords_fr = ['cherche', 'trouver', 'logement', 'appartement', 'maison', 'studio', 'chambre']
        search_keywords_en = ['search', 'find', 'looking for', 'apartment', 'house', 'studio', 'room']
        search_keywords = search_keywords_fr if self.language == 'fr' else search_keywords_en
        
        if any(word in message_lower for word in search_keywords):
            return 'search'
        
        # Si nombres ou prix mentionnés, c'est probablement une recherche
        if any(char.isdigit() for char in message):
            return 'search'
        
        return 'general'
    
    def _handle_search(self, message: str, user) -> Dict:
        """Gère une requête de recherche"""
        # Utiliser le moteur de recherche en langage naturel
        search_result = self.search_engine.parse_and_search(message, user)
        
        return {
            'message': search_result['response'],
            'results': self._format_results(search_result['results']),
            'total_count': search_result['total_count']
        }
    
    def _handle_greeting(self) -> Dict:
        """Gère les salutations"""
        if self.language == 'fr':
            message = """Bonjour ! 👋 Je suis votre assistant de recherche de logements.

Je peux vous aider à trouver le logement idéal en fonction de vos critères.

Vous pouvez me dire par exemple :
• "Je cherche un appartement à Yaoundé"
• "Une maison avec 3 chambres moins de 150000 FCFA"
• "Studio proche d'une école"

Comment puis-je vous aider aujourd'hui ?"""
        else:
            message = """Hello! 👋 I'm your housing search assistant.

I can help you find the ideal accommodation based on your criteria.

You can tell me for example:
• "I'm looking for an apartment in Yaoundé"
• "A house with 3 bedrooms under 150000 FCFA"
• "Studio near a school"

How can I help you today?"""
        
        return {'message': message}
    
    def _handle_help(self) -> Dict:
        """Gère les demandes d'aide"""
        if self.language == 'fr':
            message = """Je peux vous aider de plusieurs façons :

🔍 **Recherche de logements**
Décrivez ce que vous cherchez et je trouverai les meilleurs résultats.

💰 **Filtres disponibles**
• Prix (min/max)
• Nombre de chambres
• Surface
• Ville/Quartier
• Proximité (école, supermarché, transport...)

📍 **Exemples de recherches**
• "Appartement 2 chambres à Douala maximum 100000"
• "Maison avec jardin proche d'une école"
• "Studio meublé dans le centre-ville"

✨ **Astuce**
Plus vous êtes précis, meilleurs seront les résultats !"""
        else:
            message = """I can help you in several ways:

🔍 **Housing Search**
Describe what you're looking for and I'll find the best results.

💰 **Available Filters**
• Price (min/max)
• Number of bedrooms
• Area
• City/District
• Proximity (school, supermarket, transport...)

📍 **Search Examples**
• "2 bedroom apartment in Douala maximum 100000"
• "House with garden near a school"
• "Furnished studio in city center"

✨ **Tip**
The more specific you are, the better the results!"""
        
        return {'message': message}
    
    def _handle_general(self, message: str, conversation: ChatbotConversation) -> Dict:
        """Gère les messages généraux avec le LLM"""
        if not self.ollama_available:
            return self._fallback_response(message)
        
        try:
            # Préparer le contexte de conversation
            history = self._get_conversation_history(conversation)
            
            # Appeler Ollama
            response = self._call_ollama(message, history)
            
            return {'message': response}
        except Exception as e:
            print(f"Erreur Ollama: {e}")
            return self._fallback_response(message)
    
    def _call_ollama(self, message: str, history: List[Dict]) -> str:
        """Appelle l'API Ollama"""
        import requests
        
        system_prompt = self._get_system_prompt()
        
        messages = [{'role': 'system', 'content': system_prompt}]
        messages.extend(history)
        messages.append({'role': 'user', 'content': message})
        
        response = requests.post(
            'http://localhost:11434/api/chat',
            json={
                'model': self.model,
                'messages': messages,
                'stream': False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()['message']['content']
        else:
            raise Exception(f"Ollama error: {response.status_code}")
    
    def _get_system_prompt(self) -> str:
        """Retourne le prompt système"""
        if self.language == 'fr':
            return """Tu es un assistant spécialisé dans la recherche de logements au Cameroun.
Tu aides les utilisateurs à trouver des appartements, maisons, studios, etc.
Tu es amical, professionnel et précis.
Si l'utilisateur cherche un logement, encourage-le à être spécifique sur ses critères."""
        else:
            return """You are an assistant specialized in housing search in Cameroon.
You help users find apartments, houses, studios, etc.
You are friendly, professional and precise.
If the user is looking for housing, encourage them to be specific about their criteria."""
    
    def _get_conversation_history(self, conversation: ChatbotConversation) -> List[Dict]:
        """Récupère l'historique de conversation"""
        messages = conversation.messages.order_by('created_at')[-10:]  # 10 derniers messages
        return [
            {'role': msg.role, 'content': msg.content}
            for msg in messages
        ]
    
    def _fallback_response(self, message: str) -> Dict:
        """Réponse de secours si Ollama n'est pas disponible"""
        if self.language == 'fr':
            response = """Je suis désolé, je n'ai pas bien compris votre demande.

Pouvez-vous reformuler en précisant :
• Le type de logement recherché
• Votre budget
• La ville souhaitée
• Vos critères importants

Exemple: "Je cherche un appartement 2 chambres à Yaoundé, maximum 120000 FCFA" """
        else:
            response = """I'm sorry, I didn't quite understand your request.

Can you rephrase by specifying:
• The type of housing you're looking for
• Your budget
• The desired city
• Your important criteria

Example: "I'm looking for a 2 bedroom apartment in Yaoundé, maximum 120000 FCFA" """
        
        return {'message': response}
    
    def _format_results(self, results) -> List[Dict]:
        """Formate les résultats pour le JSON"""
        return [
            {
                'id': housing.id,
                'title': housing.title,
                'price': float(housing.price),
                'city': housing.city.name,
                'district': housing.district.name if housing.district else None,
                'rooms': housing.rooms,
                'area': float(housing.area) if housing.area else None,
                'image': housing.images.filter(is_main=True).first().image.url if housing.images.filter(is_main=True).exists() else None
            }
            for housing in results
        ]


class VoiceRecognition:
    """Reconnaissance vocale bilingue (FR/EN)"""
    
    def __init__(self, language='fr'):
        self.language = language
    
    def transcribe(self, audio_file) -> str:
        """
        Transcrit un fichier audio en texte
        
        Utilise la bibliothèque SpeechRecognition avec Google Speech API
        (gratuite pour usage limité)
        """
        try:
            import speech_recognition as sr
            
            recognizer = sr.Recognizer()
            
            # Lire le fichier audio
            with sr.AudioFile(audio_file) as source:
                audio = recognizer.record(source)
            
            # Transcrire
            lang_code = 'fr-FR' if self.language == 'fr' else 'en-US'
            text = recognizer.recognize_google(audio, language=lang_code)
            
            return text
        except Exception as e:
            print(f"Erreur transcription: {e}")
            return ""
    
    def transcribe_whisper(self, audio_file) -> str:
        """
        Transcrit avec Whisper (OpenAI) - Option locale
        
        Installation: pip install openai-whisper
        """
        try:
            import whisper
            
            model = whisper.load_model("base")  # ou "small", "medium"
            result = model.transcribe(audio_file, language=self.language)
            
            return result["text"]
        except Exception as e:
            print(f"Erreur Whisper: {e}")
            return ""