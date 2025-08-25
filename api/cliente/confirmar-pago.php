<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

try {
  $raw = file_get_contents('php://input');
  $body = json_decode($raw, true) ?? [];

  // Permitir ambas claves por compatibilidad
  $pedido_cliente_id = $body['pedido_cliente_id'] ?? ($body['pedido_id'] ?? '');
  // En un caso real, aquí se procesaría un token de pago. En demo puede venir vacío.
  $payment_token = $body['payment_token'] ?? '';
  $metodo = $body['metodo'] ?? null; // 'tarjeta' | 'mercado_pago' | 'transferencia' | etc
  $detalles = $body['detalles'] ?? null; // string|array (lo guardamos como JSON)
  $referencia = $body['referencia'] ?? null; // opcional (p.ej. último 4 dígitos, nro op, etc)

  if (empty($pedido_cliente_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta ID de pedido de cliente']);
    exit;
  }

  $pdo = db();
  
  // Iniciar transacción
  $pdo->beginTransaction();

  // 1. Buscar el pedido del cliente y bloquear la fila para evitar concurrencia
  $stmt = $pdo->prepare('SELECT * FROM pedidos_clientes WHERE id = :id AND estado = \'pendiente\' FOR UPDATE');
  $stmt->execute([':id' => $pedido_cliente_id]);
  $pedido_cliente = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$pedido_cliente) {
    $pdo->rollBack();
    http_response_code(404);
    echo json_encode(['error' => 'Pedido no encontrado o ya procesado']);
    exit;
  }

  // 2. Crear el pedido principal
  $stmt = $pdo->prepare(
    'INSERT INTO pedidos (area, mesa_id, cliente_nombre, cliente_telefono, estado, tipo, total, pago_metodo, pago_detalles, pago_referencia, created_at)
     VALUES (:area, :mesa_id, :nombre, :tel, \'listo_para_cocina\', \'cliente\', :total, :pago_metodo, :pago_detalles, :pago_ref, :creado)'
  );
  $stmt->execute([
    ':area' => $pedido_cliente['area'],
    ':mesa_id' => $pedido_cliente['mesa_id'],
    ':nombre' => $pedido_cliente['cliente_nombre'],
    ':tel' => $pedido_cliente['cliente_telefono'],
    ':total' => $pedido_cliente['total'],
    ':pago_metodo' => $metodo,
    ':pago_detalles' => $detalles !== null ? json_encode($detalles) : null,
    ':pago_ref' => $referencia,
    ':creado' => $pedido_cliente['created_at']
  ]);
  $pedido_principal_id = (int)$pdo->lastInsertId();

  // 3. Insertar los ítems del pedido
  $items = json_decode($pedido_cliente['items'], true);
  $stmt_items_info = $pdo->prepare('SELECT nombre, precio FROM productos WHERE id = :id');
  $stmt_insert_item = $pdo->prepare(
    'INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_unit, cantidad, subtotal) VALUES (:pid, :prod_id, :nombre, :precio, :cant, :subtotal)'
  );

  foreach ($items as $producto_id => $cantidad) {
    $stmt_items_info->execute([':id' => $producto_id]);
    $producto_info = $stmt_items_info->fetch(PDO::FETCH_ASSOC);
    $subtotal = $producto_info['precio'] * $cantidad;

    $stmt_insert_item->execute([
      ':pid' => $pedido_principal_id,
      ':prod_id' => $producto_id,
      ':nombre' => $producto_info['nombre'],
      ':precio' => $producto_info['precio'],
      ':cant' => $cantidad,
      ':subtotal' => $subtotal
    ]);
  }

  // 4. Registrar pago (opcional) y actualizar estado del pedido del cliente a 'pagado'
  // Mapear método para tabla pagos (enum: efectivo, tarjeta, qr, mixto)
  $metodo_pagos = null;
  if ($metodo === 'tarjeta') { $metodo_pagos = 'tarjeta'; }
  elseif ($metodo === 'mercado_pago') { $metodo_pagos = 'qr'; }
  elseif ($metodo === 'transferencia') { $metodo_pagos = 'efectivo'; } // sin enum específico, usamos efectivo como marcador

  if ($metodo_pagos !== null) {
    $stmtPago = $pdo->prepare('INSERT INTO pagos (pedido_id, metodo, monto) VALUES (:pid, :metodo, :monto)');
    $stmtPago->execute([
      ':pid' => $pedido_principal_id,
      ':metodo' => $metodo_pagos,
      ':monto' => $pedido_cliente['total']
    ]);
  }

  // Actualizar estado del pedido del cliente a 'pagado'
  $stmt = $pdo->prepare('UPDATE pedidos_clientes SET estado = \'pagado\' WHERE id = :id');
  $stmt->execute([':id' => $pedido_cliente_id]);

  // 5. Actualizar estado de la mesa a 'ocupada'
  $stmt = $pdo->prepare(
    "INSERT INTO mesas_estado (area, mesa_id, estado, pedido_id) VALUES (:area, :mesa_id, 'ocupada', :pid) ON DUPLICATE KEY UPDATE estado = 'ocupada', pedido_id = :pid"
  );
  $stmt->execute([
      ':area' => $pedido_cliente['area'],
      ':mesa_id' => $pedido_cliente['mesa_id'],
      ':pid' => $pedido_principal_id
  ]);

  // Confirmar transacción
  $pdo->commit();

  echo json_encode(['ok' => true, 'pedido_id' => $pedido_principal_id]);

} catch (Throwable $e) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }
  error_log($e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor al confirmar el pago']);
}
