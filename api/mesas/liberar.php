<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

// Soporte CORS preflight y métodos permitidos
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Allow: POST, OPTIONS');
  http_response_code(405);
  echo json_encode(['error' => 'Método no permitido']);
  exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?? [];
$area = (string)($body['area'] ?? '');
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
if (!in_array($rol, ['admin','mozo'], true)) {
  http_response_code(403);
  echo json_encode(['error' => 'No autorizado']);
  exit;
}

try {
  $pdo = db();
  $pdo->beginTransaction();

  // Traer estado de la mesa y bloquear
  $st = $pdo->prepare('SELECT estado, pedido_id FROM mesas_estado WHERE area=:area AND mesa_id=:mesa FOR UPDATE');
  $st->execute([':area' => $area, ':mesa' => $mesaId]);
  $row = $st->fetch();

  if (!$row) {
    // Si no existe registro, la creamos como libre (idempotente)
    $ins = $pdo->prepare('INSERT INTO mesas_estado (area, mesa_id, estado, pedido_id) VALUES (:area, :mesa, "libre", NULL)');
    $ins->execute([':area' => $area, ':mesa' => $mesaId]);
    $pdo->commit();
    echo json_encode(['ok' => true, 'creada' => true]);
    exit;
  }

  $estado = (string)$row['estado'];
  $pedidoId = isset($row['pedido_id']) ? (int)$row['pedido_id'] : 0;

  if ($estado === 'libre') {
    // Ya libre: asegurar limpiar pedido_id si quedó basura
    $up = $pdo->prepare('UPDATE mesas_estado SET pedido_id=NULL WHERE area=:area AND mesa_id=:mesa');
    $up->execute([':area' => $area, ':mesa' => $mesaId]);
    $pdo->commit();
    echo json_encode(['ok' => true, 'yaLibre' => true]);
    exit;
  }

  // Si está ocupada y hay pedido, verificar que NO esté en estados considerados "abiertos"
  if ($pedidoId > 0) {
    $p = $pdo->prepare('SELECT estado FROM pedidos WHERE id=:id');
    $p->execute([':id' => $pedidoId]);
    $pedido = $p->fetch();
    // Mismos estados que usa la vista v_mesas_ocupadas
    $estadosAbiertos = ['abierto','listo_para_cocina','en_preparacion','listo_para_entregar'];
    if ($pedido && in_array((string)$pedido['estado'], $estadosAbiertos, true)) {
      $pdo->rollBack();
      http_response_code(400);
      echo json_encode([
        'error' => 'El pedido aún está abierto. Usar pagar.php para cerrar y liberar.',
        'pedido_id' => $pedidoId,
        'estado' => (string)$pedido['estado'],
      ]);
      exit;
    }
  }

  // Liberar mesa
  $up = $pdo->prepare("UPDATE mesas_estado SET estado='libre', pedido_id=NULL WHERE area=:area AND mesa_id=:mesa");
  $up->execute([':area' => $area, ':mesa' => $mesaId]);

  $pdo->commit();
  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  http_response_code(500);
  echo json_encode([
    'error' => 'Error de servidor',
    'detalle' => $e->getMessage(),
  ]);
}
