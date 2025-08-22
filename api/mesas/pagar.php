<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?? [];
$pedidoId = (int)($body['pedidoId'] ?? 0);
$metodo = (string)($body['metodo'] ?? 'efectivo');
$monto = isset($body['monto']) ? (float)$body['monto'] : null; // opcional
$token = is_string($body['token'] ?? null) ? (string)$body['token'] : '';

if ($pedidoId <= 0) {
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
if (!in_array($rol, ['admin','mozo'], true)) {
  http_response_code(403);
  echo json_encode(['error' => 'No autorizado']);
  exit;
}

try {
  $pdo = db();
  $pdo->beginTransaction();

  // Traer pedido y bloquear
  $p = $pdo->prepare('SELECT id, area, mesa_id, estado, total FROM pedidos WHERE id = :id FOR UPDATE');
  $p->execute([':id' => $pedidoId]);
  $pedido = $p->fetch();
  if (!$pedido || $pedido['estado'] !== 'abierto') {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['error' => 'Pedido no está abierto']);
    exit;
  }

  // Registrar pago opcional
  if ($monto !== null) {
    $pg = $pdo->prepare('INSERT INTO pagos (pedido_id, metodo, monto) VALUES (:pid, :met, :mon)');
    $pg->execute([':pid' => $pedidoId, ':met' => $metodo, ':mon' => $monto]);
  }

  // Cerrar pedido (marcar como pagado)
  $c = $pdo->prepare("UPDATE pedidos SET estado='pagado', closed_at=CURRENT_TIMESTAMP WHERE id = :id");
  $c->execute([':id' => $pedidoId]);

  // Importante: NO liberar la mesa automáticamente.
  // El mozo decidirá cuándo liberar desde 'liberar.php'.

  $pdo->commit();
  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
