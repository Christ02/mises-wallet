// Utilidades generales del backend

export const formatDate = (date) => {
  return new Date(date).toISOString();
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

