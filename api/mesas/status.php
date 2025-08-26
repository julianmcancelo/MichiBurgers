<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

$area = ($_GET['area'] ?? 'interior');
if (!in_array($area, ['interior','exterior'], true)) {
  http_response_code(400);
  echo json_encode(['error' => 'Área inválida']);
  exit;
}

try {
  // Cargar layout para saber qué mesas existen en el área
  $stmt = db()->prepare('SELECT data FROM layouts WHERE area = :area LIMIT 1');
  $stmt->execute([':area' => $area]);
  $row = $stmt->fetch();
  $mesas = [];
  if ($row) {
    $data = json_decode($row['data'] ?? '[]', true);
    if (is_array($data)) {
      foreach ($data as $m) {
        if (isset($m['id'])) {
          $mesas[$m['id']] = ['mesaId' => $m['id'], 'estado' => 'libre', 'pedidoId' => null];
        }
      }
    }
  }

  // Traer estados ocupados para el área
  $q = 'SELECT mesa_id, estado, pedido_id FROM mesas_estado WHERE area = :area';
  $st2 = db()->prepare($q);
  $st2->execute([':area' => $area]);
  $pedidoIds = [];
  while ($r = $st2->fetch()) {
    $mid = $r['mesa_id'];
    if (!isset($mesas[$mid])) {
      $mesas[$mid] = ['mesaId' => $mid, 'estado' => 'libre', 'pedidoId' => null];
    }
    $mesas[$mid]['estado'] = $r['estado'];
    $pid = $r['pedido_id'] ? (int)$r['pedido_id'] : null;
    $mesas[$mid]['pedidoId'] = $pid;
    if ($pid) { $pedidoIds[$pid] = true; }
  }

  // Cargar estado de pedidos en lote para las mesas ocupadas
  if (!empty($pedidoIds)) {
    $ids = array_keys($pedidoIds);
    $in = implode(',', array_fill(0, count($ids), '?'));
    // Traemos también pago_estado para marcar correctamente 'pagado' tras aprobación de transferencia
    $st3 = db()->prepare("SELECT id, estado, pago_estado FROM pedidos WHERE id IN ($in)");
    $st3->execute($ids);
    $map = [];
    while ($p = $st3->fetch()) {
      $map[(int)$p['id']] = [
        'estado' => (string)$p['estado'],
        'pago_estado' => isset($p['pago_estado']) ? (string)$p['pago_estado'] : null,
      ];
    }
    foreach ($mesas as &$m) {
      if (!empty($m['pedidoId']) && isset($map[(int)$m['pedidoId']])) {
        $info = $map[(int)$m['pedidoId']];
        $m['pedidoEstado'] = $info['estado'];
        // Consideramos pagado si el estado del pedido es 'pagado' o si el pago fue aprobado (transferencia)
        $m['pagado'] = ($info['estado'] === 'pagado') || ($info['pago_estado'] === 'aprobado');
      }
    }
    unset($m);
  }

  echo json_encode(['area' => $area, 'mesas' => array_values($mesas)]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
