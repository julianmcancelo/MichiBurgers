<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';

header('Content-Type: application/json');

try {
  $raw = file_get_contents('php://input');
  $body = json_decode($raw, true) ?? [];

  // 1. Validar datos de entrada
  $area = $body['area'] ?? '';
  $mesa_id = $body['mesa_id'] ?? '';
  $cliente_nombre = trim((string)($body['cliente_nombre'] ?? ''));
  $cliente_telefono = trim((string)($body['cliente_telefono'] ?? ''));
  $items = $body['items'] ?? [];

  if (empty($area) || empty($mesa_id) || empty($cliente_nombre) || empty($items) || !is_array($items)) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos o inválidos']);
    exit;
  }

  $pdo = db();

  // 2. Validar que la mesa no tenga un pedido activo
  $stmt = $pdo->prepare("SELECT id FROM v_mesas_ocupadas WHERE area = :area AND mesa_id = :mesa_id");
  $stmt->execute([':area' => $area, ':mesa_id' => $mesa_id]);
  if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'La mesa ya se encuentra ocupada']);
    exit;
  }

  // 3. Calcular total y validar productos
  $producto_ids = array_keys($items);
  $placeholders = implode(',', array_fill(0, count($producto_ids), '?'));
  $stmt = $pdo->prepare("SELECT id, precio FROM productos WHERE id IN ($placeholders) AND activo = 1");
  $stmt->execute($producto_ids);
  $productos_db = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

  $total = 0;
  $items_validados = [];
  foreach ($items as $producto_id => $cantidad) {
    if (!isset($productos_db[$producto_id]) || !is_numeric($cantidad) || $cantidad <= 0) {
      http_response_code(400);
      echo json_encode(['error' => "Producto o cantidad inválida para el ID $producto_id"]);
      exit;
    }
    $total += $productos_db[$producto_id] * $cantidad;
    $items_validados[$producto_id] = $cantidad;
  }

  // 4. Crear el pedido del cliente (carrito)
  $pedido_id = uuid_v4();
  $expires_at = date('Y-m-d H:i:s', time() + 3600); // Expira en 1 hora

  $stmt = $pdo->prepare(
    'INSERT INTO pedidos_clientes (id, area, mesa_id, cliente_nombre, cliente_telefono, items, total, expires_at) VALUES (:id, :area, :mesa_id, :nombre, :tel, :items, :total, :expira)'
  );
  $stmt->execute([
    ':id' => $pedido_id,
    ':area' => $area,
    ':mesa_id' => $mesa_id,
    ':nombre' => $cliente_nombre,
    ':tel' => $cliente_telefono,
    ':items' => json_encode($items_validados),
    ':total' => $total,
    ':expira' => $expires_at
  ]);

  echo json_encode(['ok' => true, 'pedido_id' => $pedido_id, 'total' => $total]);

} catch (Throwable $e) {
  error_log($e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
