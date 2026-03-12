// src/components/quiz/PreferenceQuiz.jsx
// Quiz de préférences logement — alimente l'algorithme génétique
// Sauvegarde en localStorage ET envoie au backend API

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './PreferenceQuiz.css';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Données du quiz ──────────────────────────────────────────────────────────
// const QUESTIONS = [
//   {
//     id: 'city',
//     icon: '🏙️',
//     question: 'Dans quelle ville cherchez-vous ?',
//     type: 'single',
//     options: [
//       { value: 'Yaoundé',    label: 'Yaoundé',    emoji: '🏛️' },
//       { value: 'Douala',     label: 'Douala',     emoji: '🌊' },
//       { value: 'Bafoussam',  label: 'Bafoussam',  emoji: '🏔️' },
//       { value: 'Autre',      label: 'Autre ville', emoji: '📍' },
//     ],
//   },
//   {
//     id: 'category',
//     icon: '🏠',
//     question: 'Quel type de logement recherchez-vous ?',
//     type: 'single',
//     options: [
//       { value: 'Studio',       label: 'Studio',       emoji: '🛏️' },
//       { value: 'Chambre',      label: 'Chambre',      emoji: '🚪' },
//       { value: 'Appartement',  label: 'Appartement',  emoji: '🏢' },
//       { value: 'Maison',       label: 'Maison / Villa', emoji: '🏡' },
//     ],
//   },
//   {
//     id: 'budget',
//     icon: '💰',
//     question: 'Quel est votre budget mensuel ?',
//     type: 'single',
//     options: [
//       { value: '0-30000',         label: 'Moins de 30 000 FCFA',       emoji: '💵' },
//       { value: '30000-60000',     label: '30 000 – 60 000 FCFA',       emoji: '💴' },
//       { value: '60000-100000',    label: '60 000 – 100 000 FCFA',      emoji: '💶' },
//       { value: '100000-999999',   label: 'Plus de 100 000 FCFA',       emoji: '💎' },
//     ],
//   },
//   {
//     id: 'furnished',
//     icon: '🛋️',
//     question: 'Préférez-vous un logement meublé ?',
//     type: 'single',
//     options: [
//       { value: 'true',      label: 'Oui, meublé',              emoji: '✅' },
//       { value: 'false',     label: 'Non, vide',                emoji: '🔲' },
//       { value: 'any',       label: 'Peu importe',              emoji: '🤷' },
//     ],
//   },
//   {
//     id: 'features',
//     icon: '⭐',
//     question: 'Quels équipements sont importants pour vous ?',
//     type: 'multi',
//     options: [
//       { value: 'parking',        label: 'Parking',          emoji: '🚗' },
//       { value: 'wifi',           label: 'Wi-Fi',            emoji: '📶' },
//       { value: 'climatisation',  label: 'Climatisation',    emoji: '❄️' },
//       { value: 'balcon',         label: 'Balcon/Terrasse',  emoji: '🌿' },
//       { value: 'piscine',        label: 'Piscine',          emoji: '🏊' },
//       { value: 'gardien',        label: 'Gardien/Sécurité', emoji: '🔒' },
//       { value: 'eau',            label: 'Eau courante',     emoji: '💧' },
//       { value: 'cuisine',        label: 'Cuisine équipée',  emoji: '🍳' },
//     ],
//   },
//   {
//     id: 'nearby',
//     icon: '📍',
//     question: 'Que souhaitez-vous avoir à proximité ?',
//     type: 'multi',
//     options: [
//       { value: 'school',       label: 'École / Université',  emoji: '🎓' },
//       { value: 'supermarket',  label: 'Supermarché',         emoji: '🛒' },
//       { value: 'hospital',     label: 'Hôpital / Clinique',  emoji: '🏥' },
//       { value: 'transport',    label: 'Transport en commun', emoji: '🚌' },
//       { value: 'bank',         label: 'Banque / ATM',        emoji: '🏦' },
//       { value: 'restaurant',   label: 'Restaurants',         emoji: '🍽️' },
//     ],
//   },
//   {
//     id: 'priority',
//     icon: '🎯',
//     question: 'Qu\'est-ce qui compte le plus dans votre choix ?',
//     type: 'single',
//     options: [
//       { value: 'price',     label: 'Le prix avant tout',      emoji: '💰' },
//       { value: 'location',  label: 'L\'emplacement',          emoji: '📌' },
//       { value: 'comfort',   label: 'Le confort / équipements', emoji: '🛋️' },
//       { value: 'security',  label: 'La sécurité du quartier', emoji: '🛡️' },
//     ],
//   },
// ];
const getQuestions = (t) => [
  {
    id: 'city',
    icon: '🏙️',
    question: t('quiz_q_city'),
    type: 'single',
    options: [
      { value: 'Yaoundé',   label: t('quiz_city_yaounde'), emoji: '🏛️' },
      { value: 'Douala',    label: t('quiz_city_douala'),  emoji: '🌊' },
      { value: 'Bafoussam', label: t('quiz_city_bafoussam'), emoji: '🏔️' },
      { value: 'Autre',     label: t('quiz_city_other'),   emoji: '📍' },
    ],
  },
  {
    id: 'category',
    icon: '🏠',
    question: t('quiz_q_category'),
    type: 'single',
    options: [
      { value: 'Studio',      label: t('quiz_cat_studio'), emoji: '🛏️' },
      { value: 'Chambre',     label: t('quiz_cat_room'),   emoji: '🚪' },
      { value: 'Appartement', label: t('quiz_cat_apartment'), emoji: '🏢' },
      { value: 'Maison',      label: t('quiz_cat_house'),  emoji: '🏡' },
    ],
  },
  {
    id: 'budget',
    icon: '💰',
    question: t('quiz_q_budget'),
    type: 'single',
    options: [
      { value: '0-30000', label: t('quiz_budget_1'), emoji: '💵' },
      { value: '30000-60000', label: t('quiz_budget_2'), emoji: '💴' },
      { value: '60000-100000', label: t('quiz_budget_3'), emoji: '💶' },
      { value: '100000-999999', label: t('quiz_budget_4'), emoji: '💎' },
    ],
  },
  {
    id: 'furnished',
    icon: '🛋️',
    question: t('quiz_q_furnished'),
    type: 'single',
    options: [
      { value: 'true',  label: t('quiz_furnished_yes'), emoji: '✅' },
      { value: 'false', label: t('quiz_furnished_no'),  emoji: '🔲' },
      { value: 'any',   label: t('quiz_furnished_any'), emoji: '🤷' },
    ],
  },
  {
    id: 'features',
    icon: '⭐',
    question: t('quiz_q_features'),
    type: 'multi',
    options: [
      { value: 'parking', label: t('quiz_feat_parking'), emoji: '🚗' },
      { value: 'wifi', label: t('quiz_feat_wifi'), emoji: '📶' },
      { value: 'climatisation', label: t('quiz_feat_ac'), emoji: '❄️' },
      { value: 'balcon', label: t('quiz_feat_balcony'), emoji: '🌿' },
      { value: 'piscine', label: t('quiz_feat_pool'), emoji: '🏊' },
      { value: 'gardien', label: t('quiz_feat_security'), emoji: '🔒' },
      { value: 'eau', label: t('quiz_feat_water'), emoji: '💧' },
      { value: 'cuisine', label: t('quiz_feat_kitchen'), emoji: '🍳' },
    ],
  },
  {
    id: 'nearby',
    icon: '📍',
    question: t('quiz_q_nearby'),
    type: 'multi',
    options: [
      { value: 'school', label: t('quiz_near_school'), emoji: '🎓' },
      { value: 'supermarket', label: t('quiz_near_market'), emoji: '🛒' },
      { value: 'hospital', label: t('quiz_near_hospital'), emoji: '🏥' },
      { value: 'transport', label: t('quiz_near_transport'), emoji: '🚌' },
      { value: 'bank', label: t('quiz_near_bank'), emoji: '🏦' },
      { value: 'restaurant', label: t('quiz_near_restaurant'), emoji: '🍽️' },
    ],
  },
  {
    id: 'priority',
    icon: '🎯',
    question: t('quiz_q_priority'),
    type: 'single',
    options: [
      { value: 'price', label: t('quiz_priority_price'), emoji: '💰' },
      { value: 'location', label: t('quiz_priority_location'), emoji: '📌' },
      { value: 'comfort', label: t('quiz_priority_comfort'), emoji: '🛋️' },
      { value: 'security', label: t('quiz_priority_security'), emoji: '🛡️' },
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
const { t, language, theme } = useTheme();
  // const total = QUESTIONS.length;
  // const q     = QUESTIONS[step];
  const QUESTIONS = getQuestions(t);
const total = QUESTIONS.length;
const q = QUESTIONS[step];

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
            <h2>{t('quiz_title')}</h2>
        <p>{t('quiz_desc')}</p>
<p className="quiz-time">{t('quiz_time')}</p>
            <div className="quiz-intro-actions">
              <button className="quiz-btn quiz-btn--primary" onClick={() => setPhase('quiz')}>
               {t('quiz_start')}
              </button>
              <button className="quiz-btn quiz-btn--ghost" onClick={onSkip}>
                {t('quiz_skip')}
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
                {t('quiz_title')} {step + 1} / {total}
              </div>
              <button className="quiz-close" onClick={onSkip} aria-label="Fermer">✕</button>
            </div>

            {/* Question */}
            <div className="quiz-body">
              <div className="quiz-question-icon">{q.icon}</div>
              <h3 className="quiz-question-text">{q.question}</h3>
              {q.type === 'multi' && (
               <p className="quiz-multi-hint">
  {t('quiz_multi_hint')}
</p>
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
                     {t('quiz_prev')}
                  </button>
                )}
                <button
                  className="quiz-btn quiz-btn--primary"
                  onClick={handleMultiNext}
                >
{step < total - 1 ? t('quiz_next') : t('quiz_summary_title')}                </button>
              </div>
            )}

            {/* Navigation single */}
            {q.type === 'single' && step > 0 && (
              <div className="quiz-footer">
                <button className="quiz-btn quiz-btn--ghost" onClick={() => setStep(s => s - 1)}>
                  {t('quiz_prev')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── RÉSUMÉ ── */}
        {phase === 'summary' && (
          <div className="quiz-phase quiz-summary">
            <div className="quiz-icon-big">✅</div>
            <h2>{t('quiz_profile_title')}</h2>
<p>{t('quiz_profile_desc')}</p>

            <div className="quiz-summary-list">
              {answers.city && (
                <div className="summary-item">
                  <span className="summary-key">🏙️ {t('quiz_q_city')}</span>
                  <span className="summary-val">{t(`quiz_city_${answers.city}`)}</span>
                </div>
              )}
              {answers.category && (
        <div className="summary-item">
          <span className="summary-key">🏠 {t('quiz_q_category')}</span>
          <span className="summary-val">
            {t(`quiz_cat_${answers.category}`)}
          </span>
        </div>
      )}
             {answers.budget && (
        <div className="summary-item">
          <span className="summary-key">💰 {t('quiz_q_budget')}</span>
          <span className="summary-val">
            {answers.budget === '100000-999999'
              ? t('quiz_budget_4')
              : `${answers.budget.replace('-', ' – ')} FCFA`}
          </span>
        </div>
      )}
              {answers.furnished && answers.furnished !== 'any' && (
        <div className="summary-item">
          <span className="summary-key">🛋️ {t('quiz_q_furnished')}</span>
          <span className="summary-val">
            {answers.furnished === 'true'
              ? t('quiz_furnished_yes')
              : t('quiz_furnished_no')}
          </span>
        </div>
      )}
             
      {answers.features?.length > 0 && (
        <div className="summary-item">
          <span className="summary-key">⭐ {t('quiz_q_features')}</span>
          <span className="summary-val">
            {answers.features.map(f => t(`quiz_feat_${f}`)).join(', ')}
          </span>
        </div>
      )}

      {answers.nearby?.length > 0 && (
        <div className="summary-item">
          <span className="summary-key">📍 {t('quiz_q_nearby')}</span>
          <span className="summary-val">
            {answers.nearby.map(n => t(`quiz_near_${n}`)).join(', ')}
          </span>
        </div>
      )}

      {answers.priority && (
        <div className="summary-item">
          <span className="summary-key">🎯 {t('quiz_q_priority')}</span>
          <span className="summary-val">
            {t(`quiz_priority_${answers.priority}`)}
          </span>
        </div>
      )}
            </div>

            <div className="quiz-summary-actions">
              <button className="quiz-btn quiz-btn--ghost" onClick={() => { setStep(0); setPhase('quiz'); }}>
                 {t('quiz_edit')}
              </button>
              <button className="quiz-btn quiz-btn--primary" onClick={handleSave} disabled={saving}>
{saving ? t('quiz_saving') : t('quiz_confirm')}              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PreferenceQuiz;