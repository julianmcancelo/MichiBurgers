<?php
require_once __DIR__ . '/../_lib/bootstrap.php';
require_once __DIR__ . '/../_lib/storage.php';
require_once __DIR__ . '/../_lib/db.php';
// Guard: si no existen helpers DB, intentar cargarlos
if (!function_exists('db_conn')) {
  @require_once __DIR__ . '/../_lib/db.php';
}

$body = json_body();
$itemId = isset($body['itemId']) ? intval($body['itemId']) : 0;
$estado = isset($body['estado']) ? $body['estado'] : '';
if (!$itemId || !in_array($estado, ['preparando','listo'])) fail('Datos invalidos', 400);

$_pdo = function_exists('db_conn') ? db_conn() : null;
if ($_pdo) {
  try {
    // Verificar que el item existe en la tabla real
    $row = db_one('SELECT id FROM pedido_items WHERE id = ?', [$itemId]);
    if (!$row) fail('Item no encontrado', 404);

    // Asegurar tabla auxiliar para estados
    db_exec("CREATE TABLE IF NOT EXISTS pedido_items_estado (
      item_id INT UNSIGNED PRIMARY KEY,
      estado ENUM('pendiente','preparando','listo') NOT NULL DEFAULT 'pendiente',
      notas VARCHAR(255) NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // UPSERT estado por item
    db_exec(
      'INSERT INTO pedido_items_estado (item_id, estado) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE estado = VALUES(estado)',
      [$itemId, $estado]
    );

    ok(['ok' => true]);
  } catch (Throwable $e) {
    fail('DB error');
  }
} else {
  // Fallback a JSON
  $pedidos = get_pedidos();
  $found = false;
  foreach ($pedidos as &$p) {
    if (!isset($p['items']) || !is_array($p['items'])) continue;
    foreach ($p['items'] as &$it) {
      if (intval($it['itemId']) === $itemId) {
        $it['estado'] = $estado;
        $found = true;
        break 2;
      }
    }
  }
  if (!$found) fail('Item no encontrado', 404);
  save_pedidos($pedidos);
  ok(['ok' => true]);
}
