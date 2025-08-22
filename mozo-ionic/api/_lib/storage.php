<?php
// Simple JSON file storage utilities
$DATA_DIR = __DIR__ . '/../_data';
if (!is_dir($DATA_DIR)) { @mkdir($DATA_DIR, 0777, true); }

// Intentar cargar helpers de DB si existen
@require_once __DIR__ . '/db.php';

function data_path($name) {
  global $DATA_DIR;
  return $DATA_DIR . '/' . $name;
}

function load_data($name, $default) {
  $path = data_path($name);
  if (!file_exists($path)) return $default;
  $raw = file_get_contents($path);
  $json = json_decode($raw, true);
  return is_array($json) ? $json : $default;
}

function save_data($name, $data) {
  $path = data_path($name);
  file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
}

function next_id(&$seq, $key) {
  if (!isset($seq[$key])) $seq[$key] = 1;
  return $seq[$key]++;
}

function seed_if_empty() {
  // Si hay DB conectada, no generar datos de ejemplo
  $dbReady = function_exists('db_conn') && db_conn();
  if ($dbReady) return;
  $seq = load_data('seq.json', []);
  $users = load_data('users.json', []);
  $pedidos = load_data('pedidos.json', []);
  $mesas = load_data('mesas.json', []);

  $changed = false;
  if (empty($users)) {
    $users = [
      ['legajo' => '100', 'password' => 'admin', 'nombreCompleto' => 'Admin', 'rol' => 'admin'],
      ['legajo' => '200', 'password' => 'cocina', 'nombreCompleto' => 'Cocinero', 'rol' => 'cocina'],
      ['legajo' => '300', 'password' => 'mozo', 'nombreCompleto' => 'Mozo', 'rol' => 'mozo'],
    ];
    $changed = true;
  }

  if (empty($pedidos)) {
    // Pedido de ejemplo con items en distintos estados
    $pedidoId = next_id($seq, 'pedidoId');
    $pedidos = [
      [
        'pedidoId' => $pedidoId,
        'mesa' => '5',
        'mozo' => 'Juan',
        'hora' => date('H:i'),
        'pagado' => false,
        'items' => [
          ['itemId' => next_id($seq, 'itemId'), 'producto' => 'Hamburguesa Clásica', 'cantidad' => 2, 'estado' => 'pendiente', 'notas' => 'Sin pepino'],
          ['itemId' => next_id($seq, 'itemId'), 'producto' => 'Papas Fritas', 'cantidad' => 1, 'estado' => 'preparando'],
          ['itemId' => next_id($seq, 'itemId'), 'producto' => 'Veggie Burger', 'cantidad' => 1, 'estado' => 'listo']
        ]
      ]
    ];
    $changed = true;
  }

  if (empty($mesas)) {
    // Estado de mesas por area
    $mesas = [
      'interior' => [
        ['mesaId' => '1', 'estado' => 'libre', 'pedidoId' => null, 'pagado' => false],
        ['mesaId' => '2', 'estado' => 'libre', 'pedidoId' => null, 'pagado' => false],
        ['mesaId' => '3', 'estado' => 'ocupada', 'pedidoId' => $pedidos[0]['pedidoId'], 'pagado' => false],
        ['mesaId' => '5', 'estado' => 'ocupada', 'pedidoId' => $pedidos[0]['pedidoId'], 'pagado' => false],
      ],
      'exterior' => [
        ['mesaId' => 'A', 'estado' => 'libre', 'pedidoId' => null, 'pagado' => false],
        ['mesaId' => 'B', 'estado' => 'libre', 'pedidoId' => null, 'pagado' => false]
      ]
    ];
    $changed = true;
  }

  if ($changed) {
    save_data('seq.json', $seq);
    save_data('users.json', $users);
    save_data('pedidos.json', $pedidos);
    save_data('mesas.json', $mesas);
  }
}

seed_if_empty();

// Helper domain functions
function find_user($legajo, $password) {
  $users = load_data('users.json', []);
  foreach ($users as $u) {
    if ($u['legajo'] === $legajo && $u['password'] === $password) return $u;
  }
  return null;
}

function get_pedidos() {
  // Si hay DB, traer datos reales
  $dbReady = function_exists('db_conn') && db_conn();
  if ($dbReady) {
    try {
      // Asegurar tabla auxiliar de estados (no falla si ya existe)
      db_exec("CREATE TABLE IF NOT EXISTS pedido_items_estado (
        item_id INT UNSIGNED PRIMARY KEY,
        estado ENUM('pendiente','preparando','listo') NOT NULL DEFAULT 'pendiente',
        notas VARCHAR(255) NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

      $rowsPedidos = db_all("SELECT p.id AS pedidoId, p.mesa_id AS mesa, p.mozo_legajo AS mozo, p.created_at AS hora, p.estado, p.pagado
                             FROM pedidos p
                             WHERE p.estado IN ('abierto','cerrado')
                             ORDER BY p.created_at DESC LIMIT 200");
      if (!$rowsPedidos) return [];
      $ids = array_column($rowsPedidos, 'pedidoId');
      $in = implode(',', array_fill(0, count($ids), '?'));
      $items = db_all("SELECT i.id AS itemId, i.pedido_id, i.nombre AS producto, i.cantidad, ies.notas,
                              COALESCE(ies.estado, 'pendiente') AS estado
                       FROM pedido_items i
                       LEFT JOIN pedido_items_estado ies ON ies.item_id = i.id
                       WHERE i.pedido_id IN ($in)
                       ORDER BY i.id ASC", $ids);
      $map = [];
      foreach ($rowsPedidos as $p) {
        $map[$p['pedidoId']] = [
          'pedidoId' => intval($p['pedidoId']),
          'mesa' => (string)$p['mesa'],
          'mozo' => (string)$p['mozo'],
          'hora' => (string)$p['hora'],
          'pagado' => (bool)$p['pagado'],
          'items' => []
        ];
      }
      foreach ($items as $it) {
        $pid = intval($it['pedido_id']);
        if (!isset($map[$pid])) continue;
        $map[$pid]['items'][] = [
          'itemId' => intval($it['itemId']),
          'producto' => (string)$it['producto'],
          'cantidad' => intval($it['cantidad']),
          'notas' => $it['notas'],
          'estado' => $it['estado']
        ];
      }
      return array_values($map);
    } catch (Throwable $e) {
      // Si algo falla, usar JSON como respaldo
      return load_data('pedidos.json', []);
    }
  }
  // Sin DB, usar almacenamiento JSON
  return load_data('pedidos.json', []);
}

function save_pedidos($pedidos) {
  // Con DB: intentar persistir estados de items si vienen en la estructura
  $dbReady = function_exists('db_conn') && db_conn();
  if ($dbReady && is_array($pedidos)) {
    try {
      foreach ($pedidos as $p) {
        if (empty($p['items']) || !is_array($p['items'])) continue;
        foreach ($p['items'] as $it) {
          if (!isset($it['itemId']) || !isset($it['estado'])) continue;
          db_exec(
            'INSERT INTO pedido_items_estado (item_id, estado, notas) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE estado = VALUES(estado), notas = VALUES(notas)',
            [intval($it['itemId']), (string)$it['estado'], $it['notas'] ?? null]
          );
        }
      }
      return;
    } catch (Throwable $e) {
      // Si falla, continuar a JSON
    }
  }
  // Fallback a JSON
  save_data('pedidos.json', $pedidos);
}

function get_mesas() {
  return load_data('mesas.json', ['interior' => [], 'exterior' => []]);
}

function save_mesas($mesas) {
  save_data('mesas.json', $mesas);
}
