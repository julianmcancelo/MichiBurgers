<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/qr.php';

header('Content-Type: application/json');

// Autorización: admin o mozo via JWT Bearer. Se permite acceso público opcional para DEV.
$payload = jwt_parse_from_header();
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isLocalOrigin = preg_match('/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$/', $origin) === 1;
$isLocalAddr = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
$allowPublic = (($_ENV['QR_GENERAR_PUBLIC'] ?? '') === '1') || $isLocalAddr || $isLocalOrigin;

if (!$payload && !$allowPublic) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'Token requerido']);
  exit;
}

// Si hay payload, exigir roles válidos. Si no hay payload pero está permitido público, continuar.
if ($payload) {
  // Aceptar 'rol' o 'role' (string o array) para compatibilidad
  $roles = [];
  if (isset($payload->rol)) {
    $roles = is_array($payload->rol) ? $payload->rol : [$payload->rol];
  } elseif (isset($payload->role)) {
    $roles = is_array($payload->role) ? $payload->role : [$payload->role];
  } elseif (isset($payload->roles)) {
    $roles = is_array($payload->roles) ? $payload->roles : [$payload->roles];
  }
  $roles = array_map('strval', $roles);
  if (!array_intersect($roles, ['admin', 'mozo'])) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'No autorizado']);
    exit;
  }
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?? [];
$area = (string)($body['area'] ?? '');
$mesaId = (string)($body['mesa'] ?? '');
$baseUrl = isset($body['baseUrl']) && is_string($body['baseUrl']) ? trim($body['baseUrl']) : '';

if (!in_array($area, ['interior','exterior'], true) || $mesaId === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Parámetros inválidos']);
  exit;
}

try {
  // Construir la nueva URL para el flujo de cliente
  $path = '/pedido-qr/' . rawurlencode($area) . '/' . rawurlencode($mesaId);
  $url = $baseUrl !== '' ? rtrim($baseUrl, '/') . $path : null;

  echo json_encode([
    'ok' => true,
    'area' => $area,
    'mesa' => $mesaId,
    'sig' => null, // La firma ya no es necesaria
    'path' => $path,
    'url' => $url,
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Error de servidor']);
}
