<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/cors.php';

header('Content-Type: application/json');

try {
  $pdo = db();

  $estado = $_GET['estado'] ?? 'pendiente'; // pendiente|aprobado|rechazado|todos
  $limit = (int)($_GET['limit'] ?? 100);
  $offset = (int)($_GET['offset'] ?? 0);

  $where = "p.pago_metodo = 'transferencia'";
  $params = [];
  if ($estado !== 'todos') {
    $where .= ' AND (p.pago_estado ' . ($estado === 'pendiente' ? 'IS NULL OR p.pago_estado = :estado' : '= :estado') . ')';
    $params[':estado'] = $estado === 'pendiente' ? 'pendiente' : $estado;
  }

  $sql = "SELECT 
            p.id,
            p.area,
            p.mesa_id,
            p.cliente_nombre,
            p.cliente_telefono,
            p.total,
            p.estado,
            p.pago_metodo,
            p.pago_detalles,
            p.pago_referencia,
            p.pago_estado,
            p.pago_revision_nota,
            p.pago_revisado_por,
            p.pago_revisado_en,
            p.created_at
          FROM pedidos p
          WHERE $where
          ORDER BY p.created_at DESC
          LIMIT :limit OFFSET :offset";

  $stmt = $pdo->prepare($sql);
  foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
  }
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Parse pago_detalles JSON if present
  foreach ($rows as &$row) {
    if (!empty($row['pago_detalles'])) {
      $decoded = json_decode($row['pago_detalles'], true);
      if (json_last_error() === JSON_ERROR_NONE) {
        $row['pago_detalles_parsed'] = $decoded;
      }
    }
  }

  echo json_encode(['ok' => true, 'data' => $rows]);
} catch (Throwable $e) {
  error_log('listar-transferencias error: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor al listar transferencias']);
}
