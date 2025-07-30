// API Configuration for COTOG
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     (typeof window !== 'undefined' && 
                      (window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1'));

const API_CONFIG = {
  development: {
    BASE_URL: 'http://192.168.1.13:4000',
    SOCKET_URL: 'http://192.168.1.13:4000'
  },
  production: {
    BASE_URL: 'https://cotog-collaborative-editor-production.up.railway.app',
    SOCKET_URL: 'https://cotog-collaborative-editor-production.up.railway.app'
  }
};

export const getApiConfig = () => {
  return isDevelopment ? API_CONFIG.development : API_CONFIG.production;
};

export const API_BASE_URL = getApiConfig().BASE_URL;
export const SOCKET_URL = getApiConfig().SOCKET_URL;

console.log('🔧 API Config:', {
  isDevelopment,
  apiUrl: API_BASE_URL,
  socketUrl: SOCKET_URL
});