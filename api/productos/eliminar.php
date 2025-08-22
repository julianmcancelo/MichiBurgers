<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/cors.php';

header('Content-Type: application/json');

try {
  $raw = file_get_contents('php://input');
  $body = json_decode($raw, true) ?? [];

  // Auth: admin only
  $payload = jwt_parse_from_header();
  if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
  }
  $rol = $payload->rol ?? '';
  if (!in_array($rol, ['admin'], true)) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
  }

  $id = isset($body['id']) ? (int)$body['id'] : 0;
  if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
  }

  $pdo = db();
  $stmt = $pdo->prepare('DELETE FROM productos WHERE id = :id');
  $stmt->execute([':id' => $id]);

  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
