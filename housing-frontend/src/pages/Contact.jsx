

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("access_key", "974f9203-d46c-42e3-94ed-4d9d6c61b1b2");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("message", formData.message);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Message envoyé avec succès ! Nous vous répondrons rapidement."
        );
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        console.error("Web3Forms error:", data);
        toast.error("Erreur lors de l’envoi du message.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Impossible d’envoyer le message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">

        {/* Hero */}
        <section className="contact-hero">
          <h1>Contactez-nous</h1>
          <p>Une question ? Une suggestion ? Nous sommes là pour vous aider !</p>
        </section>

        <div className="contact-content">

          {/* Formulaire */}
          <div className="contact-form-section">
            <h2>Envoyez-nous un message</h2>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label>Sujet *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Sujet de votre message"
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Écrivez votre message ici..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default Contact;
