<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

// Soporte CORS preflight y control de métodos
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
  try {
    $stmt->execute([':id' => $pedido_cliente_id]);
  } catch (Throwable $e) {
    error_log('confirmar-pago SELECT pedidos_clientes failed: ' . $e->getMessage());
    throw $e;
  }
  $pedido_cliente = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$pedido_cliente) {
    $pdo->rollBack();
    http_response_code(404);
    echo json_encode(['error' => 'Pedido no encontrado o ya procesado']);
    exit;
  }

  // Normalizar detalles como JSON string o null
  $detalles_json = $detalles !== null ? (is_string($detalles) ? $detalles : json_encode($detalles)) : null;

  // 2. Crear el pedido principal (dejamos created_at por defecto de la DB)
  $stmt = $pdo->prepare(
    'INSERT INTO pedidos (area, mesa_id, cliente_nombre, cliente_telefono, estado, tipo, total, pago_metodo, pago_detalles, pago_referencia, pago_estado)
     VALUES (:area, :mesa_id, :nombre, :tel, \'listo_para_cocina\', \'cliente\', :total, :pago_metodo, :pago_detalles, :pago_ref, :pago_estado)'
  );
  try {
    $stmt->execute([
      ':area' => $pedido_cliente['area'],
      ':mesa_id' => $pedido_cliente['mesa_id'],
      ':nombre' => $pedido_cliente['cliente_nombre'],
      ':tel' => $pedido_cliente['cliente_telefono'],
      ':total' => $pedido_cliente['total'],
      ':pago_metodo' => $metodo,
      ':pago_detalles' => $detalles_json,
      ':pago_ref' => $referencia,
      ':pago_estado' => $metodo === 'transferencia' ? 'pendiente' : null,
    ]);
  } catch (Throwable $e) {
    error_log('confirmar-pago INSERT pedidos failed: ' . $e->getMessage());
    throw $e;
  }
  $pedido_principal_id = (int)$pdo->lastInsertId();

  // 3. Insertar los ítems del pedido
  $items = json_decode($pedido_cliente['items'], true);
  if (!is_array($items) || empty($items)) {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['error' => 'Items inválidos en el pedido del cliente']);
    exit;
  }
  $stmt_items_info = $pdo->prepare('SELECT nombre, precio FROM productos WHERE id = :id');
  $stmt_insert_item = $pdo->prepare(
    'INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio_unit, cantidad, subtotal) VALUES (:pid, :prod_id, :nombre, :precio, :cant, :subtotal)'
  );

  foreach ($items as $producto_id => $cantidad) {
    try {
      $stmt_items_info->execute([':id' => $producto_id]);
    } catch (Throwable $e) {
      error_log('confirmar-pago SELECT producto failed (id=' . $producto_id . '): ' . $e->getMessage());
      throw $e;
    }
    $producto_info = $stmt_items_info->fetch(PDO::FETCH_ASSOC);
    if (!$producto_info || !isset($producto_info['precio'])) {
      $pdo->rollBack();
      http_response_code(400);
      echo json_encode(['error' => 'Producto no válido al confirmar el pedido', 'producto_id' => (int)$producto_id]);
      exit;
    }
    $subtotal = (float)$producto_info['precio'] * (int)$cantidad;

    try {
      $stmt_insert_item->execute([
        ':pid' => $pedido_principal_id,
        ':prod_id' => $producto_id,
        ':nombre' => $producto_info['nombre'],
        ':precio' => $producto_info['precio'],
        ':cant' => $cantidad,
        ':subtotal' => $subtotal
      ]);
    } catch (Throwable $e) {
      error_log('confirmar-pago INSERT item failed (producto_id=' . $producto_id . '): ' . $e->getMessage());
      throw $e;
    }
  }

  // 4. Registrar pago (opcional) y actualizar estado del pedido del cliente a 'pagado'
  // Mapear método para tabla pagos (enum: efectivo, tarjeta, qr, mixto)
  $metodo_pagos = null;
  if ($metodo === 'tarjeta') { $metodo_pagos = 'tarjeta'; }
  elseif ($metodo === 'mercado_pago') { $metodo_pagos = 'qr'; }
  elseif ($metodo === 'transferencia') { $metodo_pagos = null; } // no registramos en pagos hasta que sea aprobado

  if ($metodo_pagos !== null) {
    $stmtPago = $pdo->prepare('INSERT INTO pagos (pedido_id, metodo, monto) VALUES (:pid, :metodo, :monto)');
    try {
      $stmtPago->execute([
        ':pid' => $pedido_principal_id,
        ':metodo' => $metodo_pagos,
        ':monto' => $pedido_cliente['total']
      ]);
    } catch (Throwable $e) {
      error_log('confirmar-pago INSERT pago failed: ' . $e->getMessage());
      throw $e;
    }
  }

  // Cerramos el carrito del cliente como pagado siempre (la aprobación de transferencia se maneja en pedidos.pago_estado)
  // Nota: para evitar violar el índice único (area, mesa_id, estado) cuando ya existe un 'pagado' previo,
  // marcamos cualquier 'pagado' anterior como 'expirado' antes de actualizar este carrito.
  try {
    $stmt = $pdo->prepare('UPDATE pedidos_clientes SET estado = "expirado" WHERE area = :area AND mesa_id = :mesa AND estado = "pagado"');
    $stmt->execute([':area' => $pedido_cliente['area'], ':mesa' => $pedido_cliente['mesa_id']]);
  } catch (Throwable $e) {
    error_log('confirmar-pago UPDATE antiguos pagados failed: ' . $e->getMessage());
    throw $e;
  }

  $nuevo_estado = 'pagado';
  $stmt = $pdo->prepare('UPDATE pedidos_clientes SET estado = :estado WHERE id = :id');
  try {
    $stmt->execute([':estado' => $nuevo_estado, ':id' => $pedido_cliente_id]);
  } catch (Throwable $e) {
    error_log('confirmar-pago UPDATE pedidos_clientes failed: ' . $e->getMessage());
    throw $e;
  }

  // 5. Actualizar estado de la mesa a 'ocupada'
  $stmt = $pdo->prepare(
    "INSERT INTO mesas_estado (area, mesa_id, estado, pedido_id)
     VALUES (:area, :mesa_id, 'ocupada', :pid_ins)
     ON DUPLICATE KEY UPDATE estado = 'ocupada', pedido_id = :pid_upd"
  );
  try {
    $stmt->execute([
        ':area' => $pedido_cliente['area'],
        ':mesa_id' => $pedido_cliente['mesa_id'],
        ':pid_ins' => $pedido_principal_id,
        ':pid_upd' => $pedido_principal_id,
    ]);
  } catch (Throwable $e) {
    error_log('confirmar-pago UPSERT mesas_estado failed: ' . $e->getMessage());
    throw $e;
  }

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
