const devUrl = 'http://127.0.0.1:5000';
const prodUrl = 'https://campus-lost-and-found-backend-seven.vercel.app';

let detectedUrl = import.meta.env.VITE_API_BASE_URL || devUrl;

// If deployed/running on a public domain, auto-fallback to production backend if config points to localhost
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  if (detectedUrl.includes('localhost') || detectedUrl.includes('127.0.0.1')) {
    detectedUrl = prodUrl;
  }
}

export const API_BASE_URL = detectedUrl;

