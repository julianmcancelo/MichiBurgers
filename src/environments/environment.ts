/**
 * Configuración de entorno para desarrollo
 * Este archivo contiene las variables de configuración para el entorno de desarrollo
 */
export const environment = {
  production: false,
  // Durante desarrollo usamos el proxy de Angular para evitar CORS
  // Ver proxy.conf.json y angular.json (serve.development.proxyConfig)
  baseUrl: 'http://localhost:4200',
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
