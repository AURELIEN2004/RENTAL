// ============================================
// src/components/housing/CommentSection.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaStar, FaRegStar, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './CommentSection.css';

const CommentSection = ({ housingId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState({
    content: '',
    rating: 5
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadComments();
  }, [housingId]);

  const loadComments = async () => {
    try {
      const response = await api.get(`/comments/?housing=${housingId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Connectez-vous pour commenter');
      return;
    }

    if (!newComment.content.trim()) {
      toast.error('Veuillez Ã©crire un commentaire');
      return;
    }

    try {
      const data = {
        housing: housingId,
        content: newComment.content,
        rating: newComment.rating
      };

      if (editingId) {
        await api.patch(`/comments/${editingId}/`, data);
        toast.success('Commentaire modifiÃ©');
        setEditingId(null);
      } else {
        await api.post('/comments/', data);
        toast.success('Commentaire ajoutÃ©');
      }

      setNewComment({ content: '', rating: 5 });
      loadComments();
    } catch (error) {
      toast.error('Erreur lors de la publication');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;

    try {
      await api.delete(`/comments/${id}/`);
      toast.success('Commentaire supprimÃ©');
      loadComments();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (comment) => {
    setNewComment({
      content: comment.content,
      rating: comment.rating
    });
    setEditingId(comment.id);
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && setNewComment(prev => ({ ...prev, rating: star }))}
          >
            {star <= rating ? <FaStar className="filled" /> : <FaRegStar />}
          </span>
        ))}
      </div>
    );
  };

  if (loading) return <div>Chargement des commentaires...</div>;

  return (
    <div className="comment-section">
      <h2>Commentaires ({comments.length})</h2>

      {/* Formulaire ajout commentaire */}
      {user && (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="form-header">
            <img 
              src={user.photo || '/default-avatar.png'} 
              alt={user.username}
              className="user-avatar-sm"
            />
            <div>
              <strong>{user.username}</strong>
              <div className="rating-input">
                <label>Note:</label>
                {renderStars(newComment.rating, true)}
              </div>
            </div>
          </div>

          <textarea
            value={newComment.content}
            onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Partagez votre expÃ©rience..."
            rows="4"
            required
          />

          <div className="form-actions">
            {editingId && (
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  setEditingId(null);
                  setNewComment({ content: '', rating: 5 });
                }}
              >
                Annuler
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Modifier' : 'Publier'}
            </button>
          </div>
        </form>
      )}

      {/* Liste des commentaires */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">
            Aucun commentaire pour le moment. Soyez le premier Ã  donner votre avis !
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <img 
                  src={comment.user_photo || '/default-avatar.png'} 
                  alt={comment.user_name}
                  className="user-avatar-sm"
                />
                <div className="comment-meta">
                  <strong>{comment.user_name}</strong>
                  {renderStars(comment.rating)}
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {user && user.id === comment.user && (
                  <div className="comment-actions">
                    <button 
                      className="icon-btn"
                      onClick={() => handleEdit(comment)}
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="icon-btn danger"
                      onClick={() => handleDelete(comment.id)}
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              <p className="comment-content">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;