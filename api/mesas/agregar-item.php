<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?? [];
$pedidoId = (int)($body['pedidoId'] ?? 0);
$productoId = isset($body['productoId']) ? (int)$body['productoId'] : 0;
$cantidad = max(1, (int)($body['cantidad'] ?? 1));
$token = is_string($body['token'] ?? null) ? (string)$body['token'] : '';

if ($pedidoId <= 0 || $productoId <= 0) {
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

  // Verificar pedido abierto
  $p = $pdo->prepare('SELECT estado FROM pedidos WHERE id = :id FOR UPDATE');
  $p->execute([':id' => $pedidoId]);
  $pedido = $p->fetch();
  if (!$pedido || $pedido['estado'] !== 'abierto') {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['error' => 'Pedido no está abierto']);
    exit;
  }

  // Precio y nombre del producto
  $pr = $pdo->prepare('SELECT nombre, precio FROM productos WHERE id = :id AND activo = 1');
  $pr->execute([':id' => $productoId]);
  $prod = $pr->fetch();
  if (!$prod) {
    $pdo->rollBack();
    http_response_code(404);
    echo json_encode(['error' => 'Producto no encontrado']);
    exit;
  }

  $nombre = (string)$prod['nombre'];
  $precio = (float)$prod['precio'];
  $subtotal = $precio * $cantidad;

  // Insertar ítem
  $ins = $pdo->prepare('INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_unit, cantidad, subtotal)
                        VALUES (:pid, :pr, :nom, :pre, :cant, :sub)');
  $ins->execute([':pid' => $pedidoId, ':pr' => $productoId, ':nom' => $nombre, ':pre' => $precio, ':cant' => $cantidad, ':sub' => $subtotal]);

  // Actualizar total del pedido
  $up = $pdo->prepare('UPDATE pedidos SET total = total + :inc WHERE id = :id');
  $up->execute([':inc' => $subtotal, ':id' => $pedidoId]);

  $pdo->commit();
  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
