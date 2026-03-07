// src/components/quiz/PreferenceQuiz.jsx
// Quiz de préférences logement — alimente l'algorithme génétique
// Sauvegarde en localStorage ET envoie au backend API

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './PreferenceQuiz.css';

// ─── Données du quiz ──────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'city',
    icon: '🏙️',
    question: 'Dans quelle ville cherchez-vous ?',
    type: 'single',
    options: [
      { value: 'Yaoundé',    label: 'Yaoundé',    emoji: '🏛️' },
      { value: 'Douala',     label: 'Douala',     emoji: '🌊' },
      { value: 'Bafoussam',  label: 'Bafoussam',  emoji: '🏔️' },
      { value: 'Autre',      label: 'Autre ville', emoji: '📍' },
    ],
  },
  {
    id: 'category',
    icon: '🏠',
    question: 'Quel type de logement recherchez-vous ?',
    type: 'single',
    options: [
      { value: 'Studio',       label: 'Studio',       emoji: '🛏️' },
      { value: 'Chambre',      label: 'Chambre',      emoji: '🚪' },
      { value: 'Appartement',  label: 'Appartement',  emoji: '🏢' },
      { value: 'Maison',       label: 'Maison / Villa', emoji: '🏡' },
    ],
  },
  {
    id: 'budget',
    icon: '💰',
    question: 'Quel est votre budget mensuel ?',
    type: 'single',
    options: [
      { value: '0-30000',         label: 'Moins de 30 000 FCFA',       emoji: '💵' },
      { value: '30000-60000',     label: '30 000 – 60 000 FCFA',       emoji: '💴' },
      { value: '60000-100000',    label: '60 000 – 100 000 FCFA',      emoji: '💶' },
      { value: '100000-999999',   label: 'Plus de 100 000 FCFA',       emoji: '💎' },
    ],
  },
  {
    id: 'furnished',
    icon: '🛋️',
    question: 'Préférez-vous un logement meublé ?',
    type: 'single',
    options: [
      { value: 'true',      label: 'Oui, meublé',              emoji: '✅' },
      { value: 'false',     label: 'Non, vide',                emoji: '🔲' },
      { value: 'any',       label: 'Peu importe',              emoji: '🤷' },
    ],
  },
  {
    id: 'features',
    icon: '⭐',
    question: 'Quels équipements sont importants pour vous ?',
    type: 'multi',
    options: [
      { value: 'parking',        label: 'Parking',          emoji: '🚗' },
      { value: 'wifi',           label: 'Wi-Fi',            emoji: '📶' },
      { value: 'climatisation',  label: 'Climatisation',    emoji: '❄️' },
      { value: 'balcon',         label: 'Balcon/Terrasse',  emoji: '🌿' },
      { value: 'piscine',        label: 'Piscine',          emoji: '🏊' },
      { value: 'gardien',        label: 'Gardien/Sécurité', emoji: '🔒' },
      { value: 'eau',            label: 'Eau courante',     emoji: '💧' },
      { value: 'cuisine',        label: 'Cuisine équipée',  emoji: '🍳' },
    ],
  },
  {
    id: 'nearby',
    icon: '📍',
    question: 'Que souhaitez-vous avoir à proximité ?',
    type: 'multi',
    options: [
      { value: 'school',       label: 'École / Université',  emoji: '🎓' },
      { value: 'supermarket',  label: 'Supermarché',         emoji: '🛒' },
      { value: 'hospital',     label: 'Hôpital / Clinique',  emoji: '🏥' },
      { value: 'transport',    label: 'Transport en commun', emoji: '🚌' },
      { value: 'bank',         label: 'Banque / ATM',        emoji: '🏦' },
      { value: 'restaurant',   label: 'Restaurants',         emoji: '🍽️' },
    ],
  },
  {
    id: 'priority',
    icon: '🎯',
    question: 'Qu\'est-ce qui compte le plus dans votre choix ?',
    type: 'single',
    options: [
      { value: 'price',     label: 'Le prix avant tout',      emoji: '💰' },
      { value: 'location',  label: 'L\'emplacement',          emoji: '📌' },
      { value: 'comfort',   label: 'Le confort / équipements', emoji: '🛋️' },
      { value: 'security',  label: 'La sécurité du quartier', emoji: '🛡️' },
    ],
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────
const PreferenceQuiz = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const [step,      setStep]      = useState(0);   // -1 = intro, 0..N-1 = questions, N = summary
  const [answers,   setAnswers]   = useState({});
  const [saving,    setSaving]    = useState(false);
  const [phase,     setPhase]     = useState('intro'); // intro | quiz | summary

  const total = QUESTIONS.length;
  const q     = QUESTIONS[step];

  // ── Réponse simple ──
  const handleSingle = (value) => {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      setPhase('summary');
    }
  };

  // ── Réponse multiple ──
  const handleMulti = (value) => {
    const current = answers[q.id] || [];
    const updated  = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [q.id]: updated });
  };

  const handleMultiNext = () => {
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      setPhase('summary');
    }
  };

  // ── Sauvegarde finale ──
  const handleSave = async () => {
    setSaving(true);
    try {
      // Parser le budget
      const budget = answers.budget || '0-999999';
      const [minP, maxP] = budget.split('-').map(Number);

      const payload = {
        city:          answers.city        || '',
        category:      answers.category    || '',
        min_price:     minP,
        max_price:     maxP,
        furnished:     answers.furnished === 'true' ? true
                       : answers.furnished === 'false' ? false : null,
        features:      answers.features   || [],
        nearby_places: answers.nearby      || [],
        priority:      answers.priority    || 'price',
      };

      // Sauvegarder en localStorage pour usage hors-ligne
      localStorage.setItem(
        `preferences_${user?.id || user?.username || 'guest'}`,
        JSON.stringify(payload)
      );

      // Envoyer au backend si connecté
      if (user) {
        await api.post('/housings/preferences/', payload);
      }

      onComplete(payload);
    } catch (err) {
      console.error('Erreur sauvegarde préférences:', err);
      // On appelle quand même onComplete avec les données locales
      onComplete(answers);
    } finally {
      setSaving(false);
    }
  };

  // ── Progress ──
  const progress = phase === 'quiz' ? ((step + 1) / total) * 100 : 0;

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="quiz-overlay" onClick={(e) => e.target === e.currentTarget && onSkip()}>
      <div className="quiz-modal">

        {/* ── INTRO ── */}
        {phase === 'intro' && (
          <div className="quiz-phase quiz-intro">
            <div className="quiz-icon-big">🧬</div>
            <h2>Personnalisez vos recommandations</h2>
            <p>
              Notre algorithme génétique analyse vos préférences pour vous proposer
              les logements les plus adaptés à votre profil.
            </p>
            <p className="quiz-time">⏱️ 2 minutes · {total} questions</p>
            <div className="quiz-intro-actions">
              <button className="quiz-btn quiz-btn--primary" onClick={() => setPhase('quiz')}>
                Commencer le quiz
              </button>
              <button className="quiz-btn quiz-btn--ghost" onClick={onSkip}>
                Passer pour l'instant
              </button>
            </div>
          </div>
        )}

        {/* ── QUIZ ── */}
        {phase === 'quiz' && (
          <div className="quiz-phase quiz-question">
            {/* Header */}
            <div className="quiz-header">
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="quiz-step-label">
                Question {step + 1} / {total}
              </div>
              <button className="quiz-close" onClick={onSkip} aria-label="Fermer">✕</button>
            </div>

            {/* Question */}
            <div className="quiz-body">
              <div className="quiz-question-icon">{q.icon}</div>
              <h3 className="quiz-question-text">{q.question}</h3>
              {q.type === 'multi' && (
                <p className="quiz-multi-hint">Sélectionnez une ou plusieurs réponses</p>
              )}

              <div className={`quiz-options ${q.type === 'multi' ? 'quiz-options--multi' : ''}`}>
                {q.options.map(opt => {
                  const selected = q.type === 'multi'
                    ? (answers[q.id] || []).includes(opt.value)
                    : answers[q.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      className={`quiz-option ${selected ? 'selected' : ''}`}
                      onClick={() => q.type === 'multi' ? handleMulti(opt.value) : handleSingle(opt.value)}
                    >
                      <span className="quiz-option-emoji">{opt.emoji}</span>
                      <span className="quiz-option-label">{opt.label}</span>
                      {selected && <span className="quiz-option-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer multi */}
            {q.type === 'multi' && (
              <div className="quiz-footer">
                {step > 0 && (
                  <button className="quiz-btn quiz-btn--ghost" onClick={() => setStep(s => s - 1)}>
                    ← Précédent
                  </button>
                )}
                <button
                  className="quiz-btn quiz-btn--primary"
                  onClick={handleMultiNext}
                >
                  {step < total - 1 ? 'Suivant →' : 'Voir le résumé'}
                </button>
              </div>
            )}

            {/* Navigation single */}
            {q.type === 'single' && step > 0 && (
              <div className="quiz-footer">
                <button className="quiz-btn quiz-btn--ghost" onClick={() => setStep(s => s - 1)}>
                  ← Précédent
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── RÉSUMÉ ── */}
        {phase === 'summary' && (
          <div className="quiz-phase quiz-summary">
            <div className="quiz-icon-big">✅</div>
            <h2>Votre profil de recherche</h2>
            <p>Voici ce que nous avons retenu. Confirmez pour affiner vos recommandations.</p>

            <div className="quiz-summary-list">
              {answers.city && (
                <div className="summary-item">
                  <span className="summary-key">🏙️ Ville</span>
                  <span className="summary-val">{answers.city}</span>
                </div>
              )}
              {answers.category && (
                <div className="summary-item">
                  <span className="summary-key">🏠 Type</span>
                  <span className="summary-val">{answers.category}</span>
                </div>
              )}
              {answers.budget && (
                <div className="summary-item">
                  <span className="summary-key">💰 Budget</span>
                  <span className="summary-val">
                    {answers.budget === '100000-999999'
                      ? '+ 100 000 FCFA'
                      : answers.budget.replace('-', ' – ') + ' FCFA'}
                  </span>
                </div>
              )}
              {answers.furnished && answers.furnished !== 'any' && (
                <div className="summary-item">
                  <span className="summary-key">🛋️ Meublé</span>
                  <span className="summary-val">{answers.furnished === 'true' ? 'Oui' : 'Non'}</span>
                </div>
              )}
              {answers.features?.length > 0 && (
                <div className="summary-item">
                  <span className="summary-key">⭐ Équipements</span>
                  <span className="summary-val">{answers.features.join(', ')}</span>
                </div>
              )}
              {answers.nearby?.length > 0 && (
                <div className="summary-item">
                  <span className="summary-key">📍 À proximité</span>
                  <span className="summary-val">{answers.nearby.join(', ')}</span>
                </div>
              )}
              {answers.priority && (
                <div className="summary-item">
                  <span className="summary-key">🎯 Priorité</span>
                  <span className="summary-val">
                    {{ price: 'Le prix', location: 'L\'emplacement', comfort: 'Le confort', security: 'La sécurité' }[answers.priority]}
                  </span>
                </div>
              )}
            </div>

            <div className="quiz-summary-actions">
              <button className="quiz-btn quiz-btn--ghost" onClick={() => { setStep(0); setPhase('quiz'); }}>
                ✏️ Modifier
              </button>
              <button className="quiz-btn quiz-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Enregistrement…' : '🚀 Affiner mes suggestions'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PreferenceQuiz;