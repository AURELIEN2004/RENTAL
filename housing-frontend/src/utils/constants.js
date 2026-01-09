
// ============================================
// src/utils/constants.js
// ============================================

export const HOUSING_STATUS = {
  DISPONIBLE: 'disponible',
  RESERVE: 'reserve',
  OCCUPE: 'occupe',
};

export const VISIT_STATUS = {
  ATTENTE: 'attente',
  CONFIRME: 'confirme',
  REFUSE: 'refuse',
  ANNULE: 'annule',
};

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  VISIT: 'visit',
  VISIT_CONFIRMED: 'visit_confirmed',
  VISIT_REFUSED: 'visit_refused',
  NEW_HOUSING: 'new_housing',
  ADMIN: 'admin',
};

export const PRICE_RANGES = [
  { label: '< 25,000 FCFA', min: 0, max: 25000 },
  { label: '25,000 - 50,000 FCFA', min: 25000, max: 50000 },
  { label: '50,000 - 75,000 FCFA', min: 50000, max: 75000 },
  { label: '75,000 - 100,000 FCFA', min: 75000, max: 100000 },
  { label: '> 100,000 FCFA', min: 100000, max: 1000000 },
];
