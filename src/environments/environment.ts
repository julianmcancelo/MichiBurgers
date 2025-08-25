/**
 * Configuración de entorno para desarrollo
 * Este archivo contiene las variables de configuración para el entorno de desarrollo
 */
export const environment = {
  production: false,
  baseUrl: 'http://burguersaurio.jcancelo.dev',
  apiUrl: '/api',
  appName: 'MichiBurgers Dev',
  version: '1.0.0',
  enableLogging: true,
  features: {
    qrGenerator: true,
    realTimeNotifications: true,
    analytics: false,
  },
};
