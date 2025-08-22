<?php
// Basic PHP bootstrap for JSON APIs with simple CORS handling
header('Content-Type: application/json; charset=utf-8');

// CORS abierto para que sea visible desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('Access-Control-Expose-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/storage.php';

function json_body() {
  $input = file_get_contents('php://input');
  if (!$input) return [];
  $data = json_decode($input, true);
  return is_array($data) ? $data : [];
}

function ok($data = []) {
  echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}

function fail($message = 'Error', $code = 400) {
  http_response_code($code);
  echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}
