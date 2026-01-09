import React, { useState, useRef } from 'react';
import { sendMessage } from '../../services/api';
import './MessageInput.css';

const MessageInput = ({ conversationId, onSendMessage }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('La vidéo est trop volumineuse (max 50MB)');
        return;
      }
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const clearMedia = () => {
    setImage(null);
    setVideo(null);
    setImagePreview(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!content.trim() && !image && !video) return;

    try {
      setSending(true);
      
      const formData = new FormData();
      formData.append('conversation', conversationId);
      if (content.trim()) {
        formData.append('content', content);
      }
      if (image) {
        formData.append('image', image);
      }
      if (video) {
        formData.append('video', video);
      }

      const newMessage = await sendMessage(formData);
      
      if (onSendMessage) {
        onSendMessage(newMessage);
      }

      setContent('');
      clearMedia();
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-container">
      {(imagePreview || videoPreview) && (
        <div className="media-preview">
          {imagePreview && (
            <div className="preview-item">
              <img src={imagePreview} alt="Preview" />
              <button 
                className="remove-media-btn"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                ✕
              </button>
            </div>
          )}
          {videoPreview && (
            <div className="preview-item">
              <video src={videoPreview} controls />
              <button 
                className="remove-media-btn"
                onClick={() => {
                  setVideo(null);
                  setVideoPreview(null);
                  if (videoInputRef.current) videoInputRef.current.value = '';
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      <div className="input-wrapper">
        <div className="media-buttons">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <button
            className="media-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Ajouter une image"
            disabled={sending}
          >
            🖼️
          </button>

          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            onChange={handleVideoSelect}
            style={{ display: 'none' }}
          />
          <button
            className="media-btn"
            onClick={() => videoInputRef.current?.click()}
            title="Ajouter une vidéo"
            disabled={sending}
          >
            🎥
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez votre message..."
          rows="1"
          disabled={sending}
          className="message-textarea"
        />

        <button
          className={`send-button ${(!content.trim() && !image && !video) || sending ? 'disabled' : ''}`}
          onClick={handleSend}
          disabled={(!content.trim() && !image && !video) || sending}
        >
          {sending ? '⏳' : '➤'}
        </button>
      </div>

      {content.length > 0 && (
        <div className="char-counter">
          {content.length} / 2000
        </div>
      )}
    </div>
  );
};

export default MessageInput;