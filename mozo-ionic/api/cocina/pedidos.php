<?php
require_once __DIR__ . '/../_lib/bootstrap.php';
require_once __DIR__ . '/../_lib/storage.php';
require_once __DIR__ . '/../_lib/db.php';
// Guard: si por algún motivo no está cargado db.php (hosting/opcache), volver a requerirlo
if (!function_exists('db_enabled')) {
  @require_once __DIR__ . '/../_lib/db.php';
}

// Si hay conexión de DB, leer de SQL. Si no, fallback a JSON.
$__pdo = function_exists('db_conn') ? db_conn() : null;
if ($__pdo) {
  try {
    // Asegurar tabla auxiliar para estados de cocina por item (si no existe)
    db_exec("CREATE TABLE IF NOT EXISTS pedido_items_estado (
      item_id INT UNSIGNED PRIMARY KEY,
      estado ENUM('pendiente','preparando','listo') NOT NULL DEFAULT 'pendiente',
      notas VARCHAR(255) NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Traer pedidos abiertos
    $rowsPedidos = db_all("SELECT p.id AS pedidoId, p.mesa_id AS mesa, p.mozo_legajo AS mozo, p.created_at AS hora
                           FROM pedidos p
                           WHERE p.estado = 'abierto'
                           ORDER BY p.created_at ASC");
    if (!$rowsPedidos) ok([]);

    $ids = array_column($rowsPedidos, 'pedidoId');
    $in = implode(',', array_fill(0, count($ids), '?'));

    // Traer items y su estado (LEFT JOIN a la tabla auxiliar)
    $items = db_all("SELECT i.id AS itemId, i.pedido_id, i.nombre AS producto, i.cantidad, ies.notas,
                            COALESCE(ies.estado, 'pendiente') AS estado
                     FROM pedido_items i
                     LEFT JOIN pedido_items_estado ies ON ies.item_id = i.id
                     WHERE i.pedido_id IN ($in)
                     ORDER BY i.id ASC", $ids);

    // Armar estructura agrupada por pedidoId
    $map = [];
    foreach ($rowsPedidos as $p) {
      $map[$p['pedidoId']] = [
        'pedidoId' => intval($p['pedidoId']),
        'mesa' => $p['mesa'],
        'mozo' => $p['mozo'],
        'hora' => $p['hora'],
        'items' => []
      ];
    }
    foreach ($items as $it) {
      $pid = intval($it['pedido_id']);
      if (!isset($map[$pid])) continue;
      $map[$pid]['items'][] = [
        'itemId' => intval($it['itemId']),
        'producto' => $it['producto'],
        'cantidad' => intval($it['cantidad']),
        'notas' => $it['notas'],
        'estado' => $it['estado']
      ];
    }

    ok(array_values($map));
  } catch (Throwable $e) {
    fail('DB error');
  }
} else {
  // Fallback a JSON
  $pedidos = get_pedidos();
  ok($pedidos);
}
