// Utility functions for poll expiry handling

export const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
};

export const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return null;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

export const formatExpiryDisplay = (expiresAt) => {
  if (!expiresAt) return null;
  
  const remaining = getTimeRemaining(expiresAt);
  if (!remaining) return '❌ Expired';
  
  return `⏳ Expires in ${remaining}`;
};

export const EXPIRY_OPTIONS = [
  { value: 'no-expiry', label: 'No Expiry' },
  { value: '1-day', label: '1 Day' },
  { value: '3-days', label: '3 Days' },
  { value: '1-week', label: '1 Week' }
];
