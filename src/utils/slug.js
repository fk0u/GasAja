/**
 * Generate a URL-safe slug from a title + random suffix.
 * Example: "Nongkrong di Cafe Aesthetik" → "nongkrong-di-cafe-aesthetik-8f3a2b"
 */
export const generateSlug = (title) => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // remove special chars
    .replace(/\s+/g, '-')             // spaces → hyphens
    .replace(/-+/g, '-')              // collapse multiple hyphens
    .replace(/^-|-$/g, '')            // trim hyphens
    .slice(0, 40);                    // max 40 chars

  const rand = Math.random().toString(36).substring(2, 8); // 6 char random
  return `${base}-${rand}`;
};

/**
 * Generate a username from display name.
 * Example: "Kouru Sozo" → "kourusozo"
 * If displayName is empty, derive from email.
 */
export const generateUsername = (displayName, email) => {
  let base;
  if (displayName) {
    base = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
  } else if (email) {
    base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  } else {
    base = 'user';
  }

  // Add random suffix to avoid collisions
  const rand = Math.random().toString(36).substring(2, 6); // 4 char random
  return `${base}${rand}`;
};
