

// import React, { useState } from 'react';
// import { toast } from 'react-toastify';
// import './Contact.css';

// const Contact = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     subject: '',
//     message: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formDataToSend = new FormData();

//       formDataToSend.append("access_key", "974f9203-d46c-42e3-94ed-4d9d6c61b1b2");
//       formDataToSend.append("name", formData.name);
//       formDataToSend.append("email", formData.email);
//       formDataToSend.append("subject", formData.subject);
//       formDataToSend.append("message", formData.message);

//       const response = await fetch("https://api.web3forms.com/submit", {
//         method: "POST",
//         body: formDataToSend
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast.success(
//           "Message envoyé avec succès ! Nous vous répondrons rapidement."
//         );
//         setFormData({
//           name: '',
//           email: '',
//           subject: '',
//           message: ''
//         });
//       } else {
//         console.error("Web3Forms error:", data);
//         toast.error("Erreur lors de l’envoi du message.");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Impossible d’envoyer le message.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="contact-page">
//       <div className="container">

//         {/* Hero */}
//         <section className="contact-hero">
//           <h1>Contactez-nous</h1>
//           <p>Une question ? Une suggestion ? Nous sommes là pour vous aider !</p>
//         </section>

//         <div className="contact-content">

//           {/* Formulaire */}
//           <div className="contact-form-section">
//             <h2>Envoyez-nous un message</h2>

//             <form onSubmit={handleSubmit} className="contact-form">
//               <div className="form-group">
//                 <label>Nom complet *</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Votre nom"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Email *</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   placeholder="votre@email.com"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Sujet *</label>
//                 <input
//                   type="text"
//                   name="subject"
//                   value={formData.subject}
//                   onChange={handleChange}
//                   required
//                   placeholder="Sujet de votre message"
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Message *</label>
//                 <textarea
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   required
//                   rows="6"
//                   placeholder="Écrivez votre message ici..."
//                 ></textarea>
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-primary btn-block"
//                 disabled={loading}
//               >
//                 {loading ? 'Envoi en cours...' : 'Envoyer le message'}
//               </button>
//             </form>
//           </div>

         
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Contact;


// src/pages/Contact.jsx — VERSION BILINGUE + DARK MODE
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Contact.css';

const Contact = () => {
  const { t, language } = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success(t('contact_success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      <div className="container">

        <section className="contact-hero">
          <h1>{t('contact_title')}</h1>
          <p>{t('contact_subtitle')}</p>
        </section>

        <div className="contact-content">
          {/* Formulaire */}
          <div className="contact-form-section">
            <h2>{language === 'en' ? 'Send us a message' : 'Envoyez-nous un message'}</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>{t('contact_name')} *</label>
                <input type="text" name="name" value={formData.name}
                  onChange={handleChange} required
                  placeholder={t('contact_name')} />
              </div>
              <div className="form-group">
                <label>{t('contact_email')} *</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} required placeholder="exemple@email.com" />
              </div>
              <div className="form-group">
                <label>{t('contact_subject')} *</label>
                <input type="text" name="subject" value={formData.subject}
                  onChange={handleChange} required
                  placeholder={t('contact_subject')} />
              </div>
              <div className="form-group">
                <label>{t('contact_message')} *</label>
                <textarea name="message" value={formData.message}
                  onChange={handleChange} required rows="6"
                  placeholder={language === 'en' ? 'Write your message here...' : 'Écrivez votre message ici...'} />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? t('contact_sending') : t('contact_send')}
              </button>
            </form>
          </div>

          {/* Infos contact */}
          <div className="contact-info-section">
            <h2>{t('contact_info_title')}</h2>

            <div className="contact-info-card">
              <div className="info-icon"><FaPhone /></div>
              <div className="info-content">
                <h3>{language === 'en' ? 'Phone' : 'Téléphone'}</h3>
                <p>+237 659887452</p>
                <a href="tel:+237659887452" className="btn btn-sm btn-outline">
                  {language === 'en' ? 'Call' : 'Appeler'}
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon"><FaWhatsapp /></div>
              <div className="info-content">
                <h3>WhatsApp</h3>
                <p>+237 659887452</p>
                <a href="https://wa.me/237659887452" target="_blank" rel="noopener noreferrer"
                  className="btn btn-sm btn-outline">
                  {t('contact_whatsapp')}
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon"><FaEnvelope /></div>
              <div className="info-content">
                <h3>Email</h3>
                <p>feudjioaurelien24@gmail.com</p>
                <a href="mailto:feudjioaurelien24@gmail.com" className="btn btn-sm btn-outline">
                  {language === 'en' ? 'Send email' : 'Envoyer un email'}
                </a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon"><FaMapMarkerAlt /></div>
              <div className="info-content">
                <h3>{language === 'en' ? 'Address' : 'Adresse'}</h3>
                <p>{t('contact_location')}</p>
              </div>
            </div>

            <div className="opening-hours">
              <h3>{language === 'en' ? 'Opening Hours' : 'Horaires de disponibilité'}</h3>
              <p><strong>{language === 'en' ? 'Mon - Fri:' : 'Lun - Ven :'}</strong> {t('contact_hours')}</p>
              <p><strong>{language === 'en' ? 'Saturday:' : 'Samedi :'}</strong> {language === 'en' ? '9am - 2pm' : '9h00 - 14h00'}</p>
              <p><strong>{language === 'en' ? 'Sunday:' : 'Dimanche :'}</strong> {language === 'en' ? 'Closed' : 'Fermé'}</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="contact-faq">
          <h2>{language === 'en' ? 'Frequently Asked Questions' : 'Questions Fréquentes'}</h2>
          <div className="faq-grid">
            {language === 'en' ? (
              <>
                <div className="faq-item"><h3>How much does it cost?</h3><p>Free for tenants. Landlords can post for free.</p></div>
                <div className="faq-item"><h3>How do I list a property?</h3><p>Create a landlord account, access your dashboard and click "Add a housing".</p></div>
                <div className="faq-item"><h3>Are listings verified?</h3><p>Yes, our team verifies all listings before publication.</p></div>
                <div className="faq-item"><h3>Can I contact landlords?</h3><p>Yes, via our integrated messaging, WhatsApp or by phone.</p></div>
              </>
            ) : (
              <>
                <div className="faq-item"><h3>Combien coûte l'utilisation ?</h3><p>L'utilisation est totalement gratuite pour les locataires. Les propriétaires peuvent publier gratuitement.</p></div>
                <div className="faq-item"><h3>Comment publier un logement ?</h3><p>Créez un compte propriétaire, accédez à votre dashboard et cliquez sur "Ajouter un logement".</p></div>
                <div className="faq-item"><h3>Les logements sont-ils vérifiés ?</h3><p>Oui, notre équipe vérifie tous les logements avant leur publication.</p></div>
                <div className="faq-item"><h3>Puis-je contacter les propriétaires ?</h3><p>Oui, via notre messagerie, WhatsApp ou par téléphone.</p></div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;