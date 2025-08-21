<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/cors.php';

$auth = jwt_parse_from_header();
if (!$auth || ($auth->scope ?? '') !== 'master') {
  http_response_code(401);
  echo json_encode(['error' => 'No autorizado']);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  // Devuelve config como objeto clave->valor
  $stmt = db()->query("SELECT `key`, `value` FROM app_config");
  $rows = $stmt->fetchAll();
  $out = [];
  foreach ($rows as $r) {
    $k = (string)$r['key'];
    $v = (string)$r['value'];
    // Intentar decodificar JSON para valores complejos
    $decoded = json_decode($v, true);
    $out[$k] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $v;
  }
  echo json_encode($out);
  exit;
}

if ($method === 'POST' || $method === 'PUT') {
  $input = json_decode(file_get_contents('php://input'), true) ?? [];
  if (!is_array($input)) $input = [];

  $pdo = db();
  $pdo->beginTransaction();
  try {
    $stmt = $pdo->prepare("REPLACE INTO app_config (`key`, `value`) VALUES (:k, :v)");
    foreach ($input as $k => $v) {
      if (!is_string($k) || $k === '') continue;
      $val = is_scalar($v) ? (string)$v : json_encode($v, JSON_UNESCAPED_UNICODE);
      $stmt->execute([':k' => $k, ':v' => $val]);
    }
    $pdo->commit();
  } catch (\Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar']);
    exit;
  }
  echo json_encode(['ok' => true]);
  exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
