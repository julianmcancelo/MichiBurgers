<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/cors.php';

header('Content-Type: application/json');

try {
  $raw = file_get_contents('php://input');
  $body = json_decode($raw, true) ?? [];
  $pedido_id = (int)($body['pedido_id'] ?? 0);
  $nota = $body['nota'] ?? null;
  $revisor = $body['revisado_por'] ?? 'admin';

  if ($pedido_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'pedido_id inválido']);
    exit;
  }

  $pdo = db();
  $pdo->beginTransaction();

  // Traer el pedido a aprobar
  $stmt = $pdo->prepare("SELECT id, total, pago_metodo, pago_estado FROM pedidos WHERE id = :id FOR UPDATE");
  $stmt->execute([':id' => $pedido_id]);
  $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$pedido) {
    $pdo->rollBack();
    http_response_code(404);
    echo json_encode(['error' => 'Pedido no encontrado']);
    exit;
  }
  if ($pedido['pago_metodo'] !== 'transferencia') {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['error' => 'El pedido no es de transferencia']);
    exit;
  }
  if ($pedido['pago_estado'] === 'aprobado') {
    $pdo->commit();
    echo json_encode(['ok' => true, 'already' => true]);
    exit;
  }
  if ($pedido['pago_estado'] === 'rechazado') {
    $pdo->rollBack();
    http_response_code(409);
    echo json_encode(['error' => 'El pago ya fue rechazado']);
    exit;
  }

  // Aprobar
  $upd = $pdo->prepare("UPDATE pedidos SET pago_estado='aprobado', pago_revision_nota=:nota, pago_revisado_por=:user, pago_revisado_en=NOW() WHERE id=:id");
  $upd->execute([':nota' => $nota, ':user' => $revisor, ':id' => $pedido_id]);

  // Registrar pago en 'pagos' usando 'efectivo' como marcador para transferencia
  $insPago = $pdo->prepare("INSERT INTO pagos (pedido_id, metodo, monto) VALUES (:id, 'efectivo', :monto)");
  $insPago->execute([':id' => $pedido_id, ':monto' => $pedido['total']]);

  $pdo->commit();
  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) { $pdo->rollBack(); }
  error_log('aprobar-transferencia error: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor al aprobar transferencia']);
}
