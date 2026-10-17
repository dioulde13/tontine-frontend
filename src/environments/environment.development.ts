export const environment = {
  production: false,
  // Chemin relatif : `ng serve` route /api/* vers http://localhost:8083 via proxy.conf.json
  // (voir angular.json "serve.options.proxyConfig") — évite tout blocage CORS en développement,
  // sans modifier le backend.
  apiUrl: '/api',
};
