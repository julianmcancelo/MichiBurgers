<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

// Lee orígenes permitidos desde env (coma separada). Si no hay, usa defaults seguros.
// Ej: CORS_ALLOWED_ORIGINS="https://michiburger.vercel.app,https://burguersaurio.jcancelo.dev,*.vercel.app,https://localhost:4200"
$allowedRaw = $_ENV['CORS_ALLOWED_ORIGINS']
  ?? getenv('CORS_ALLOWED_ORIGINS')
  ?? '';

// Defaults si no hay env definida
$defaultAllowed = [
  'http://localhost',
  'http://localhost:4200',
  'http://127.0.0.1',
  'http://127.0.0.1:4200',
  'https://michiburger.vercel.app',
  'https://burguersaurio.jcancelo.dev',
];

$allowedList = array_values(array_filter(array_map('trim', explode(',', (string)$allowedRaw))));
if (count($allowedList) === 0) {
  $allowedList = $defaultAllowed;
}

$reqOrigin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');

// Soporte simple de comodines de subdominio: *.vercel.app
$isAllowed = function(string $origin, array $allowed) : bool {
  if ($origin === '') return false;
  foreach ($allowed as $pat) {
    if ($pat === '*') return true; // permitir todo (no recomendado con credenciales)
    if (strcasecmp($origin, $pat) === 0) return true; // match exacto
    // comodín al inicio
    if (str_starts_with($pat, '*.') && strlen($origin) >= strlen($pat) - 1) {
      $suffix = substr($pat, 1); // quitar '*'
      if (str_ends_with(strtolower($origin), strtolower($suffix))) return true;
    }
  }
  return false;
};

$originHeader = '*';
if (in_array('*', $allowedList, true)) {
  $originHeader = '*';
} elseif ($isAllowed($reqOrigin, $allowedList)) {
  $originHeader = $reqOrigin;
}

header('Access-Control-Allow-Origin: ' . $originHeader);
header('Vary: Origin');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

// Si usas cookies/credenciales, cambia a: header('Access-Control-Allow-Credentials: true') y
// NO uses '*' en Access-Control-Allow-Origin. Nuestro default evita credenciales.

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
