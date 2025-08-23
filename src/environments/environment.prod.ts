/**
 * Configuración de entorno para producción
 * Este archivo contiene las variables de configuración para el entorno de producción
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.burgersaurio.com',
  appName: 'Burgersaurio',
  version: '1.0.0',
  enableLogging: false,
  features: {
    qrGenerator: true,
    realTimeNotifications: true,
    analytics: true,
  },
};
