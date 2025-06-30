/**
 * Format timestamps in a social media style
 * Examples: "now", "2m", "3h", "5d", "Jun 15", "Dec 3, 2023"
 */
export const formatSocialTimestamp = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  
  // Less than 1 minute
  if (diffInSeconds < 60) {
    return 'now';
  }
  
  // Less than 1 hour
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }
  
  // Less than 24 hours
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }
  
  // Less than 7 days
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }
  
  // Less than 4 weeks (current year)
  if (diffInWeeks < 4 && date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // More than 4 weeks or different year
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Get a more detailed timestamp for hover/tooltip
 */
export const formatDetailedTimestamp = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
