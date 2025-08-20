<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?? [];
$area = (string)($body['area'] ?? 'interior');
$mesaId = trim((string)($body['mesaId'] ?? ''));
$token = isset($body['token']) && is_string($body['token']) ? $body['token'] : '';

if (!in_array($area, ['interior','exterior'], true) || $mesaId === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Datos inválidos']);
  exit;
}

// Autorización: mozo o admin
$payload = jwt_parse_from_header();
if (!$payload && $token !== '') {
  $dec = jwt_decode($token, (string)($_ENV['JWT_SECRET'] ?? ''));
  if (is_array($dec)) $payload = (object)$dec;
}
$rol = $payload->rol ?? '';
$mozo = $payload->legajo ?? '';
if (!in_array($rol, ['admin','mozo'], true) || $mozo === '') {
  http_response_code(403);
  echo json_encode(['error' => 'No autorizado']);
  exit;
}

try {
  $pdo = db();
  $pdo->beginTransaction();

  // Verificar si ya está ocupada
  $st = $pdo->prepare('SELECT estado, pedido_id FROM mesas_estado WHERE area=:area AND mesa_id=:mesa LIMIT 1');
  $st->execute([':area' => $area, ':mesa' => $mesaId]);
  $row = $st->fetch();
  if ($row && $row['estado'] === 'ocupada' && (int)$row['pedido_id'] > 0) {
    $pdo->commit();
    echo json_encode(['ok' => true, 'pedidoId' => (int)$row['pedido_id'], 'yaOcupada' => true]);
    exit;
  }

  // Crear pedido
  $ins = $pdo->prepare('INSERT INTO pedidos (area, mesa_id, estado, mozo_legajo) VALUES (:area, :mesa, "abierto", :mozo)');
  $ins->execute([':area' => $area, ':mesa' => $mesaId, ':mozo' => $mozo]);
  $pedidoId = (int)$pdo->lastInsertId();

  // Marcar mesa ocupada
  $up = $pdo->prepare('INSERT INTO mesas_estado (area, mesa_id, estado, pedido_id) VALUES (:area, :mesa, "ocupada", :pid)
                       ON DUPLICATE KEY UPDATE estado=VALUES(estado), pedido_id=VALUES(pedido_id)');
  $up->execute([':area' => $area, ':mesa' => $mesaId, ':pid' => $pedidoId]);

  $pdo->commit();
  echo json_encode(['ok' => true, 'pedidoId' => $pedidoId]);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
