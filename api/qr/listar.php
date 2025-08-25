<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$payload = jwt_parse_from_header();
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isLocalOrigin = preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/', $origin) === 1;
$isLocalAddr = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true);
$allowPublic = (($_ENV['QR_GENERAR_PUBLIC'] ?? '') === '1') || $isLocalAddr || $isLocalOrigin;

if (!$payload && !$allowPublic) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'Token requerido']);
  exit;
}

if ($payload) {
  $roles = [];
  if (isset($payload->rol)) { $roles = is_array($payload->rol) ? $payload->rol : [$payload->rol]; }
  elseif (isset($payload->role)) { $roles = is_array($payload->role) ? $payload->role : [$payload->role]; }
  elseif (isset($payload->roles)) { $roles = is_array($payload->roles) ? $payload->roles : [$payload->roles]; }
  $roles = array_map('strval', $roles);
  if (!array_intersect($roles, ['admin','mozo'])) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'No autorizado']);
    exit;
  }
}

$area = isset($_GET['area']) ? (string)$_GET['area'] : '';
if ($area !== '' && !in_array($area, ['interior','exterior'], true)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Área inválida']);
  exit;
}

try {
  // asegurar tabla
  $sqlCreate = "CREATE TABLE IF NOT EXISTS qr_mesas (
    area ENUM('interior','exterior') NOT NULL,
    mesa_id VARCHAR(20) NOT NULL,
    url TEXT NULL,
    path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (area, mesa_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
  db()->exec($sqlCreate);

  if ($area !== '') {
    $st = db()->prepare('SELECT area, mesa_id, url, path FROM qr_mesas WHERE area = :area ORDER BY area, mesa_id');
    $st->execute([':area' => $area]);
  } else {
    $st = db()->query('SELECT area, mesa_id, url, path FROM qr_mesas ORDER BY area, mesa_id');
  }

  $items = [];
  while ($r = $st->fetch()) {
    $items[] = [
      'area' => (string)$r['area'],
      'mesa' => (string)$r['mesa_id'],
      'url' => isset($r['url']) ? (string)$r['url'] : null,
      'path' => (string)$r['path'],
    ];
  }
  echo json_encode(['ok' => true, 'items' => $items]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Error de servidor']);
}
