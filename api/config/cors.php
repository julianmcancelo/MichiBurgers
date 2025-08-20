<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

$allowed = $_ENV['CORS_ALLOWED_ORIGINS'] ?? '*';
$originHeader = '*';
if ($allowed !== '*') {
  $origins = array_map('trim', explode(',', $allowed));
  $reqOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ($reqOrigin && in_array($reqOrigin, $origins, true)) {
    $originHeader = $reqOrigin;
  } else {
    $originHeader = $origins[0] ?? '*';
  }
}
header('Access-Control-Allow-Origin: ' . $originHeader);
header('Vary: Origin');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
