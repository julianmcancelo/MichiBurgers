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

  $categoria_id = isset($body['categoria_id']) ? (int)$body['categoria_id'] : 0;
  $nombre = trim((string)($body['nombre'] ?? ''));
  $descripcion = isset($body['descripcion']) ? (string)$body['descripcion'] : null;
  $precio = isset($body['precio']) ? (float)$body['precio'] : 0.0;
  $imagen_url = isset($body['imagen_url']) ? (string)$body['imagen_url'] : null;
  $activo = isset($body['activo']) ? (int)!!$body['activo'] : 1;

  if ($categoria_id <= 0 || $nombre === '' || $precio <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
  }

  $pdo = db();
  $stmt = $pdo->prepare('INSERT INTO productos (categoria_id, nombre, descripcion, precio, activo, imagen_url) VALUES (:cat, :nom, :des, :pre, :act, :img)');
  $stmt->execute([
    ':cat' => $categoria_id,
    ':nom' => $nombre,
    ':des' => $descripcion,
    ':pre' => $precio,
    ':act' => $activo,
    ':img' => $imagen_url,
  ]);

  echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
