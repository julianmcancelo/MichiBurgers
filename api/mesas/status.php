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
  while ($r = $st2->fetch()) {
    $mid = $r['mesa_id'];
    if (!isset($mesas[$mid])) {
      $mesas[$mid] = ['mesaId' => $mid, 'estado' => 'libre', 'pedidoId' => null];
    }
    $mesas[$mid]['estado'] = $r['estado'];
    $mesas[$mid]['pedidoId'] = $r['pedido_id'] ? (int)$r['pedido_id'] : null;
  }

  echo json_encode(['area' => $area, 'mesas' => array_values($mesas)]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
