/**
 * Relative time formatter for Indonesian locale.
 * @param {number} ts - Unix timestamp in milliseconds
 * @returns {string} Human-readable relative time string
 */
export const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}h`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}mg`;
  const months = Math.floor(days / 30);
  return `${months}bln`;
};
