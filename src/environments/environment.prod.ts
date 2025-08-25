/**
 * Configuración de entorno para producción
 * Este archivo contiene las variables de configuración para el entorno de producción
 */
export const environment = {
  production: true,
  baseUrl: 'https://burguersaurio.jcancelo.dev/',
  apiUrl: 'https://burguersaurio.jcancelo.dev/api',
  appName: 'MichiBurgers',
  version: '1.0.0',
  enableLogging: false,
  features: {
    qrGenerator: true,
    realTimeNotifications: true,
    analytics: true,
  },
};
