// API Configuration - Environment Variables First
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (typeof window !== 'undefined' && 
   (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://192.168.1.13:4000' 
    : 'https://cotog-collaborative-editor-production.up.railway.app');

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL;

console.log('🔧 API Config:', {
  envUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  finalUrl: API_BASE_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
});
