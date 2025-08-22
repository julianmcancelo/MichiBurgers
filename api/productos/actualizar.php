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

  $categoria_id = isset($body['categoria_id']) ? (int)$body['categoria_id'] : null;
  $nombre = array_key_exists('nombre', $body) ? trim((string)$body['nombre']) : null;
  $descripcion = array_key_exists('descripcion', $body) ? (string)$body['descripcion'] : null;
  $precio = array_key_exists('precio', $body) ? (float)$body['precio'] : null;
  $imagen_url = array_key_exists('imagen_url', $body) ? (string)$body['imagen_url'] : null;
  $activo = array_key_exists('activo', $body) ? (int)!!$body['activo'] : null;

  $sets = [];
  $params = [':id' => $id];
  if ($categoria_id !== null) { $sets[] = 'categoria_id = :cat'; $params[':cat'] = $categoria_id; }
  if ($nombre !== null)       { $sets[] = 'nombre = :nom'; $params[':nom'] = $nombre; }
  if ($descripcion !== null)  { $sets[] = 'descripcion = :des'; $params[':des'] = $descripcion; }
  if ($precio !== null)       { $sets[] = 'precio = :pre'; $params[':pre'] = $precio; }
  if ($imagen_url !== null)   { $sets[] = 'imagen_url = :img'; $params[':img'] = $imagen_url; }
  if ($activo !== null)       { $sets[] = 'activo = :act'; $params[':act'] = $activo; }

  if (empty($sets)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nada para actualizar']);
    exit;
  }

  $pdo = db();
  $sql = 'UPDATE productos SET ' . implode(', ', $sets) . ' WHERE id = :id';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Error de servidor']);
}
