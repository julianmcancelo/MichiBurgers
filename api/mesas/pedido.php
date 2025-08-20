<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$pedidoId = (int)($_GET['pedidoId'] ?? 0);
if ($pedidoId <= 0) {
  http_response_code(400);
  echo json_encode(['error' => 'pedidoId inválido']);
  exit;
}

try {
  $pdo = db();
  $p = $pdo->prepare('SELECT * FROM pedidos WHERE id = :id LIMIT 1');
  $p->execute([':id' => $pedidoId]);
  $pedido = $p->fetch();
  if (!$pedido) {
    http_response_code(404);
    echo json_encode(['error' => 'Pedido no encontrado']);
    exit;
  }

  $it = $pdo->prepare('SELECT * FROM pedido_items WHERE pedido_id = :id ORDER BY id ASC');
  $it->execute([':id' => $pedidoId]);
  $items = $it->fetchAll();

  echo json_encode(['pedido' => $pedido, 'items' => $items]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
